const { ethers, network } = require("hardhat");

async function main() {
  if (network.name === "localhost" && Number(network.config.chainId) !== 31337) {
    throw new Error("Refusing deployment: expected local Hardhat chain ID 31337.");
  }

  const [administrator] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("EduChainRegistry");
  const registry = await factory.deploy(administrator.address);
  const deployment = await registry.waitForDeployment();
  console.log(`EduChainRegistry deployed to ${await deployment.getAddress()}`);
  console.log(`Chain ID: ${network.config.chainId}`);
  console.log(`Administrator: ${administrator.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
