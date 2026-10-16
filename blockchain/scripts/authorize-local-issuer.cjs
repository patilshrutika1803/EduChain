const { ethers, network } = require("hardhat");

async function main() {
  if (network.name !== "localhost" || Number(network.config.chainId) !== 31337) {
    throw new Error("Issuer helper is restricted to the local Hardhat network (chain ID 31337).");
  }

  const contractAddress = process.env.EDUCHAIN_CONTRACT_ADDRESS;
  if (!contractAddress || !ethers.isAddress(contractAddress)) {
    throw new Error("Set EDUCHAIN_CONTRACT_ADDRESS to the locally deployed registry address.");
  }

  const [, issuer] = await ethers.getSigners();
  if (!issuer) {
    throw new Error("The local Hardhat node did not expose a second development account.");
  }

  const registry = await ethers.getContractAt("EduChainRegistry", contractAddress);
  const tx = await registry.authorizeIssuer(issuer.address);
  const receipt = await tx.wait();
  if (receipt.status !== 1 || !(await registry.isAuthorizedIssuer(issuer.address))) {
    throw new Error("Local issuer authorization could not be confirmed on-chain.");
  }

  console.log(`Authorized local issuer ${issuer.address}`);
  console.log(`Transaction: ${receipt.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
