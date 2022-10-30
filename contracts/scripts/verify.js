const fs = require('fs');
const col = require('../console.colour');
const log = col.colour;

let addresses = {};
const addressFile = __dirname+"/../addresses.json";

const config = require("../deploy.config");

const _name         = config.contracts.token.name;
const _symbol       = config.contracts.token.symbol;
const _uriBase      = config.contracts.token.uriBase;
const _uriSuffix    = config.contracts.token.uriSuffix;

async function delay(time){
    await new Promise(resolve => setTimeout(resolve, time));
}

function clean_address(address){
    return String(address).toLowerCase();
}




async function main() {

    log("Get stored address file...");
    if (fs.existsSync(addressFile)){
        const data = fs.readFileSync(addressFile,
            {encoding:'utf8', flag:'r'});
        addresses = JSON.parse(data);
        col.green("    done.");
    }else{
        col.yellow("   No file found.");
    }

    let _network = process.env.HARDHAT_NETWORK;


    if(!_network){
        col.yellow("===== WARNING: NO NETWORK SPECIFIED =====");
        log();
        _network = "hardhat";
    }
    col.yellow("network:",_network);

    if(_network === "hardhat" || _network === "ganache"){
        col.red("Cant verify",_network);
    }

    const [deployer] = await ethers.getSigners();

    log("Verifying with Polygonscan...");

    const battle = addresses[_network].battle;
    const dice   = addresses[_network].dice;
    const token  = addresses[_network].token;
    const viewer = addresses[_network].viewer;


    log("@cyan@BattleToken:");
    log("   Contract address: "+token);
    log("   Parameters:");
    log("             _name: "+_name);
    log("           _symbol: "+_symbol);
    log("          _uriBase: "+_uriBase);
    log("        _uriSuffix: "+_uriSuffix);

    try {
        await hre.run("verify:verify", {
            address: token,
            constructorArguments: [
                _name,
                _symbol,
                _uriBase,
                _uriSuffix
            ],
        });
        log("@green@   done.")
    }catch(e){
        col.red("Verification failed.");
        col.red(e);
    }
    log("")



    log("@cyan@BattleDice:");
    log("   Contract address: "+dice);

    try {
        await hre.run("verify:verify", {
            address: dice,
            constructorArguments: [],
        });
        log("@green@   done.")
    }catch(e){
        col.red("Verification failed.");
        col.red(e);
    }
    log("")



    log("@cyan@Battle:");
    log("   Contract address: "+battle);
    log("   Parameters:");
    log("           _token: "+token+"");
    log("            _dice: "+dice+"");

    try{
        await hre.run("verify:verify", {
            address: battle,
            constructorArguments: [
                token,
                dice
            ],
        });
        log("@green@   done.")
    }catch(e){
        col.red("Verification failed.");
        col.red(e);
    }
    log("")



    log("@cyan@BattleViewer:");
    log("   Contract address: "+viewer);
    log("   Parameters:");
    log("          _battle: "+battle+"");
    log("           _token: "+token+"");

    try{
        await hre.run("verify:verify", {
            address: viewer,
            constructorArguments: [
                battle,
                token
            ],
        });
        log("@green@   done.")
    }catch(e){
        col.red("Verification failed.");
        col.red(e);
    }
    log("")

}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
