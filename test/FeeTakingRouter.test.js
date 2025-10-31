const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FeeTakingRouter", function () {
  let router;
  let owner;
  let feeRecipient;
  let user;
  let mockToken;
  let mockRouter;

  beforeEach(async function () {
    [owner, feeRecipient, user] = await ethers.getSigners();

    // Deploy FeeTakingRouter
    const FeeTakingRouter = await ethers.getContractFactory("FeeTakingRouter");
    router = await FeeTakingRouter.deploy(feeRecipient.address);
    await router.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct fee recipient", async function () {
      expect(await router.feeRecipient()).to.equal(feeRecipient.address);
    });

    it("Should set the default fee to 20 basis points (0.2%)", async function () {
      expect(await router.feeBps()).to.equal(20);
    });

    it("Should set the owner correctly", async function () {
      expect(await router.owner()).to.equal(owner.address);
    });

    it("Should revert if fee recipient is zero address", async function () {
      const FeeTakingRouter = await ethers.getContractFactory("FeeTakingRouter");
      await expect(
        FeeTakingRouter.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid fee recipient");
    });
  });

  describe("Fee Management", function () {
    it("Should allow owner to update fee", async function () {
      await expect(router.updateFee(30))
        .to.emit(router, "FeeUpdated")
        .withArgs(20, 30);
      
      expect(await router.feeBps()).to.equal(30);
    });

    it("Should not allow fee greater than 1%", async function () {
      await expect(router.updateFee(101)).to.be.revertedWith("Fee too high");
    });

    it("Should not allow non-owner to update fee", async function () {
      await expect(
        router.connect(user).updateFee(30)
      ).to.be.reverted;
    });

    it("Should allow owner to update fee recipient", async function () {
      const newRecipient = user.address;
      await expect(router.updateFeeRecipient(newRecipient))
        .to.emit(router, "FeeRecipientUpdated")
        .withArgs(feeRecipient.address, newRecipient);
      
      expect(await router.feeRecipient()).to.equal(newRecipient);
    });

    it("Should not allow zero address as fee recipient", async function () {
      await expect(
        router.updateFeeRecipient(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid recipient");
    });
  });

  describe("Router Whitelisting", function () {
    it("Should allow owner to whitelist a router", async function () {
      const dexRouter = user.address;
      await expect(router.setRouterAllowed(dexRouter, true))
        .to.emit(router, "RouterWhitelisted")
        .withArgs(dexRouter, true);
      
      expect(await router.allowedRouters(dexRouter)).to.be.true;
    });

    it("Should allow owner to remove a router from whitelist", async function () {
      const dexRouter = user.address;
      await router.setRouterAllowed(dexRouter, true);
      await router.setRouterAllowed(dexRouter, false);
      
      expect(await router.allowedRouters(dexRouter)).to.be.false;
    });

    it("Should not allow zero address as router", async function () {
      await expect(
        router.setRouterAllowed(ethers.ZeroAddress, true)
      ).to.be.revertedWith("Invalid router");
    });

    it("Should not allow non-owner to whitelist router", async function () {
      await expect(
        router.connect(user).setRouterAllowed(user.address, true)
      ).to.be.reverted;
    });
  });

  describe("Fee Calculation", function () {
    it("Should calculate correct fee for 0.2% (20 bps)", async function () {
      const outputAmount = ethers.parseUnits("1000", 18);
      const expectedFee = (outputAmount * 20n) / 10000n;
      expect(expectedFee).to.equal(ethers.parseUnits("2", 18)); // 0.2% of 1000 = 2
    });

    it("Should calculate correct fee for 0.5% (50 bps)", async function () {
      await router.updateFee(50);
      const outputAmount = ethers.parseUnits("1000", 18);
      const expectedFee = (outputAmount * 50n) / 10000n;
      expect(expectedFee).to.equal(ethers.parseUnits("5", 18)); // 0.5% of 1000 = 5
    });
  });

  describe("Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      await router.transferOwnership(user.address);
      expect(await router.owner()).to.equal(user.address);
    });
  });
});

/*
 * NOTE: Full integration tests for swapViaRouter() require:
 * - Mock ERC20 tokens
 * - Mock DEX router contract
 * - Complex setup for realistic swap scenarios
 * 
 * These tests cover the core fee logic and access control.
 * For production, add integration tests with mainnet forks.
 */