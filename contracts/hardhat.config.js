require("dotenv").config();

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-abi-exporter");

const MUMBAI_ALCHEMY_API_KEY = process.env.MUMBAI_ALCHEMY_KEY;
const POLYGON_ALCHEMY_API_KEY = process.env.POLYGON_ALCHEMY_KEY;

const MUMBAI_PRIVATE_KEY = process.env.MUMBAI_PRIVATE_KEY;
const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY;
const GANACHE_PRIVATE_KEY = process.env.GANACHE_PRIVATE_KEY;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const HARDHAT_MNEMONIC = process.env.HARDHAT_MNEMONIC

module.exports = {
  solidity: {
    version: "0.8.9",
  },

  mocha: {
    timeout: 500000,
  },

  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${MUMBAI_ALCHEMY_API_KEY}`,
      accounts: [`0x${MUMBAI_PRIVATE_KEY}`],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${POLYGON_ALCHEMY_API_KEY}`,
      accounts: [`0x${POLYGON_PRIVATE_KEY}`],
    },
    ganache: {
      url: `HTTP://127.0.0.1:8545`,
      accounts: [`0x${GANACHE_PRIVATE_KEY}`],
    },
    hardhat: {
      accounts: {
        mnemonic: `${HARDHAT_MNEMONIC}`,
      }
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
  abiExporter: {
    path: "../client/src/abi",
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
    pretty: true,
  },
};
