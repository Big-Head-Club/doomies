const fs = require("fs");
const col = require("../console.colour");
const log = col.colour;

let addresses = {};
const addressFile = __dirname + "/../addresses.json";

async function main() {
  log("Get stored address file...");
  if (fs.existsSync(addressFile)) {
    const data = fs.readFileSync(addressFile, {encoding: "utf8", flag: "r"});
    addresses = JSON.parse(data);
    log("@green@    done.");
  } else {
    log("@yellow@   No file found.");
  }

  let network = process.env.HARDHAT_NETWORK;

  if (!network) {
    log("@yellow@===== WARNING: NO NETWORK SPECIFIED =====");
    network = "hardhat";
  }
  log("@yellow@network:", network);

  const [deployer] = await ethers.getSigners();

  log("Using account:", deployer.address);
  log("Account balance:", (await deployer.getBalance()).toString());

  switch (network) {
    case "ganache":
    case "hardhat":
    case "ropsten":
    case "rinkeby":
    case "goerli":
      break;
    case "mainnet":
      log("@red@  MAINNET PREVENTED");
      process.exit();
  }

  col.yellow("SETTING UP GAME ...");
  log();

  col.cyan("Starting game...");

  const BattleFactory = await ethers.getContractFactory("Battle");
  const Battle = await BattleFactory.attach(addresses[network].battle); //{gasPrice: 80000000000}

  const BattleTokenFactory = await ethers.getContractFactory("BattleToken");
  const BattleToken = await BattleTokenFactory.attach(addresses[network].token); //{gasPrice: 80000000000}

  // log("current game:",await Battle.game());

  try {
    let tx = await Battle.startGame();
    await tx.wait();
  } catch (e) {
    console.log(e);
    col.red(" execution failed.");
    process.exit();
  }
  col.green("    done.");
  log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
