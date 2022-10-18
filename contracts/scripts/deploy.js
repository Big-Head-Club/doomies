const config = require("../deploy.config");
const formatJSON = require("../formatJSON");

const fs = require("fs");
const col = require("../console.colour");
const log = col.colour;

//TODO: SET A PRICE FOR DEPLOYMENTS
// const MAINNET_GAS_PRICE = ethers.utils.parseUnits(config.deploy.MAINNET_GAS_PRICE_GWEI,"gwei");
const PREVENT_MAINNET = true; //config.deploy.PREVENT_MAINNET;

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
  log("Account balance:", (await deployer.getBalance()).toString());
  log();

  let goerliLimit = false;

  switch (_network) {
    case "ganache":
    case "ropsten":
    case "rinkeby":
    case "hardhat":
      break;
    case "goerli":
      goerliLimit = true;
      break;
    case "mainnet":
      if (PREVENT_MAINNET) {
        col.red("  MAINNET PREVENTED");
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
  let tx = await BattleToken.deployed();
  totalGasUsed += parseInt(tx.deployTransaction.gasLimit);

  col.green("    done.");
  col.cyan("BattleToken address:", BattleToken.address);
  log();

  col.magenta("Deploying BattleDice...");
  overrides = {};
  const BattleDiceFactory = await ethers.getContractFactory("BattleDice");
  const BattleDice = await BattleDiceFactory.deploy(overrides);
  tx = await BattleDice.deployed();
  totalGasUsed += parseInt(tx.deployTransaction.gasLimit);

  col.green("    done.");
  col.cyan("BattleDice address:", BattleDice.address);
  log();

  col.magenta("Deploying Battle...");
  overrides = {};
  const BattleFactory = await ethers.getContractFactory("Battle");
  const Battle = await BattleFactory.deploy(
    BattleToken.address,
    BattleDice.address,
    overrides
  );
  tx = await Battle.deployed();
  totalGasUsed += parseInt(tx.deployTransaction.gasLimit);

  col.green("    done.");
  col.cyan("Battle address:", Battle.address);
  log();

  col.magenta("Deploying BattleViewer...");
  overrides = {};
  const BattleViewerFactory = await ethers.getContractFactory("BattleViewer");
  const BattleViewer = await BattleViewerFactory.deploy(
    Battle.address,
    BattleToken.address,
    overrides
  );
  tx = await BattleViewer.deployed();
  totalGasUsed += parseInt(tx.deployTransaction.gasLimit);

  col.green("    done.");
  col.cyan("BattleViewer address:", BattleViewer.address);
  log();

  log();

  log();
  col.magenta("   Connect BattleToken to Battle...");
  try {
    let tx = await BattleToken.setBattle(Battle.address);
    await tx.wait();
    col.green("    done.");
  } catch (e) {
    log("@red@ execution failed.");
    process.exit();
  }
  log();

  addresses[_network] = {
    battle: Battle.address,
    dice: BattleDice.address,
    token: BattleToken.address,
    viewer: BattleViewer.address,
  };

  col.yellow(" TOTAL GAS USED:", totalGasUsed.toString());

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
