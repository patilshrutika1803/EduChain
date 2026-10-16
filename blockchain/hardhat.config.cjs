require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts/contracts",
  },
  networks: {
    hardhat: { chainId: 31337 },
    localhost: {
      url: process.env.HARDHAT_RPC_URL || "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
};
