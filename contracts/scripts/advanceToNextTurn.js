// const config = require("../deploy.config");

const fs = require("fs");
const col = require("../console.colour");
const log = col.colour;

let addresses = {};
const addressFile = __dirname + "/../addresses.json";

function parseTime(secs) {
  if (typeof secs !== "BigInt") {
    secs = BigInt(secs);
  }
  if (secs < 60n) {
    return secs + " second" + plural(secs);
  } else {
    let mins = secs / 60n;
    secs %= 60n;

    if (mins < 60n) {
      if (secs !== 0n) {
        return (
          mins +
          " minute" +
          plural(mins) +
          " and " +
          secs +
          " second" +
          plural(secs)
        );
      } else {
        return mins + " minute" + plural(mins);
      }
    }

    let hours = mins / 60n;
    mins %= 60n;

    if (mins !== 0n) {
      if (secs !== 0n) {
        return (
          hours +
          " hour" +
          plural(hours) +
          ", " +
          mins +
          " minute" +
          plural(mins) +
          " and " +
          secs +
          " second" +
          plural(secs)
        );
      } else {
        return (
          hours +
          " hour" +
          plural(hours) +
          " and " +
          mins +
          " minute" +
          plural(mins)
        );
      }
    } else {
      if (secs !== 0n) {
        return (
          hours +
          " hour" +
          plural(hours) +
          " and " +
          secs +
          " second" +
          plural(secs)
        );
      } else {
        return hours + " hour" + plural(hours);
      }
    }
  }
}
function plural(number) {
  return BigInt(number) !== 1n ? "s" : "";
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

  let _network = process.env.HARDHAT_NETWORK;
  console.log('_NETWORK', _network)

  if (!_network) {
    log("@yellow@===== WARNING: NO NETWORK SPECIFIED =====");
    _network = "hardhat";
  }
  log("@yellow@network:", _network);

  const [deployer] = await ethers.getSigners();

  log("Using account:", deployer.address);
  log("Account balance:", (await deployer.getBalance()).toString());

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
      log("@red@  MAINNET PREVENTED");
      process.exit();
  }

  col.yellow("Advance to next turn ...");
  log();

  const BattleFactory = await ethers.getContractFactory("Battle");
  const Battle = await BattleFactory.attach(addresses[_network].battle); //{gasPrice: 80000000000}

  const BattleViewerFactory = await ethers.getContractFactory("BattleViewer");
  const BattleViewer = await BattleViewerFactory.attach(
    addresses[_network].viewer
  ); //{gasPrice: 80000000000}

  col.cyan("Getting time until round end...");

  let time = BigInt(await BattleViewer.getTimeTilTurnEnds());
  log();

  const EVM_increase_time = async (s) => {
    const seconds = Number(s);
    // await web3.currentProvider.send({
    //     jsonrpc: '2.0',
    //     method: 'evm_increaseTime',
    //     params: [seconds],
    //     id: Number(Math.random() * 1000).toFixed(0)
    // },()=>{});
    await network.provider.send("evm_increaseTime", [seconds]);

    await EVM_mine_one_block();
  };
  const EVM_mine_one_block = async () => {
    // await provider.send({
    //     jsonrpc: '2.0',
    //     method: 'evm_mine',
    //     id: new Date().getTime()
    // },()=>{});
    // await provider.send("evm_mine");
    await network.provider.send("evm_mine");
  };

  col.cyan(`Advancing time by ${parseTime(time)}...`);

  await EVM_increase_time(time.toString());
  // log("current game:",await Battle.game());

  col.green("    done.");
  log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
