const config = require("../deploy.config");
const formatJSON = require("../formatJSON");

const fs = require("fs");
const col = require("../console.colour");
const { exit } = require("process");
const log = col.colour;

//TODO: SET A PRICE FOR DEPLOYMENTS
// const MAINNET_GAS_PRICE = ethers.utils.parseUnits(config.deploy.MAINNET_GAS_PRICE_GWEI,"gwei");
const PREVENT_MAINNET = config.deploy.PREVENT_MAINNET;

const tokenAddresses = {
  battle: '',
  dice: '',
  token: '',
  viewer: '',
}

let addresses = {};
const addressFile = __dirname + "/../addresses.json";

async function main() {
  col.yellow("=== Deploy Battle Contracts ===");

  let totalGasUsed = 0;
  log("  Get stored address file...");
  if (fs.existsSync(addressFile)) {
    const data = fs.readFileSync(addressFile, { encoding: "utf8", flag: "r" });
    addresses = JSON.parse(data);
    col.green("    done.");
  } else {
    col.red("   No file found.");
  }

  let _network = process.env.HARDHAT_NETWORK;

  if (!_network) {
    col.yellow("===== WARNING: NO NETWORK SPECIFIED =====");
    log();
    _network = "hardhat";
  }
  col.yellow("network:", _network);

  log();

  const [deployer] = await ethers.getSigners();

  log("Deploying contract with the account:", deployer.address);
  // log("Account balance:", (await deployer.getBalance()).toString());
  log();

  // let goerliLimit = false;

  switch (_network) {
    case "ganache":
    case "hardhat":
    case "mumbai":
      break;
    // case "goerli":
    //   goerliLimit = true;
    //   break;
    case "polygon":
      if (PREVENT_MAINNET) {
        col.red("  POLYGON MAINNET PREVENTED");
        process.exit();
      }
      break;
  }

  col.magenta("Deploying BattleToken...");
  let overrides = {};
  const BattleTokenFactory = await ethers.getContractFactory("BattleToken");
  const BattleToken = await BattleTokenFactory.deploy(
    config.contracts.token.name,
    config.contracts.token.symbol,
    config.contracts.token.uriBase,
    config.contracts.token.uriSuffix,
    overrides
  );
  await BattleToken.deployed();
  // totalGasUsed += parseInt(tx.deployTransaction.gasLimit);

  const battleTokenTxHash = BattleToken.deployTransaction.hash;
  const battleTokenTxReceipt = await ethers.provider.waitForTransaction(battleTokenTxHash);

  col.green("    done.");
  col.cyan("BattleToken address:", battleTokenTxReceipt.contractAddress);
  tokenAddresses.token = battleTokenTxReceipt.contractAddress;
  log();

  col.magenta("Deploying BattleDice...");
  overrides = {};
  const BattleDiceFactory = await ethers.getContractFactory("BattleDice");
  const BattleDice = await BattleDiceFactory.deploy(overrides);
  await BattleDice.deployed();
  // totalGasUsed += parseInt(tx.deployTransaction.gasLimit);

  const diceTxHash = BattleDice.deployTransaction.hash;
  const diceTxReceipt = await ethers.provider.waitForTransaction(diceTxHash);

  col.green("    done.");
  col.cyan("BattleDice address:", diceTxReceipt.contractAddress);
  tokenAddresses.dice = diceTxReceipt.contractAddress;
  log();

  col.magenta("Deploying Battle...");
  overrides = {};
  const BattleFactory = await ethers.getContractFactory("Battle");
  const Battle = await BattleFactory.deploy(
    battleTokenTxReceipt.contractAddress,
    diceTxReceipt.contractAddress,
    overrides
  );
  await Battle.deployed();
  // totalGasUsed += parseInt(tx.deployTransaction.gasLimit);

  const battleTxHash = Battle.deployTransaction.hash;
  const battleTxReceipt = await ethers.provider.waitForTransaction(battleTxHash);

  col.green("    done.");
  col.cyan("Battle address:", battleTxReceipt.contractAddress);
  tokenAddresses.battle = battleTxReceipt.contractAddress;
  log();

  col.magenta("Deploying BattleViewer...");
  overrides = {};
  const BattleViewerFactory = await ethers.getContractFactory("BattleViewer");
  const BattleViewer = await BattleViewerFactory.deploy(
    battleTxReceipt.contractAddress,
    battleTokenTxReceipt.contractAddress,
    overrides
  );
  await BattleViewer.deployed();
  // totalGasUsed += parseInt(tx.deployTransaction.gasLimit);

  const viewerTxHash = BattleViewer.deployTransaction.hash;
  const viewerTxReceipt = await ethers.provider.waitForTransaction(viewerTxHash);

  col.green("    done.");
  col.cyan("BattleViewer address:", viewerTxReceipt.contractAddress);
  tokenAddresses.viewer = viewerTxReceipt.contractAddress;
  log();

  log();

  log();
  col.magenta("   Connect BattleToken to Battle...");
  try {
    let tx = await BattleToken.setBattle(battleTxReceipt.contractAddress);
    await tx.wait();
    col.green("    done.");
  } catch (e) {
    log("@red@ execution failed.");
    process.exit();
  }
  log();

  addresses[_network] = tokenAddresses;

  // col.yellow(" TOTAL GAS USED:", totalGasUsed.toString());

  log("   Saving addresses...");
  try {
    let data = JSON.stringify(addresses);

    data = formatJSON(data);

    fs.writeFileSync(addressFile, data);
  } catch (e) {
    col.red("Write fail:");
    log(e);
  }
  col.green("    done.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
