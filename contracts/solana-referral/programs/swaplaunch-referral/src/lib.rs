use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("SwapLaunchReferralProgramID111111111111111");

#[program]
pub mod swaplaunch_referral {
    use super::*;

    /// Initialize the referral program
    pub fn initialize(ctx: Context<Initialize>, fee_bps: u16) -> Result<()> {
        require!(fee_bps <= 100, ErrorCode::FeeTooHigh); // Max 1%
        
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.fee_recipient = ctx.accounts.fee_recipient.key();
        config.fee_bps = fee_bps; // Default 20 bps = 0.2%
        config.referral_reward_bps = 1000; // 10% of fees to referrer (1000/10000 = 10%)
        
        msg!("Referral program initialized with fee: {} bps", fee_bps);
        Ok(())
    }

    /// Register a referral relationship
    pub fn register_referral(
        ctx: Context<RegisterReferral>,
        _bump: u8,
    ) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let referrer = ctx.accounts.referrer.key();
        let user = ctx.accounts.user.key();

        require!(user != referrer, ErrorCode::CannotReferSelf);
        require!(user_account.referrer == Pubkey::default(), ErrorCode::ReferralAlreadySet);

        user_account.user = user;
        user_account.referrer = referrer;
        user_account.is_registered = true;
        user_account.swaps_count = 0;
        user_account.bump = _bump;

        msg!("Referral registered: User {} → Referrer {}", user, referrer);
        
        emit!(ReferralRegistered {
            user,
            referrer,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Execute swap with automatic fee split
    /// 
    /// This function:
    /// 1. Takes platform fee from swap output
    /// 2. Checks if user has referrer
    /// 3. Splits fee: 90% to platform, 10% to referrer
    /// 4. Sends remaining tokens to user
    pub fn execute_swap_with_referral(
        ctx: Context<ExecuteSwapWithReferral>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        let config = &ctx.accounts.config;
        
        // Calculate platform fee
        let total_output = amount_in; // This would be actual swap output from DEX
        let total_fee = total_output
            .checked_mul(config.fee_bps as u64)
            .unwrap()
            .checked_div(10000)
            .unwrap();

        require!(total_output >= minimum_amount_out, ErrorCode::SlippageTooHigh);

        // Check if user has referrer
        let user_account = &ctx.accounts.user_account;
        let (platform_fee, referral_reward) = if user_account.is_registered && user_account.referrer != Pubkey::default() {
            // Calculate referral reward (10% of total fee)
            let referral_reward = total_fee
                .checked_mul(config.referral_reward_bps as u64)
                .unwrap()
                .checked_div(10000)
                .unwrap();
            
            let platform_fee = total_fee.checked_sub(referral_reward).unwrap();
            
            msg!("Fee split: Platform {} | Referrer {} (10%)", platform_fee, referral_reward);
            (platform_fee, referral_reward)
        } else {
            msg!("No referrer - full fee to platform: {}", total_fee);
            (total_fee, 0)
        };

        let user_amount = total_output.checked_sub(total_fee).unwrap();

        // Transfer platform fee
        if platform_fee > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.token_out_temp.to_account_info(),
                to: ctx.accounts.fee_recipient_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_ctx, platform_fee)?;
        }

        // Transfer referral reward if applicable
        if referral_reward > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.token_out_temp.to_account_info(),
                to: ctx.accounts.referrer_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_ctx, referral_reward)?;

            // Update referrer stats
            let referrer_stats = &mut ctx.accounts.referrer_stats;
            referrer_stats.total_rewards = referrer_stats.total_rewards.checked_add(referral_reward).unwrap();
            referrer_stats.referral_count = referrer_stats.referral_count.checked_add(1).unwrap();
        }

        // Transfer user amount
        let cpi_accounts = Transfer {
            from: ctx.accounts.token_out_temp.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, user_amount)?;

        // Update user stats
        let user_account = &mut ctx.accounts.user_account;
        user_account.swaps_count = user_account.swaps_count.checked_add(1).unwrap();

        emit!(SwapExecuted {
            user: ctx.accounts.user.key(),
            amount_in,
            amount_out: user_amount,
            platform_fee,
            referral_reward,
            referrer: if user_account.is_registered { user_account.referrer } else { Pubkey::default() },
        });

        Ok(())
    }

    /// Get referrer statistics
    pub fn get_referrer_stats(ctx: Context<GetReferrerStats>) -> Result<()> {
        let stats = &ctx.accounts.referrer_stats;
        msg!("Referrer: {}", ctx.accounts.referrer.key());
        msg!("Total Referrals: {}", stats.referral_count);
        msg!("Total Rewards: {}", stats.total_rewards);
        Ok(())
    }
}

// Account Structures

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Config::SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the fee recipient address
    pub fee_recipient: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterReferral<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + UserAccount::SPACE,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// CHECK: This is the referrer's address
    pub referrer: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteSwapWithReferral<'info> {
    #[account(seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,
    
    #[account(
        mut,
        seeds = [b"user", user.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + ReferrerStats::SPACE,
        seeds = [b"referrer_stats", user_account.referrer.as_ref()],
        bump
    )]
    pub referrer_stats: Account<'info, ReferrerStats>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub token_out_temp: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub fee_recipient_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub referrer_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetReferrerStats<'info> {
    #[account(
        seeds = [b"referrer_stats", referrer.key().as_ref()],
        bump
    )]
    pub referrer_stats: Account<'info, ReferrerStats>,
    
    /// CHECK: This is the referrer's address
    pub referrer: AccountInfo<'info>,
}

// Data Structures

#[account]
pub struct Config {
    pub authority: Pubkey,          // Program authority
    pub fee_recipient: Pubkey,      // Platform fee recipient
    pub fee_bps: u16,               // Platform fee in basis points (20 = 0.2%)
    pub referral_reward_bps: u16,   // Referral reward % of fee (1000 = 10%)
}

impl Config {
    pub const SPACE: usize = 32 + 32 + 2 + 2;
}

#[account]
pub struct UserAccount {
    pub user: Pubkey,               // User's address
    pub referrer: Pubkey,           // Referrer's address
    pub is_registered: bool,        // Has registered a referrer
    pub swaps_count: u64,           // Total swaps made
    pub bump: u8,                   // PDA bump
}

impl UserAccount {
    pub const SPACE: usize = 32 + 32 + 1 + 8 + 1;
}

#[account]
pub struct ReferrerStats {
    pub referrer: Pubkey,           // Referrer's address
    pub referral_count: u64,        // Number of referrals
    pub total_rewards: u64,         // Total rewards earned (in tokens)
}

impl ReferrerStats {
    pub const SPACE: usize = 32 + 8 + 8;
}

// Events

#[event]
pub struct ReferralRegistered {
    pub user: Pubkey,
    pub referrer: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct SwapExecuted {
    pub user: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub platform_fee: u64,
    pub referral_reward: u64,
    pub referrer: Pubkey,
}

// Error Codes

#[error_code]
pub enum ErrorCode {
    #[msg("Fee cannot exceed 1% (100 bps)")]
    FeeTooHigh,
    
    #[msg("Cannot refer yourself")]
    CannotReferSelf,
    
    #[msg("Referral already set for this user")]
    ReferralAlreadySet,
    
    #[msg("Slippage tolerance exceeded")]
    SlippageTooHigh,
}
