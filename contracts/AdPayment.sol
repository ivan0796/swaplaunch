// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AdPayment
 * @dev Simple one-time payment contract for automated advertising
 * Non-custodial - funds go directly to treasury
 */
contract AdPayment is ReentrancyGuard, Ownable {
    
    // Treasury address to receive payments
    address public treasury;
    
    // Ad slot configuration
    struct AdSlot {
        uint256 price;              // Price in wei (ETH) or token amount
        address paymentToken;       // ETH = address(0), otherwise ERC20 address
        uint256 duration;           // Duration in seconds (e.g., 30 days)
        bool active;                // Is this slot active?
    }
    
    // Ad purchase record
    struct AdPurchase {
        address advertiser;
        uint256 slotId;
        uint256 paidAt;
        uint256 expiresAt;
        string contentCID;          // IPFS CID or content identifier
        bool active;
    }
    
    // Slot ID => Slot Config
    mapping(uint256 => AdSlot) public adSlots;
    
    // Purchase ID => Purchase Record
    mapping(uint256 => AdPurchase) public adPurchases;
    
    // Current purchase ID counter
    uint256 public purchaseCounter;
    
    // Events
    event AdPaid(
        uint256 indexed purchaseId,
        uint256 indexed slotId,
        address indexed advertiser,
        uint256 amount,
        uint256 expiresAt,
        string contentCID
    );
    
    event SlotConfigured(
        uint256 indexed slotId,
        uint256 price,
        address paymentToken,
        uint256 duration
    );
    
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    
    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }
    
    /**
     * @dev Configure an ad slot (owner only)
     */
    function configureSlot(
        uint256 slotId,
        uint256 price,
        address paymentToken,
        uint256 duration,
        bool active
    ) external onlyOwner {
        require(price > 0, "Price must be > 0");
        require(duration > 0, "Duration must be > 0");
        
        adSlots[slotId] = AdSlot({
            price: price,
            paymentToken: paymentToken,
            duration: duration,
            active: active
        });
        
        emit SlotConfigured(slotId, price, paymentToken, duration);
    }
    
    /**
     * @dev Purchase ad slot with ETH
     */
    function purchaseAdETH(
        uint256 slotId,
        string calldata contentCID
    ) external payable nonReentrant {
        AdSlot memory slot = adSlots[slotId];
        
        require(slot.active, "Slot not active");
        require(slot.paymentToken == address(0), "Slot requires token payment");
        require(msg.value == slot.price, "Incorrect payment amount");
        require(bytes(contentCID).length > 0, "Content CID required");
        
        // Transfer ETH to treasury
        (bool success, ) = treasury.call{value: msg.value}("");
        require(success, "ETH transfer failed");
        
        // Record purchase
        uint256 purchaseId = ++purchaseCounter;
        uint256 expiresAt = block.timestamp + slot.duration;
        
        adPurchases[purchaseId] = AdPurchase({
            advertiser: msg.sender,
            slotId: slotId,
            paidAt: block.timestamp,
            expiresAt: expiresAt,
            contentCID: contentCID,
            active: true
        });
        
        emit AdPaid(purchaseId, slotId, msg.sender, msg.value, expiresAt, contentCID);
    }
    
    /**
     * @dev Purchase ad slot with ERC20 token
     */
    function purchaseAdToken(
        uint256 slotId,
        string calldata contentCID
    ) external nonReentrant {
        AdSlot memory slot = adSlots[slotId];
        
        require(slot.active, "Slot not active");
        require(slot.paymentToken != address(0), "Slot requires ETH payment");
        require(bytes(contentCID).length > 0, "Content CID required");
        
        // Transfer tokens from user to treasury
        IERC20 token = IERC20(slot.paymentToken);
        require(
            token.transferFrom(msg.sender, treasury, slot.price),
            "Token transfer failed"
        );
        
        // Record purchase
        uint256 purchaseId = ++purchaseCounter;
        uint256 expiresAt = block.timestamp + slot.duration;
        
        adPurchases[purchaseId] = AdPurchase({
            advertiser: msg.sender,
            slotId: slotId,
            paidAt: block.timestamp,
            expiresAt: expiresAt,
            contentCID: contentCID,
            active: true
        });
        
        emit AdPaid(purchaseId, slotId, msg.sender, slot.price, expiresAt, contentCID);
    }
    
    /**
     * @dev Check if a purchase is still valid (not expired)
     */
    function isPurchaseActive(uint256 purchaseId) external view returns (bool) {
        AdPurchase memory purchase = adPurchases[purchaseId];
        return purchase.active && block.timestamp < purchase.expiresAt;
    }
    
    /**
     * @dev Update treasury address (owner only)
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    /**
     * @dev Deactivate a slot (owner only)
     */
    function deactivateSlot(uint256 slotId) external onlyOwner {
        adSlots[slotId].active = false;
    }
}
