require("dotenv").config();
const col = require("../console.colour");
const log = col.colour;
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const { ethers } = require("ethers");

let addresses = {};
const addressFile = __dirname + "/../addresses.json";

log("Get stored address file...");
if (fs.existsSync(addressFile)) {
  const data = fs.readFileSync(addressFile, { encoding: "utf8", flag: "r" });
  addresses = JSON.parse(data);
  log("@green@    done.");
} else {
  log("@yellow@   No file found.");
}

if (!network) {
    log("@yellow@===== WARNING: NO NETWORK SPECIFIED =====");
    network = "hardhat";
}
log("@yellow@network:", network.name);

const abi = [
    "function safeTransferFrom(address,address,uint256)",
]

const contractAddress = addresses[network.name].token
const pk = process.env.POLYGON_PRIVATE_KEY;
const provider = ethers.getDefaultProvider(process.env.POLYGON_MAINNET_URL);
const wallet = new ethers.Wallet(pk, provider);
const from = ethers.utils.getAddress(process.env.OWNER_ADDRESS);    
const nftRW = new ethers.Contract(contractAddress, abi, wallet);

async function transfer(address, id) {
    try {
        const options = {
            gasPrice: ethers.utils.parseUnits("45", "gwei"),
            gasLimit: 90000,
        };
        const to = ethers.utils.getAddress(address);
        console.log("from", from);
        console.log("to", to);
        console.log("tokenId", id);
        // const amount = 1;
        // const data = 0;
        const tx = await nftRW.safeTransferFrom(
            from,
            to,
            id,
            options
        );
        console.log("*** TX ***");
        console.log(tx);
        const confirmation = await tx.wait();
        console.log("*** WAIT ***");
        console.log(confirmation);
    } catch (error) {
        console.error(error);
    }
}

const getAddresses = () => {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(
            path.resolve(__dirname, "addresses.csv")
        )
            .pipe(csv({ headers: false }))
            .on("data", (data) => results.push(data))
            .on("end", () => {
                const output = results.reduce(
                    (prev, curr) => {
                        if (curr[0]) prev[0].push(curr[0]);
                        if (curr[1]) prev[1].push(curr[1]);
                        return prev;
                    },
                    [[]]
                );
                resolve(output[0]);
            });
    });
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {




    


    const transferAddresses = await getAddresses();
    let tokenId = 1;

    for (const address of transferAddresses) {
        console.log(`calling transfer with id ${tokenId}`, address);
        await transfer(address, tokenId); // transfer mentor token
        tokenId++;
        console.log(`calling transfer with id ${tokenId}`, address);
        await transfer(address, tokenId); // transfer mentor token
        tokenId++;
        console.log(`calling transfer with id ${tokenId}`, address);
        await transfer(address, tokenId); // transfer mentor token
        tokenId++

    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });