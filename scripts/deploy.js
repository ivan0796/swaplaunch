const hre = require("hardhat");

/**
 * Deployment script for FeeTakingRouter contract
 * 
 * IMPORTANT:
 * - Update FEE_RECIPIENT with your Gnosis Safe multisig address
 * - Test on testnets first (sepolia, amoy, bscTestnet)
 * - Whitelist DEX routers after deployment
 */

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("\n==================================");
  console.log("SwapLaunch FeeTakingRouter Deployment");
  console.log("==================================");
  console.log(`Network: ${network}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Get fee recipient from environment
  let feeRecipient = process.env.FEE_RECIPIENT_EVM;
  
  if (network === "polygon" || network === "amoy") {
    feeRecipient = process.env.FEE_RECIPIENT_POLY || feeRecipient;
  }

  if (!feeRecipient || feeRecipient === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      "FEE_RECIPIENT not configured! Set FEE_RECIPIENT_EVM in backend/.env\n" +
      "RECOMMENDED: Use a Gnosis Safe multisig address"
    );
  }

  console.log(`Fee Recipient: ${feeRecipient}`);
  console.log(`Fee: 0.2% (20 basis points)\n`);

  // Deploy contract
  console.log("Deploying FeeTakingRouter...");
  const FeeTakingRouter = await hre.ethers.getContractFactory("FeeTakingRouter");
  const router = await FeeTakingRouter.deploy(feeRecipient);
  await router.waitForDeployment();

  const contractAddress = await router.getAddress();
  console.log(`✅ FeeTakingRouter deployed to: ${contractAddress}\n`);

  // Get common DEX router addresses for the network
  const dexRouters = getDEXRouters(network);
  
  if (dexRouters.length > 0) {
    console.log("Suggested DEX routers to whitelist:");
    dexRouters.forEach(dex => {
      console.log(`- ${dex.name}: ${dex.address}`);
    });
    console.log("\nTo whitelist a router, run:");
    console.log(`await router.setRouterAllowed("${dexRouters[0].address}", true);\n`);
  }

  // Verification info
  console.log("==================================");
  console.log("NEXT STEPS:");
  console.log("==================================");
  console.log(`1. Verify contract on explorer:`);  
  console.log(`   npx hardhat verify --network ${network} ${contractAddress} ${feeRecipient}\n`);
  console.log(`2. Transfer ownership to multisig:`);
  console.log(`   await router.transferOwnership("YOUR_GNOSIS_SAFE_ADDRESS");\n`);
  console.log(`3. Whitelist DEX routers (from multisig):`);
  console.log(`   await router.setRouterAllowed(ROUTER_ADDRESS, true);\n`);
  console.log(`4. Update frontend with contract address\n`);

  // Save deployment info
  const deployment = {
    network,
    contractAddress,
    feeRecipient,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    txHash: router.deploymentTransaction().hash
  };

  const fs = require('fs');
  const deploymentsDir = './deployments';
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  fs.writeFileSync(
    `${deploymentsDir}/${network}.json`,
    JSON.stringify(deployment, null, 2)
  );
  console.log(`Deployment info saved to: deployments/${network}.json\n`);
}

/**
 * Get common DEX router addresses for a network
 */
function getDEXRouters(network) {
  const routers = {
    ethereum: [
      { name: "Uniswap V2", address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" },
      { name: "Sushiswap", address: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F" }
    ],
    sepolia: [
      { name: "Uniswap V2", address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" }
    ],
    polygon: [
      { name: "Quickswap", address: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff" },
      { name: "Sushiswap", address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506" }
    ],
    amoy: [
      { name: "Quickswap", address: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff" }
    ],
    bsc: [
      { name: "PancakeSwap V2", address: "0x10ED43C718714eb63d5aA57B78B54704E256024E" }
    ],
    bscTestnet: [
      { name: "PancakeSwap V2", address: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1" }
    ]
  };

  return routers[network] || [];
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });