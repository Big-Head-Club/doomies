// Deploy Script
let MAINNET_GAS_PRICE_GWEI = "60";
let PREVENT_MAINNET = true;

// Contracts

//Battle


//Token
let _name_token = "Community Doomies";
let _symbol_token = "CDOOMIES";

let _uriBase_token = "https://t656nnvp2b.execute-api.us-east-2.amazonaws.com/default/battlegame2-metadata-microservice?token=";
let _uriSuffix_token = "";



module.exports = {
    deploy: {
        MAINNET_GAS_PRICE_GWEI,
        PREVENT_MAINNET,
    },

    contracts: {

        battle: {

        },

        token: {
            name: _name_token,
            symbol: _symbol_token,
            uriBase: _uriBase_token,
            uriSuffix: _uriSuffix_token,
        },




    }
}




