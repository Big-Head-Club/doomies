require("dotenv").config();

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-abi-exporter");

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "ROPSTEN_ALCHEMY_KEY" in env
const ROPSTEN_ALCHEMY_API_KEY = process.env.ROPSTEN_ALCHEMY_KEY;

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "RINKEBY_ALCHEMY_KEY" in env
const RINKEBY_ALCHEMY_API_KEY = process.env.RINKEBY_ALCHEMY_KEY;

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "MAINNET_ALCHEMY_KEY" in env
const MAINNET_ALCHEMY_API_KEY = process.env.MAINNET_ALCHEMY_KEY;

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "MAINNET_ALCHEMY_KEY" in env
const GOERLI_ALCHEMY_API_KEY = process.env.GOERLI_ALCHEMY_KEY;

// Replace ROPSTEN_PRIVATE_KEY with your Ropsten account private key in .env
// Replace RINKEBY_PRIVATE_KEY with your Rinkeby account private key in .env
// Replace MAINNET_PRIVATE_KEY with your Mainnet account private key in .env
// (They will be the same if you use the same address on Ropsten and Mainnet)
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY;
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;
const GANACHE_PRIVATE_KEY = process.env.GANACHE_PRIVATE_KEY;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  solidity: {
    version: "0.8.9",
  },

  mocha: {
    timeout: 500000,
  },

  networks: {
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${GOERLI_ALCHEMY_API_KEY}`,
      accounts: [`0x${GOERLI_PRIVATE_KEY}`],
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ROPSTEN_ALCHEMY_API_KEY}`,
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`],
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${MAINNET_ALCHEMY_API_KEY}`,
      accounts: [`0x${MAINNET_PRIVATE_KEY}`],
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${RINKEBY_ALCHEMY_API_KEY}`,
      accounts: [`0x${RINKEBY_PRIVATE_KEY}`],
    },
    ganache: {
      url: `HTTP://127.0.0.1:8545`,
      accounts: [`0x${GANACHE_PRIVATE_KEY}`],
    },
    hardhat: {
      accounts: {
        mnemonic: "lunch seek bag mutual summer battle short picnic umbrella become mandate together",
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
