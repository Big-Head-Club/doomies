const fs = require("fs");
const col = require("../console.colour");
const log = col.colour;

let addresses = {};
const addressFile = __dirname + "/../addresses.json";

async function delay(time) {
  await new Promise((resolve) => setTimeout(resolve, time));
}

function clean_address(address) {
  return String(address).toLowerCase();
}

async function main() {
  log("Get stored address file...");
  if (fs.existsSync(addressFile)) {
    const data = fs.readFileSync(addressFile, { encoding: "utf8", flag: "r" });
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
    case "ropsten":
    case "rinkeby":
    case "hardhat":
      break;
    case "mainnet":
      log("@red@  MAINNET PREVENTED");
      process.exit();
  }

  col.cyan("Get Current Game State...");

  const BattleViewerFactory = await ethers.getContractFactory("BattleViewer");
  const BattleViewer = await BattleViewerFactory.attach(
    addresses[network].viewer
  ); //{gasPrice: 80000000000}

  const overrides = {
    // value: PRIZE_WEI
  };

  let state;
  try {
    state = await BattleViewer.getCurrentGameState();
  } catch (e) {
    console.log(e);
    col.red(" read failed.");
    process.exit();
  }

  col.cyan("Current State:");
  log("game number:", state.game);
  log("turn number:", state.turn);
  log("game is active?:", state.gameIsActive);
  log("seconds until turn ends:", state.timeTilTurnEnds.toString());
  log("start time", state.startTime);
  log("turn number of last battle", state.lastBattle);
  log("players:", state.players);
  log("remaining:", state.remaining);

  function padNumber(number) {
    number = number.toString();
    switch (number.length) {
      case 0:
        return "  -  ";
      case 1:
        return `  ${number}  `;
      case 2:
        return ` ${number}  `;
      case 3:
        return ` ${number} `;
      case 4:
        return ` ${number}`;
      default:
        return number;
    }
  }

  log("current board:");
  log("");
  log("   |  0  |  1  |  2  |  3  |  4  |  5  |  6  |  7  |  8  |");
  log("   |-----------------------------------------------------|");

  for (let y = 0; y < 9; y++) {
    let row = ` ${y} `;
    for (let x = 0; x < 9; x++) {
      row += "|" + padNumber(state._board[x][y]);
    }
    log(row + "|");
  }
  log("   |-----------------------------------------------------|");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
