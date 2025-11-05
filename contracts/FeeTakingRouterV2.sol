// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FeeTakingRouterV2
 * @notice Non-custodial router with automatic referral fee splitting
 * @dev Extends original router with 10% referral rewards on platform fees
 * 
 * REFERRAL SYSTEM:
 * - Users can register referral relationships on-chain
 * - When referred user swaps: 90% fee to platform, 10% to referrer
 * - Fully non-custodial - no backend wallet needed
 * - One-time referral registration per user
 * 
 * SECURITY:
 * - Owner should be a Gnosis Safe multisig
 * - Fee basis points default to 20 (0.2%)
 * - Only whitelisted routers can be called
 * - Contract does not hold funds beyond the transaction
 */
contract FeeTakingRouterV2 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Fee configuration
    uint256 public feeBps = 20; // 20 basis points = 0.2%
    uint256 public constant MAX_FEE_BPS = 100; // Max 1%
    uint256 public constant REFERRAL_REWARD_BPS = 1000; // 10% of fee (1000 / 10000)
    
    address public feeRecipient;

    // Referral tracking
    mapping(address => address) public referrers; // user => referrer
    mapping(address => uint256) public referralCount; // referrer => count
    mapping(address => uint256) public totalReferralRewards; // referrer => total earned

    // Whitelisted DEX routers
    mapping(address => bool) public allowedRouters;

    // Events
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 platformFee,
        uint256 referralReward,
        address referrer
    );
    
    event ReferralRegistered(
        address indexed user,
        address indexed referrer,
        uint256 timestamp
    );
    
    event ReferralRewardPaid(
        address indexed referrer,
        address indexed user,
        address token,
        uint256 amount
    );
    
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event RouterWhitelisted(address indexed router, bool allowed);

    /**
     * @notice Constructor
     * @param _feeRecipient Address to receive platform fees (should be multisig)
     */
    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice Register a referral relationship
     * @param referrer Address of the referrer
     * @dev Can only be called once per user. User cannot refer themselves.
     */
    function registerReferral(address referrer) external {
        require(referrer != address(0), "Invalid referrer");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(referrers[msg.sender] == address(0), "Referral already registered");
        
        referrers[msg.sender] = referrer;
        referralCount[referrer]++;
        
        emit ReferralRegistered(msg.sender, referrer, block.timestamp);
    }

    /**
     * @notice Execute swap via whitelisted DEX router with automatic fee split
     * @param router DEX router address (must be whitelisted)
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @param amountOutMin Minimum output amount (slippage protection)
     * @param path Swap path for the DEX
     * @param deadline Transaction deadline
     */
    function swapViaRouter(
        address router,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        uint256 deadline
    ) external nonReentrant returns (uint256) {
        require(allowedRouters[router], "Router not whitelisted");
        require(amountIn > 0, "Invalid amount");
        require(deadline >= block.timestamp, "Deadline passed");

        // Transfer tokens from user
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Approve router
        IERC20(tokenIn).safeApprove(router, amountIn);

        // Get balance before swap
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));

        // Execute swap via DEX router
        (bool success, ) = router.call(
            abi.encodeWithSignature(
                "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
                amountIn,
                amountOutMin,
                path,
                address(this),
                deadline
            )
        );
        require(success, "Swap failed");

        // Calculate output amount
        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        uint256 amountOut = balanceAfter - balanceBefore;
        require(amountOut >= amountOutMin, "Insufficient output");

        // Calculate total fee
        uint256 totalFee = (amountOut * feeBps) / 10000;
        uint256 userAmount = amountOut - totalFee;

        // Check if user has a referrer
        address referrer = referrers[msg.sender];
        uint256 referralReward = 0;
        uint256 platformFee = totalFee;

        if (referrer != address(0)) {
            // Split fee: 10% to referrer, 90% to platform
            referralReward = (totalFee * REFERRAL_REWARD_BPS) / 10000;
            platformFee = totalFee - referralReward;

            // Transfer referral reward
            if (referralReward > 0) {
                IERC20(tokenOut).safeTransfer(referrer, referralReward);
                totalReferralRewards[referrer] += referralReward;
                
                emit ReferralRewardPaid(referrer, msg.sender, tokenOut, referralReward);
            }
        }

        // Transfer platform fee to recipient
        if (platformFee > 0) {
            IERC20(tokenOut).safeTransfer(feeRecipient, platformFee);
        }

        // Transfer remaining to user
        IERC20(tokenOut).safeTransfer(msg.sender, userAmount);

        emit SwapExecuted(
            msg.sender, 
            tokenIn, 
            tokenOut, 
            amountIn, 
            userAmount, 
            platformFee, 
            referralReward,
            referrer
        );

        return userAmount;
    }

    /**
     * @notice Execute swap for native ETH/BNB/MATIC with automatic fee split
     * @dev Similar to swapViaRouter but handles native token (ETH/BNB/MATIC)
     */
    function swapETHForTokens(
        address router,
        address tokenOut,
        uint256 amountOutMin,
        address[] calldata path,
        uint256 deadline
    ) external payable nonReentrant returns (uint256) {
        require(allowedRouters[router], "Router not whitelisted");
        require(msg.value > 0, "Invalid amount");
        require(deadline >= block.timestamp, "Deadline passed");

        // Get balance before swap
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));

        // Execute swap via DEX router
        (bool success, ) = router.call{value: msg.value}(
            abi.encodeWithSignature(
                "swapExactETHForTokens(uint256,address[],address,uint256)",
                amountOutMin,
                path,
                address(this),
                deadline
            )
        );
        require(success, "Swap failed");

        // Calculate output amount
        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        uint256 amountOut = balanceAfter - balanceBefore;
        require(amountOut >= amountOutMin, "Insufficient output");

        // Calculate fees and distribute
        uint256 totalFee = (amountOut * feeBps) / 10000;
        uint256 userAmount = amountOut - totalFee;

        address referrer = referrers[msg.sender];
        uint256 referralReward = 0;
        uint256 platformFee = totalFee;

        if (referrer != address(0)) {
            referralReward = (totalFee * REFERRAL_REWARD_BPS) / 10000;
            platformFee = totalFee - referralReward;

            if (referralReward > 0) {
                IERC20(tokenOut).safeTransfer(referrer, referralReward);
                totalReferralRewards[referrer] += referralReward;
                emit ReferralRewardPaid(referrer, msg.sender, tokenOut, referralReward);
            }
        }

        if (platformFee > 0) {
            IERC20(tokenOut).safeTransfer(feeRecipient, platformFee);
        }

        IERC20(tokenOut).safeTransfer(msg.sender, userAmount);

        emit SwapExecuted(
            msg.sender,
            address(0), // Native token
            tokenOut,
            msg.value,
            userAmount,
            platformFee,
            referralReward,
            referrer
        );

        return userAmount;
    }

    /**
     * @notice Get referral info for a user
     * @param user User address
     * @return referrer Referrer address (0x0 if none)
     * @return hasReferrer Whether user has a referrer
     */
    function getReferralInfo(address user) external view returns (address referrer, bool hasReferrer) {
        referrer = referrers[user];
        hasReferrer = referrer != address(0);
    }

    /**
     * @notice Get referrer statistics
     * @param referrer Referrer address
     * @return count Number of referrals
     * @return totalRewards Total rewards earned
     */
    function getReferrerStats(address referrer) external view returns (uint256 count, uint256 totalRewards) {
        count = referralCount[referrer];
        totalRewards = totalReferralRewards[referrer];
    }

    /**
     * @notice Update platform fee
     * @param newFeeBps New fee in basis points (max 100 = 1%)
     */
    function updateFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_FEE_BPS, "Fee too high");
        uint256 oldFee = feeBps;
        feeBps = newFeeBps;
        emit FeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @notice Update fee recipient
     * @param newRecipient New fee recipient address (should be multisig)
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @notice Whitelist or remove a DEX router
     * @param router Router address
     * @param allowed Whether to allow this router
     */
    function setRouterAllowed(address router, bool allowed) external onlyOwner {
        require(router != address(0), "Invalid router");
        allowedRouters[router] = allowed;
        emit RouterWhitelisted(router, allowed);
    }

    /**
     * @notice Emergency token recovery (only owner)
     * @param token Token address
     * @param amount Amount to recover
     */
    function emergencyRecoverTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @notice Emergency ETH recovery (only owner)
     */
    function emergencyRecoverETH() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "ETH transfer failed");
    }

    // Receive function to accept ETH
    receive() external payable {}
}
