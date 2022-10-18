const fs = require("fs");
const col = require("../console.colour");
const log = col.colour;

let addresses = {};
const addressFile = __dirname + "/../addresses.json";

function clean_address(address) {
  return String(address).toLowerCase();
}

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
    case "ropsten":
    case "rinkeby":
    case "hardhat":
      break;
    case "mainnet":
      log("@red@  MAINNET PREVENTED");
      process.exit();
  }

  const BattleFactory = await ethers.getContractFactory("Battle");
  const Battle = await BattleFactory.attach(addresses[network].battle); //{gasPrice: 80000000000}

  col.cyan("Moves for Turn Three...");

  const moves = [
    {tokenId: 1, dx: 1, dy: 1}, // move down and right
    {tokenId: 4, dx: -1, dy: 0}, // move up
    {tokenId: 5, dx: -1, dy: 0}, // move up
    {tokenId: 6, dx: -1, dy: 0}, // move up
    {tokenId: 7, dx: -1, dy: 0}, // move up
    {tokenId: 8, dx: -1, dy: 0}, // move up
    {tokenId: 9, dx: -1, dy: 0}, // move up
    {tokenId: 12, dx: 1, dy: 0}, // move down
    {tokenId: 13, dx: 1, dy: 0}, // move down
    {tokenId: 14, dx: 1, dy: 0}, // move down
    {tokenId: 15, dx: 1, dy: 0}, // move down
    {tokenId: 16, dx: 1, dy: 0}, // move down
  ];

  for (let i = 0; i < moves.length; i++) {
    col.yellow(`Moving ${moves[i].tokenId} to ${moves[i].dx},${moves[i].dy}`);

    try {
      let tx = await Battle.move(moves[i].tokenId, moves[i].dx, moves[i].dy);
      await tx.wait();
    } catch (e) {
      console.log(e);
      col.red(" execution failed.");
      // process.exit();
    }
  }
  col.green("    done.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });