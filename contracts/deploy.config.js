// Deploy Script
let MAINNET_GAS_PRICE_GWEI = "30";
let PREVENT_MAINNET = true;

// Contracts

//Battle


//Token
let _name_token        = "Doomies";
let _symbol_token      = "DOOMIES";

let _uriBase_token     = "https://e77al6s9m0.execute-api.us-east-2.amazonaws.com/default/battlegame-metadata-microservice?token=";
let _uriSuffix_token   = "";



module.exports = {
    deploy: {
        MAINNET_GAS_PRICE_GWEI,
        PREVENT_MAINNET,
    },

    contracts: {

        battle: {

        },

        token: {
            name:       _name_token,
            symbol:     _symbol_token,
            uriBase:    _uriBase_token,
            uriSuffix:  _uriSuffix_token,
        },




    }
}




