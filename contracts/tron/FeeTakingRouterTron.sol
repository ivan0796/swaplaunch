// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/**
 * @title FeeTakingRouterTron
 * @notice Non-custodial router with automatic referral fee splitting for TRON
 * @dev Similar to EVM version but optimized for TRON's energy model
 * 
 * TRON-SPECIFIC OPTIMIZATIONS:
 * - Optimized for TRON's energy consumption model
 * - Compatible with TRC-20 tokens
 * - Works with JustSwap and SunSwap DEXs
 * 
 * REFERRAL SYSTEM:
 * - Users register referral relationships on-chain
 * - Automatic 90/10 fee split (90% platform, 10% referrer)
 * - Fully non-custodial - no backend wallet needed
 * - One-time referral registration per user
 */
contract FeeTakingRouterTron {
    // Owner
    address public owner;

    // Fee configuration
    uint256 public feeBps = 20; // 20 basis points = 0.2%
    uint256 public constant MAX_FEE_BPS = 100; // Max 1%
    uint256 public constant REFERRAL_REWARD_BPS = 1000; // 10% of fee
    
    address public feeRecipient;

    // Referral tracking
    mapping(address => address) public referrers; // user => referrer
    mapping(address => uint256) public referralCount; // referrer => count
    mapping(address => uint256) public totalReferralRewards; // referrer => total earned

    // Whitelisted DEX routers
    mapping(address => bool) public allowedRouters;

    // Reentrancy guard
    uint256 private locked = 1;
    
    modifier noReentrant() {
        require(locked == 1, "No reentrancy");
        locked = 2;
        _;
        locked = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

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
     * @param _feeRecipient Address to receive platform fees
     */
    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        owner = msg.sender;
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice Register a referral relationship
     * @param referrer Address of the referrer
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
     * @notice Execute swap via DEX with automatic fee split
     * @param router DEX router address (JustSwap/SunSwap)
     * @param tokenIn Input token (TRC-20 address)
     * @param tokenOut Output token (TRC-20 address)
     * @param amountIn Amount of input tokens
     * @param amountOutMin Minimum output (slippage protection)
     * @param path Swap path
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
    ) external noReentrant returns (uint256) {
        require(allowedRouters[router], "Router not whitelisted");
        require(amountIn > 0, "Invalid amount");
        require(deadline >= block.timestamp, "Deadline passed");

        // Transfer tokens from user
        _safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);

        // Approve router
        _safeApprove(tokenIn, router, amountIn);

        // Get balance before swap
        uint256 balanceBefore = _balanceOf(tokenOut, address(this));

        // Execute swap via DEX router
        // Note: Using low-level call for flexibility with different DEXs
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
        uint256 balanceAfter = _balanceOf(tokenOut, address(this));
        uint256 amountOut = balanceAfter - balanceBefore;
        require(amountOut >= amountOutMin, "Insufficient output");

        // Calculate fees and distribute
        uint256 totalFee = (amountOut * feeBps) / 10000;
        uint256 userAmount = amountOut - totalFee;

        address referrer = referrers[msg.sender];
        uint256 referralReward = 0;
        uint256 platformFee = totalFee;

        if (referrer != address(0)) {
            // Split fee: 10% to referrer, 90% to platform
            referralReward = (totalFee * REFERRAL_REWARD_BPS) / 10000;
            platformFee = totalFee - referralReward;

            // Transfer referral reward
            if (referralReward > 0) {
                _safeTransfer(tokenOut, referrer, referralReward);
                totalReferralRewards[referrer] += referralReward;
                
                emit ReferralRewardPaid(referrer, msg.sender, tokenOut, referralReward);
            }
        }

        // Transfer platform fee
        if (platformFee > 0) {
            _safeTransfer(tokenOut, feeRecipient, platformFee);
        }

        // Transfer remaining to user
        _safeTransfer(tokenOut, msg.sender, userAmount);

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
     * @notice Execute swap for native TRX
     */
    function swapTRXForTokens(
        address router,
        address tokenOut,
        uint256 amountOutMin,
        address[] calldata path,
        uint256 deadline
    ) external payable noReentrant returns (uint256) {
        require(allowedRouters[router], "Router not whitelisted");
        require(msg.value > 0, "Invalid amount");
        require(deadline >= block.timestamp, "Deadline passed");

        // Get balance before swap
        uint256 balanceBefore = _balanceOf(tokenOut, address(this));

        // Execute swap
        (bool success, ) = router.call{value: msg.value}(
            abi.encodeWithSignature(
                "swapExactTRXForTokens(uint256,address[],address,uint256)",
                amountOutMin,
                path,
                address(this),
                deadline
            )
        );
        require(success, "Swap failed");

        // Calculate output
        uint256 balanceAfter = _balanceOf(tokenOut, address(this));
        uint256 amountOut = balanceAfter - balanceBefore;
        require(amountOut >= amountOutMin, "Insufficient output");

        // Calculate and distribute fees
        uint256 totalFee = (amountOut * feeBps) / 10000;
        uint256 userAmount = amountOut - totalFee;

        address referrer = referrers[msg.sender];
        uint256 referralReward = 0;
        uint256 platformFee = totalFee;

        if (referrer != address(0)) {
            referralReward = (totalFee * REFERRAL_REWARD_BPS) / 10000;
            platformFee = totalFee - referralReward;

            if (referralReward > 0) {
                _safeTransfer(tokenOut, referrer, referralReward);
                totalReferralRewards[referrer] += referralReward;
                emit ReferralRewardPaid(referrer, msg.sender, tokenOut, referralReward);
            }
        }

        if (platformFee > 0) {
            _safeTransfer(tokenOut, feeRecipient, platformFee);
        }

        _safeTransfer(tokenOut, msg.sender, userAmount);

        emit SwapExecuted(
            msg.sender,
            address(0), // TRX
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
     */
    function getReferralInfo(address user) external view returns (address referrer, bool hasReferrer) {
        referrer = referrers[user];
        hasReferrer = referrer != address(0);
    }

    /**
     * @notice Get referrer statistics
     */
    function getReferrerStats(address referrer) external view returns (uint256 count, uint256 totalRewards) {
        count = referralCount[referrer];
        totalRewards = totalReferralRewards[referrer];
    }

    /**
     * @notice Update platform fee
     */
    function updateFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_FEE_BPS, "Fee too high");
        uint256 oldFee = feeBps;
        feeBps = newFeeBps;
        emit FeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @notice Update fee recipient
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @notice Whitelist or remove a DEX router
     */
    function setRouterAllowed(address router, bool allowed) external onlyOwner {
        require(router != address(0), "Invalid router");
        allowedRouters[router] = allowed;
        emit RouterWhitelisted(router, allowed);
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }

    /**
     * @notice Emergency token recovery
     */
    function emergencyRecoverTokens(address token, uint256 amount) external onlyOwner {
        _safeTransfer(token, owner, amount);
    }

    /**
     * @notice Emergency TRX recovery
     */
    function emergencyRecoverTRX() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Internal helper functions for TRC-20 operations

    function _safeTransfer(address token, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }

    function _safeTransferFrom(address token, address from, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TransferFrom failed");
    }

    function _safeApprove(address token, address spender, uint256 value) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("approve(address,uint256)", spender, value)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Approve failed");
    }

    function _balanceOf(address token, address account) internal view returns (uint256) {
        (bool success, bytes memory data) = token.staticcall(
            abi.encodeWithSignature("balanceOf(address)", account)
        );
        require(success, "BalanceOf failed");
        return abi.decode(data, (uint256));
    }

    // Receive TRX
    receive() external payable {}
}
