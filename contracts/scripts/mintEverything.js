const fs = require("fs");
const col = require("../console.colour");
const log = col.colour;

const ethProvider = require('eth-provider') 
const frame = ethProvider('frame')

// For for y'all
const FEE_ENTRY = 0n;
const SUPPLY = 800;

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

  // switch (_network) {
  //   case "ganache":
  //   case "hardhat":
  //   case "mumbai":
  //     break;
  //   // case "goerli":
  //   //   goerliLimit = true;
  //   //   break;
  //   case "polygon":
  //     if (PREVENT_MAINNET) {
  //       col.red("  POLYGON MAINNET PREVENTED");
  //       process.exit();
  //     }
  //     break;
  // }

  col.yellow("MINTING ALL THE DOOMIES ...");
  log();

  col.cyan(`Minting ${SUPPLY} Doomies...`);

  const BattleFactory = await ethers.getContractFactory("Battle");
  const Battle = await BattleFactory.attach(addresses[network].battle); //{gasPrice: 80000000000}

  const overrides = {
    value: FEE_ENTRY,
  };
  col.cyan("Minting tokens...");

  for (let i = 0; i < SUPPLY; i++) {
    col.yellow(i, "...");
    try {
      let tx = await Battle.mint(overrides);
      await tx.wait();
    } catch (e) {
      console.log(e);
      col.red(" execution failed.");
      process.exit();
    }
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
