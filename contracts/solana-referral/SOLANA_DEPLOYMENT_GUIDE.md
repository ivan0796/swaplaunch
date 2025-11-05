# Solana Referral Program - Deployment Guide

## Overview
Complete guide for deploying the SwapLaunch referral program on Solana using Anchor framework.

---

## Prerequisites

### 1. Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

### 2. Install Anchor CLI
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.1
avm use 0.30.1
```

### 3. Install Node.js Dependencies
```bash
cd /app/contracts/solana-referral
yarn install
```

---

## Project Setup

### 1. Create Solana Wallet
```bash
# Generate new keypair
solana-keygen new --outfile ~/.config/solana/id.json

# Show public key
solana address

# Save your seed phrase securely!
```

### 2. Get SOL for Deployment

**Devnet (Testing):**
```bash
# Set cluster to devnet
solana config set --url https://api.devnet.solana.com

# Airdrop SOL
solana airdrop 2

# Check balance
solana balance
```

**Mainnet:**
```bash
# Set cluster to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Buy SOL and send to your wallet address
```

---

## Build & Deploy

### 1. Build the Program
```bash
cd /app/contracts/solana-referral
anchor build
```

### 2. Get Program ID
```bash
# The build generates a keypair at:
# target/deploy/swaplaunch_referral-keypair.json

# Get the program ID:
solana address -k target/deploy/swaplaunch_referral-keypair.json
```

### 3. Update Program ID

Edit `lib.rs` and `Anchor.toml` with your actual program ID:

**lib.rs:**
```rust
declare_id!("YourActualProgramID11111111111111111111");
```

**Anchor.toml:**
```toml
[programs.devnet]
swaplaunch_referral = "YourActualProgramID11111111111111111111"
```

### 4. Rebuild
```bash
anchor build
```

### 5. Deploy to Devnet (Testing)
```bash
anchor deploy --provider.cluster devnet
```

### 6. Deploy to Mainnet (Production)
```bash
# Make sure you have enough SOL for deployment (~5-10 SOL)
solana config set --url https://api.mainnet-beta.solana.com
anchor deploy --provider.cluster mainnet
```

---

## Post-Deployment Configuration

### 1. Initialize the Program
```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SwaplaunchReferral } from "../target/types/swaplaunch_referral";

// Connect to cluster
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.SwaplaunchReferral as Program<SwaplaunchReferral>;

// Initialize with fee config
const feeBps = 20; // 0.2%
const [configPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("config")],
  program.programId
);

await program.methods
  .initialize(feeBps)
  .accounts({
    config: configPda,
    authority: provider.wallet.publicKey,
    feeRecipient: YOUR_FEE_RECIPIENT_PUBKEY,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

console.log("✅ Program initialized!");
```

### 2. Update Backend .env
Add program ID to `/app/backend/.env`:
```bash
# Solana Referral Program
SOLANA_REFERRAL_PROGRAM_ID=YourActualProgramID11111111111111111111
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Fee Recipient (your treasury wallet on Solana)
SOLANA_FEE_RECIPIENT=YourSolanaWalletPublicKey111111111111111
```

---

## Testing

### 1. Run Tests
```bash
anchor test
```

### 2. Test Referral Registration
```typescript
describe("Referral System", () => {
  it("Registers a referral", async () => {
    const user = anchor.web3.Keypair.generate();
    const referrer = anchor.web3.Keypair.generate();
    
    const [userAccountPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    );
    
    await program.methods
      .registerReferral(bump)
      .accounts({
        userAccount: userAccountPda,
        user: user.publicKey,
        referrer: referrer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
    
    const account = await program.account.userAccount.fetch(userAccountPda);
    expect(account.referrer.toString()).to.equal(referrer.publicKey.toString());
    expect(account.isRegistered).to.be.true;
  });
  
  it("Executes swap with fee split", async () => {
    // ... test swap execution with referral reward
  });
});
```

---

## Frontend Integration

### 1. Install Dependencies
```bash
yarn add @coral-xyz/anchor @solana/web3.js @solana/wallet-adapter-react
```

### 2. Connect to Program
```typescript
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import idl from "./idl/swaplaunch_referral.json";

const PROGRAM_ID = new PublicKey("YourProgramID");
const RPC_URL = "https://api.mainnet-beta.solana.com";

export function useReferralProgram() {
  const wallet = useWallet();
  const connection = new Connection(RPC_URL);
  
  const provider = new AnchorProvider(connection, wallet as any, {});
  const program = new Program(idl as any, PROGRAM_ID, provider);
  
  return program;
}
```

### 3. Register Referral
```typescript
import { PublicKey } from "@solana/web3.js";

async function registerReferral(referrerAddress: string) {
  const program = useReferralProgram();
  const wallet = useWallet();
  
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  
  const referrer = new PublicKey(referrerAddress);
  
  const [userAccountPda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), wallet.publicKey.toBuffer()],
    program.programId
  );
  
  const tx = await program.methods
    .registerReferral(bump)
    .accounts({
      userAccount: userAccountPda,
      user: wallet.publicKey,
      referrer: referrer,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  
  console.log("Referral registered! TX:", tx);
  return tx;
}
```

### 4. Check Referrer Stats
```typescript
async function getReferrerStats(referrerAddress: string) {
  const program = useReferralProgram();
  const referrer = new PublicKey(referrerAddress);
  
  const [statsAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("referrer_stats"), referrer.toBuffer()],
    program.programId
  );
  
  try {
    const stats = await program.account.referrerStats.fetch(statsAccount);
    return {
      referralCount: stats.referralCount.toNumber(),
      totalRewards: stats.totalRewards.toNumber() / 1e9, // Convert lamports to SOL
    };
  } catch (e) {
    return { referralCount: 0, totalRewards: 0 };
  }
}
```

---

## Program Architecture

### Account Structure
```
Config PDA: ["config"]
├─ authority: Pubkey
├─ fee_recipient: Pubkey
├─ fee_bps: u16 (20 = 0.2%)
└─ referral_reward_bps: u16 (1000 = 10% of fee)

UserAccount PDA: ["user", user_pubkey]
├─ user: Pubkey
├─ referrer: Pubkey
├─ is_registered: bool
└─ swaps_count: u64

ReferrerStats PDA: ["referrer_stats", referrer_pubkey]
├─ referrer: Pubkey
├─ referral_count: u64
└─ total_rewards: u64 (in lamports)
```

### Instruction Flow

**1. Initialize Program**
```
Authority → initialize(fee_bps) → Config PDA created
```

**2. Register Referral**
```
User → register_referral() → UserAccount PDA created
      ├─ user: User's pubkey
      ├─ referrer: Referrer's pubkey
      └─ is_registered: true
```

**3. Execute Swap**
```
User → execute_swap_with_referral() 
      ├─ Check: UserAccount.referrer exists?
      ├─ YES: Split fee (90% platform, 10% referrer)
      │   ├─ Transfer platform_fee → fee_recipient
      │   ├─ Transfer referral_reward → referrer
      │   └─ Update ReferrerStats
      └─ NO: Full fee → fee_recipient
```

---

## Gas Costs (Approximate)

| Operation | SOL Cost | Notes |
|-----------|----------|-------|
| Deploy Program | 5-10 SOL | One-time |
| Initialize Config | 0.001 SOL | One-time |
| Register Referral | 0.002 SOL | Per user, paid by user |
| Execute Swap | 0.001-0.003 SOL | Per swap, includes fee split |

---

## Security Considerations

### 1. Program Authority
- Use a multisig for program authority
- Consider using Squads Protocol for Solana multisig

### 2. Upgrade Authority
```bash
# Transfer upgrade authority to multisig
solana program set-upgrade-authority \
  <PROGRAM_ID> \
  --new-upgrade-authority <MULTISIG_PUBKEY>
```

### 3. PDA Security
- All PDAs use program-derived addresses (secure by design)
- No private keys stored on-chain
- User cannot modify referrer after registration

### 4. Token Safety
- Uses Anchor's built-in SPL token utilities
- All transfers use CPI (Cross-Program Invocation)
- No direct token manipulation

---

## Monitoring & Analytics

### Listen to Events
```typescript
// Listen for referral registrations
program.addEventListener("ReferralRegistered", (event) => {
  console.log("New referral:", event.user.toString());
  console.log("Referrer:", event.referrer.toString());
});

// Listen for swaps
program.addEventListener("SwapExecuted", (event) => {
  console.log("Swap by:", event.user.toString());
  console.log("Platform fee:", event.platformFee.toNumber());
  console.log("Referral reward:", event.referralReward.toNumber());
});
```

### Query On-Chain Data
```typescript
// Get all user accounts
const users = await program.account.userAccount.all();

// Get all referrer stats
const stats = await program.account.referrerStats.all();

// Calculate totals
const totalReferrals = stats.reduce((sum, s) => sum + s.account.referralCount.toNumber(), 0);
const totalRewards = stats.reduce((sum, s) => sum + s.account.totalRewards.toNumber(), 0);
```

---

## Troubleshooting

### "Program failed to complete"
- Check account sizes are correct
- Verify all required accounts are passed
- Ensure signer is correct

### "Account not found"
- Verify PDA derivation matches program
- Check that account was initialized
- Confirm program ID is correct

### "Insufficient funds"
- Airdrop more SOL on devnet: `solana airdrop 2`
- On mainnet, send SOL to deployer wallet

### "Invalid program ID"
- Rebuild after updating program ID in `lib.rs`
- Verify `Anchor.toml` has correct program ID

---

## Upgrade Program

### 1. Make Changes
Edit `lib.rs` with new features

### 2. Rebuild
```bash
anchor build
```

### 3. Upgrade
```bash
anchor upgrade <PROGRAM_ID> --program-id <PROGRAM_ID>
```

### 4. Verify
```bash
solana program show <PROGRAM_ID>
```

---

## Resources

- **Anchor Docs**: https://anchor-lang.com
- **Solana Cookbook**: https://solanacookbook.com
- **Program Examples**: https://github.com/coral-xyz/anchor/tree/master/tests
- **Solana Explorer**: https://explorer.solana.com

---

## Support

For issues:
- Anchor Discord: https://discord.gg/anchor
- Solana Discord: https://discord.gg/solana
- GitHub Issues: [Your Repo]

---

## License
MIT License
