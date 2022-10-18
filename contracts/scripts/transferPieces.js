// @TODO: move this to environment variable
const RECIPIENTS = [
  "0xD22D1181053A07D597dBb3396E70304FBc1746D7",
  "0xDa9141aCe9b6D448614bfF63FC511ae5e74b14C0",
  "0x692548f06Cbf0F9c0B35D5CD5523297E01F2C7C2",
  "0x99FaFC7a589c145630D09E316F64F33a42AED0c1",
  "0x85C2365cdcEb2dEf914cA829eBCDebF331215742",
  "0xa268c9892cD43069649C9E44297BB573D911c3c1",
  "0x3B9aEb88bbB848A6579d1FD8B4f97834a3A20C9d",
  "0x9A6F404E6bc9683C38A3B48167c8E558c888f01D",
  "0xAe7c6B5FdC9e49DbDdbf69bF693C4BEf106f9f85",
  "0x413898bA802490f66E6A239B69C1e5cf0607CecF",
  "0xa658f734f2ce7D5c1b32b9A49B4e51a12266Ba03",
  "0xA5D18c05382634A0f006C38124B09a98D0aBb082",
  "0x8f789f1BF6d723233a46af402EABC9cf9cB62C02",
  "0x407b6ACE56443eAd5ce53ae1992590315FF96987",
  "0x8B6cA6cb56ABEA7e1A15186E2F14056AB949F65F",
  "0x117f242E2D968273f1167BA44520CC925069CadA",
];

const fs = require("fs");
const col = require("../console.colour");
const log = col.colour;

let addresses = {};
const addressFile = __dirname + "/../addresses.json";

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

  const BattleTokenFactory = await ethers.getContractFactory("BattleToken");
  const BattleToken = await BattleTokenFactory.attach(addresses[network].token); //{gasPrice: 80000000000}

  col.cyan("Transferring tokens...");
  for (let tokenId = 1; tokenId <= 16; tokenId++) {
    col.yellow(`Transferring ${tokenId} to ${RECIPIENTS[tokenId - 1]}...`);

    try {
      let tx = await BattleToken.transferFrom(
        deployer.address,
        RECIPIENTS[tokenId - 1],
        tokenId
      );
      await tx.wait();
    } catch (e) {
      console.log(e);
      col.red(" execution failed.");
      process.exit();
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
