// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FeeTakingRouter
 * @notice Non-custodial router that takes a platform fee on swaps
 * @dev Designed to work with UniswapV2-style routers
 * 
 * SECURITY NOTES:
 * - Owner should be a Gnosis Safe multisig in production
 * - Fee basis points default to 20 (0.2%)
 * - Only whitelisted routers can be called
 * - Contract does not hold funds
 */
contract FeeTakingRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Fee configuration
    uint256 public feeBps = 20; // 20 basis points = 0.2%
    uint256 public constant MAX_FEE_BPS = 100; // Max 1%
    address public feeRecipient;

    // Whitelisted DEX routers
    mapping(address => bool) public allowedRouters;

    // Events
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeAmount
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
     * @notice Execute swap via whitelisted DEX router with fee
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
        // Note: This is a simplified example. Actual implementation depends on router interface
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

        // Calculate and transfer fee
        uint256 feeAmount = (amountOut * feeBps) / 10000;
        uint256 userAmount = amountOut - feeAmount;

        // Transfer fee to recipient
        if (feeAmount > 0) {
            IERC20(tokenOut).safeTransfer(feeRecipient, feeAmount);
        }

        // Transfer remaining to user
        IERC20(tokenOut).safeTransfer(msg.sender, userAmount);

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, userAmount, feeAmount);

        return userAmount;
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
}