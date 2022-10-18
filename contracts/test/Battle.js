const col = require('../console.colour');
const log = col.colour;

const config = require("../deploy.config");
//
const die = function(messages){
    if(arguments.length > 0){
        col.red(...arguments)
    }
    process.exit();
}

const { expect, assert } = require("chai");
const fs = require('fs');

function cleanAddress(address){
    return String(address).toLowerCase();
}

const BN = ethers.BigNumber;

let owner, nonOwner, player0, player1, player2, nonMiner, approved, nonApproved, operator, winner;
let accounts, account;

let Battle,          BattleFactory;
let BattleBot,       BattleBotFactory;
let BattleToken,     BattleTokenFactory;

let BattleDice,      BattleDiceFactory;
let BattleViewer,    BattleViewerFactory;


let ValidReceiver,   ValidReceiverFactory;
let InvalidReceiver, InvalidReceiverFactory;
let NonReceiver,     NonReceiverFactory;
let NewMetadata,     NewMetadataFactory;


const Contracts = {
    Battle:             null,
    BattleToken:        null,
    BattleBot:          null,

    BattleDice:         null,

    ValidReceiver:      null,
    InvalidReceiver:    null,
    NonReceiver:        null,

}


const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const UINT32_MAX = 4294967295n;

const FEE_ENTRY     = BigInt(ethers.utils.parseEther("0.08"));
const PERCENT_OWNER = 51n;
const TOKEN_MAX     = 800n;

const fails = async (attempt,message) => {
    if(typeof message === "object"){
        message = JSON.stringify(message);
    }
    let success;
    try{
        await attempt();
        success = true;
    }catch(e){
        success = false;
    }

    assert.equal(success,false,message);
}
const succeeds = async(attempt,showError = false, message) => {
    if (typeof message === "object") {
        message = JSON.stringify(message);
    }

    try {
        await attempt();
        assert.equal(true, true, message);
    } catch (e) {
        if (showError) console.log(e);
        assert.equal(false, true, message);
    }
}
const getBalance = async (address) => {
    return BigInt(await Battle.provider.getBalance(address));
};
function getTxGas(tx){
    return BigInt(tx.cumulativeGasUsed);
}
function countGas(txGas){
    if(gas.total === 0n){
        gas.min = txGas;
        gas.max = txGas;
    }else{
        if(gas.min > txGas){
            gas.min = txGas;
        }
        if(gas.max < txGas){
            gas.max = txGas;
        }

    }
    gas.total += txGas;
    gas.count++;
}
function tallyGas(tx){
    countGas(getTxGas(tx));
}
function logGas(){

    log("min:", gas.min);
    log("max:", gas.max);
    if(gas.count !== 0n){
        log("avg:", gas.total / gas.count);
    }else{
        log("avg:", 0n);
    }

}
function resetGas(){
    gas = {
        min: 0n,
        max: 0n,
        total: 0n,
        count: 0n
    }
}


let gas = {
    min: 0n,
    max: 0n,
    total: 0n,
    count: 0n
}

const getGainsFromTx = async (tx) => {

    let balance_before = await getBalance(account.address);

    let _tx = await tx();

    let gasUsed = BigInt(_tx.gasUsed);
    let gasPrice = BigInt(_tx.effectiveGasPrice);

    let txCost = gasUsed * gasPrice;

    let balance_after = await getBalance(account.address);

    return balance_after - balance_before + txCost;
}

const advanceBlocks = async(blocks)=>{
    for(let i = 0; i < blocks; i++){
        await EVM_mine_one_block();
    }
}
const EVM_mine_one_block = async () => {
    await network.provider.send("evm_mine");
};
const EVM_increase_time = async (seconds) => {
    await network.provider.send("evm_increaseTime", [seconds])

    await EVM_mine_one_block()
};
const advanceDays = async(days)=>{
    await advanceHours(days * 24);
}
const advanceHours = async(hours)=>{
    await advanceMinutes(hours * 60);
}
const advanceMinutes = async(minutes)=>{
    await advanceSeconds(minutes * 60);
}
const advanceSeconds = async(seconds)=>{
    await EVM_increase_time(parseInt(seconds));
}


function parseBool(input){
    return (input.toString().toLowerCase() !== "false");
}


function ERC165(funcObj,contract){
//  = Read
    funcObj.supportsInterface = async (interfaceID) =>{
        return parseBool(await Contracts[contract].supportsInterface(interfaceID));
    }
}
function ERC721(funcObj,contract){
//  = Read
    funcObj.balanceOf = async (_owner) =>{
        return BigInt(await Contracts[contract].balanceOf(_owner));
    }
    funcObj.ownerOf = async (_tokenId) =>{
        return await Contracts[contract].ownerOf(_tokenId);
    }
    funcObj.getApproved = async (_tokenId) =>{
        return await Contracts[contract].getApproved(_tokenId);
    }
    funcObj.isApprovedForAll = async (_owner,_operator) =>{
        return parseBool(await Contracts[contract].isApprovedForAll(_owner,_operator));
    }

//  = Write
    funcObj.safeTransferFrom = async (_from,_to,_tokenId, data = null) => {
        let Contract = await Contracts[contract].connect(account);
        let transaction;
        if(data){
            // transaction = await Contract.safeTransferFrom(_from,_to,_tokenId,data);
            transaction = await Contract.functions["safeTransferFrom(address,address,uint256,bytes)"](_from,_to,_tokenId,data);
        }else{
            // transaction = await Contract.safeTransferFrom(_from,_to,_tokenId);
            transaction = await Contract.functions["safeTransferFrom(address,address,uint256)"](_from,_to,_tokenId);
        }
        return await transaction.wait();
    }
    funcObj.transferFrom = async (_from,_to,_tokenId) => {
        let Contract = await Contracts[contract].connect(account);
        const transaction = await Contract.transferFrom(_from,_to,_tokenId);
        return await transaction.wait();
    }
    funcObj.approve = async (_approved,_tokenId) => {
        let Contract = await Contracts[contract].connect(account);
        const transaction = await Contract.approve(_approved,_tokenId);
        return await transaction.wait();
    }
    funcObj.setApprovalForAll = async (_operator,_approved) => {
        let Contract = await Contracts[contract].connect(account);
        const transaction = await Contract.setApprovalForAll(_operator,_approved);
        return await transaction.wait();
    }
}
function ERC721Metadata(funcObj,contract){
//  = Read
    funcObj.name = async()=>{
        return await Contracts[contract].name();
    }
    funcObj.symbol = async ()=>{
        return await Contracts[contract].symbol();
    }
    funcObj.tokenURI = async(_tokenId)=>{
        return await Contracts[contract].tokenURI(_tokenId);
    }
}


//  === DoomsdayGarden ===
// 721
const battle = {
    // = Read

    gameIsActive: async () => {
        return parseBool(await Battle.gameIsActive());
    },
    turnNumber: async () => {
        return BigInt(await Battle.turnNumber());
    },
    game: async () => {
        return BigInt(await Battle.game());
    },

    games: async (game) => {
        return await Battle.games(game);
    },

    pieces: async (pieceId) => {
        return await Battle.pieces(pieceId);
    },


    turnTime: async () => {
        return BigInt(await Battle.turnTime());
    },


    getStats: async(pieceId)=>{
        return await Battle.getStats(pieceId);
    },

    // = Write


    mint: async (value) => {
        const overrides = {value: value.toString()};
        let Contract = await Battle.connect(account);
        const transaction = await Contract.mint(overrides);
        return await transaction.wait();
    },

    enterGame: async (tokenId, startX,startY) => {
        let Contract = await Battle.connect(account);
        const transaction = await Contract.enterGame(tokenId, startX,startY);
        return await transaction.wait();
    },


    move: async (tokenId,dx,dy) => {
        let Contract = await Battle.connect(account);
        const transaction = await Contract.move(tokenId,dx,dy);
        return await transaction.wait();
    },

    withdrawWinnings: async (tokenId) => {
        let Contract = await Battle.connect(account);
        const transaction = await Contract.withdrawWinnings(tokenId);
        return await transaction.wait();
    },

    ownerWithdraw: async () => {
        let Contract = await Battle.connect(account);
        const transaction = await Contract.ownerWithdraw();
        return await transaction.wait();
    },


    startGame: async () => {
        let Contract = await Battle.connect(account);
        const transaction = await Contract.startGame();
        return await transaction.wait();
    },
}

const battleBot = {
    // = Write


    mint: async (value) => {
        const overrides = {value: value.toString()};
        let Contract = await BattleBot.connect(account);
        const transaction = await Contract.enterGame(overrides);
        return await transaction.wait();
    },


    enterGame: async (tokenId,startX,startY) => {
        let Contract = await BattleBot.connect(account);
        const transaction = await Contract.enterGame(startX,startY);
        return await transaction.wait();
    },


    move: async (tokenId,dx,dy) => {
        let Contract = await BattleBot.connect(account);
        const transaction = await Contract.move(tokenId,dx,dy);
        return await transaction.wait();
    },

}

const battleToken = {
    setBattle: async (address) => {
        let Contract = await BattleToken.connect(account);
        const transaction = await Contract.setBattle(address);
        return await transaction.wait();
    },
    mint: async (to,tokenId) => {
        let Contract = await BattleToken.connect(account);
        const transaction = await Contract.mint(to,tokenId);
        return await transaction.wait();
    },
    burn: async (tokenId) => {
        let Contract = await BattleToken.connect(account);
        const transaction = await Contract.burn(tokenId);
        return await transaction.wait();
    },
}
ERC721(battleToken,"BattleToken");
ERC721Metadata(battleToken,"BattleToken");
ERC165(battleToken,"BattleToken");


const viewer = {
    getCurrentBoard: async () => {
        return await BattleViewer.getCurrentBoard()
    },
}


const init_tests = async() => {
    accounts = await ethers.getSigners();

    owner       = accounts[0];
    nonOwner    = accounts[1];
    player0      = accounts[2];
    player1      = accounts[3];
    player2      = accounts[4];
    nonMiner    = accounts[5];
    approved    = accounts[6];
    nonApproved = accounts[7];
    operator    = accounts[8];
    winner = accounts[9];

    BattleFactory   = await ethers.getContractFactory("Battle");
    BattleTokenFactory = await ethers.getContractFactory("BattleToken");

    BattleDiceFactory = await ethers.getContractFactory("BattleDice");

    BattleBotFactory   = await ethers.getContractFactory("BattleBot");

    BattleViewerFactory   = await ethers.getContractFactory("BattleViewer");


    // ViewerFactory = await ethers.getContractFactory("DoomsdayGardenViewer");

    // ValidReceiverFactory    = await ethers.getContractFactory("ValidReceiver");
    // InvalidReceiverFactory  = await ethers.getContractFactory("InvalidReceiver");
    // NonReceiverFactory      = await ethers.getContractFactory("NonReceiver");
    //

}


const refresh_contracts = async(setBattle = true)=> {

    BattleToken = await BattleTokenFactory.deploy(
        config.contracts.token.name,
        config.contracts.token.symbol,
        config.contracts.token.uriBase,
        config.contracts.token.uriSuffix
    );
    await BattleToken.deployed();

    BattleDice = await BattleDiceFactory.deploy();
    await BattleDice.deployed();

    Battle = await BattleFactory.deploy(BattleToken.address,BattleDice.address);
    await Battle.deployed();

    BattleBot = await BattleBotFactory.deploy(Battle.address);
    await BattleBot.deployed();


    BattleViewer = await BattleViewerFactory.deploy(Battle.address,BattleToken.address);
    await BattleBot.deployed();



    if(setBattle){
        await battleToken.setBattle(Battle.address);
    }

    Contracts.Battle    = Battle;
    Contracts.BattleToken  = BattleToken;

    Contracts.BattleBot    = BattleBot;
    Contracts.BattleViewer  = BattleViewer;


}

async function mint(){
    return await battle.mint(FEE_ENTRY);
}

async function enterGame(tokenId, x,y){
    return await battle.enterGame(tokenId, x,y);
}


async function move(tokenId, dx,dy){
    return await battle.move(tokenId, dx,dy);
}



async function advanceToNextTurn(){
    const seconds = BigInt(await battle.turnTime()) +1n;
    await advanceSeconds(seconds);
}


describe("Big Head Battle", async()=>{
    before(init_tests);

    beforeEach(async()=>{
        account = owner;

        await refresh_contracts();
    });

    describe("Battle",async()=>{
        describe("startGame ()", async()=>{
            it("Can startGame", async()=>{
                await succeeds(async()=>{
                    let tx = await battle.startGame();
                    // log(tx.cumulativeGasUsed.toString());
                    // die();
                },true)
            });
            it("Can't startGame if not owner", async()=>{
                account = nonOwner;
                await fails(async()=>{
                    await battle.startGame();
                })
            });
            it("Can't startGame if game active", async()=>{
                await battle.startGame();

                await fails(async()=>{
                    await battle.startGame();
                })
            });
            it("startGame starts game", async()=>{
                const game_before = await battle.game();

                await battle.startGame();

                const game_after = await battle.game();

                assert.equal(game_after, game_before + 1n);
            });
            it("Can startGame after previous round ends", async()=>{
                await battle.startGame();

                await mint(); // 1
                await mint(); // 2

                await enterGame(1,0,0);

                await enterGame(2, 2,0);



                await advanceDays(1.1);

                await battle.move(1,1,0);
                await battle.move(2,-1,0);

                await succeeds(async()=>{
                    await battle.startGame();
                },true)
            });

        });

        describe("mint() payable", async()=>{
            it("Can mint", async()=>{
                await succeeds(async()=> {
                    await mint();
                });
            });
            it("Can't mint if contract", async()=>{
                await fails(async()=> {
                    await battleBot.mint(FEE_ENTRY);
                });
            });
            it("Can't mint if wrong msg.value", async()=>{
                await fails(async()=> {
                    await battle.mint(FEE_ENTRY - 1n);
                });
                await fails(async()=> {
                    await battle.mint(FEE_ENTRY + 1n);
                });
                await fails(async()=> {
                    await battle.mint(0n);
                });
            });
            it("Can't mint if already max has been minted", async()=>{
                for(let i = 0n; i < TOKEN_MAX; i++){
                    await mint();
                }

                await fails(async()=>{
                    await mint();
                });
            });
            it("Mint mints token ", async()=>{
                await mint();

                await battleToken.ownerOf(1);
            });


        });

        describe("enterGame ( uint32 tokenId, int8 startX, int8 startY )", async()=>{
            beforeEach(async()=>{
                await battle.startGame();
            });

            it("Can enterGame", async()=>{
                await mint();
                await mint();
                await mint();

                await succeeds(async()=>{
                    await enterGame(1, 0,0);
                    await enterGame(2, 2,0);
                    await enterGame(3, 4,0);
                },true)
            });


            it("Can't enterGame if already in game", async()=>{
                await mint();
                await mint();

                await enterGame(1, 0,0);

                await fails(async()=>{
                    await enterGame(1, 2,0);
                },true)
            });

            it("Can't enterGame if played in previous game", async()=>{
                await mint();
                await mint();

                await mint();

                await enterGame(1, 0,0);
                await enterGame(2, 2,0);

                await advanceToNextTurn();

                await move(1,1,0);
                await move(2,-1,0);

                await battle.startGame();

                await fails(async ()=>{
                    await enterGame(1, 0,0);
                });


                await succeeds(async ()=>{
                    await enterGame(3, 0,0);
                });

            });



            it("Can't enterGame if game not active", async()=>{

                await refresh_contracts();

                await mint();

                await fails(async()=> {
                    await enterGame(1, 0,0);
                });

            });

            it("Can't enterGame if game not enter time", async()=>{


                // assert.fail("fail");
                // await refresh_contracts();
                //
                await mint();
                await mint();
                await mint();

                await enterGame(1, 0,0);
                await enterGame(2, 2,0);

                await advanceToNextTurn();

                await fails(async()=> {
                    await enterGame(3, 0,0);
                });

            });
            it("Can't enterGame if contract sending tx", async()=>{
                await mint();

                await fails(async()=> {
                    await battleBot.enterGame(1, 0,0,FEE_ENTRY);
                });
            });

            it("Can't enterGame if not on border", async()=>{
                await mint();

                await fails(async()=> {
                    await enterGame(1, 2,2);
                });
            });
            it("Can't enterGame if not in starting slot", async()=>{
                await mint();

                await fails(async()=> {
                    await enterGame(1, 0,1);
                });
            });
            it("Can't enterGame if starting in slot occupied", async()=>{
                await mint();
                await mint();

                await enterGame(1, 0,0);

                await fails(async()=> {
                    await enterGame(2, 0,0);
                });
            });
            // it("Can't enterGame if game full", async()=>{
            //     for(let x = 0; x <= 8; x += 2){
            //         for(let y = 0; y <)
            //     }
            // });
            it("enterGame enters game", async()=>{

                await mint();

                const players_before = BigInt((await battle.games(1)).players);

                await enterGame(1, 0,0);

                const players_after = BigInt((await battle.games(1)).players);

                assert.equal(players_after,players_before + 1n);
                //
                // await fails(async()=> {
                //     await enterGame(0,0);
                // });


            });

        });
        describe("move ( uint32 tokenId, int8 dx, int8 dy ) ", async()=>{
            beforeEach(async()=>{
                await battle.startGame();


            });


            it("Can move", async()=>{

                await mint();
                await mint();

                await enterGame(1, 0,0); // 1
                await enterGame(2, 2,0); // 2

                await advanceDays(1.1);

                await succeeds(async()=>{
                    await battle.move(1,1,0);

                },true);
            });
            it("Can't move if not your token", async()=>{

                account = player0;
                await mint();
                await enterGame(1, 0,0); // 1

                account = player1;
                await mint();
                await enterGame(2, 2,0); // 2

                await advanceDays(1.1);

                account = player1;
                await fails(async()=>{
                    await battle.move(1,1,0);

                },true);

            });
            it("Can't move if game not active", async()=>{
                await mint();
                await mint();


                await enterGame(1, 0,0); // 1
                await enterGame(2, 2,0); // 2

                await advanceDays(1.1);

                await battle.move(1,1,0);
                await battle.move(2,-1,0);

                let winner;
                const piece = await battle.pieces(1);
                if(BigInt(piece.data) < UINT32_MAX){
                    winner = 1;
                }else{
                    winner = 2;
                }

                await fails(async()=>{
                    await battle.move(winner,0,1);
                })


            });
            it("Can't move if still entry time", async()=>{

                await mint();
                await mint();


                await enterGame(1, 0,0); // 1
                await enterGame(2, 2,0); // 2

                await fails(async()=>{
                    await battle.move(1,1,0);
                });

            });
            it("Can't move if already moved this turn", async()=>{

                await mint();
                await mint();



                await enterGame(1, 0,0); // 1
                await enterGame(2, 2,0); // 2

                await advanceDays(1.1);

                await battle.move(2,0,1);

                await fails(async()=>{
                    await battle.move(2,0,1);

                });
            });
            it("Can't move if tx from contract", async()=>{

                account = player0;
                await mint();
                await mint();

                await enterGame(1, 0,0); // 1
                await enterGame(2, 2,0); // 2

                await battleToken.transferFrom(player0.address,BattleBot.address,1);

                await advanceDays(1.1);

                await fails(async()=>{
                    await battleBot.move(1,0,1);
                });

            });
            it("Can't move if moving off board", async()=>{

                account = player0;
                await mint();
                await mint();

                await enterGame(1, 0,0); // 1
                await enterGame(2, 2,0); // 2

                await advanceDays(1.1);

                await fails(async()=>{
                    await battleBot.move(1,0,-1);
                });

            });
            it("Can't move if not actually moving", async()=>{

                account = player0;
                await mint();
                await mint();

                await enterGame(1, 0,0); // 1
                await enterGame(2, 2,0); // 2

                await advanceDays(1.1);

                await fails(async()=>{
                    await battleBot.move(1,0,0);
                });
            });
            it("Can't move more than one square away", async()=>{

                account = player0;
                await mint();
                await mint();

                await enterGame(1, 0,0); // 1
                await enterGame(2, 2,0); // 2

                await advanceDays(1.1);

                await fails(async()=>{
                    await battleBot.move(1,2,0);
                });
                await fails(async()=>{
                    await battleBot.move(1,1,2);
                });
                await fails(async()=>{
                    await battleBot.move(1,0,2);
                });
            });


            it("Can move and pick up weapon", async()=>{
                account = player0;
                await mint();
                await mint();

                await enterGame(1, 2,0); // 1
                await enterGame(2, 4,0); // 2

                await advanceDays(1.01);

                await battle.move(2,0,1);
                await advanceDays(1.01);

                await battle.move(2,0,1);
                await advanceDays(1.01);

                await succeeds(async()=> {
                    await battle.move(2, 0, 1);
                });

            });
            it("Can move and battle", async()=>{
                account = player0;
                await mint();
                await mint();

                await enterGame(1, 2,0); // 1
                await enterGame(2, 4,0); // 2


                await advanceDays(1.01);


                await succeeds(async()=> {
                    await battle.move(1, 1, 0);
                    await battle.move(2, -1, 0);
                });


            });


        })

        describe("withdrawWinnings (uint32 tokenId)", async()=>{
           it("Can withdrawWinnings", async()=>{
               await battle.startGame();



               account = player0;
               await mint();
               await mint();

               await enterGame(1, 2,0); // 1
               await enterGame(2, 4,0); // 2


               await advanceDays(1.01);

               await battle.move(1, 1, 0);
               await battle.move(2, -1, 0);

               let winner;
               const piece = await battle.pieces(1);
               if(BigInt(piece.data) < UINT32_MAX){
                   winner = 1;
               }else{
                   winner = 2;
               }



               await succeeds(async()=> {
                   await battle.withdrawWinnings(winner);
               },true);

           });

           it("Can't withdrawWinnings twice", async()=>{
               await battle.startGame();

               account = player0;
               await mint();
               await mint();

               await enterGame(1, 2,0); // 1
               await enterGame(2, 4,0); // 2


               await advanceDays(1.01);

               await battle.move(1, 1, 0);
               await battle.move(2, -1, 0);

               let winner;
               const piece = await battle.pieces(1);
               if(BigInt(piece.data) < UINT32_MAX){
                   winner = 1;
               }else{
                   winner = 2;
               }



               await battle.withdrawWinnings(winner);
               await fails(async()=> {
                   await battle.withdrawWinnings(winner);
               },true);

           });


           it("Can't withdrawWinnings if not your token", async()=>{
               await battle.startGame();

               account = player0;
               await mint();
               await mint();

               await enterGame(1,2,0); //1
               await enterGame(2, 4,0); // 2


               await advanceToNextTurn();

               await battle.move(1, 1, 0);
               await battle.move(2, -1, 0);

               let winner;
               const piece = await battle.pieces(1);
               if(BigInt(piece.data) < UINT32_MAX){
                   winner = 1;
               }else{
                   winner = 2;
               }


               account = player1;

               await fails(async()=> {
                   await battle.withdrawWinnings(winner);
               },true);

           });
           it("Can't withdrawWinnings if game hasn't ended ", async()=>{
               await battle.startGame();

               account = player0;
               await mint();
               await mint();

               await enterGame(1,2,0); // 1
               await enterGame(2, 4,0); // 2

               await fails(async()=> {
                   await battle.withdrawWinnings(1);
               },true);

               await advanceDays(1.01);

               await fails(async()=> {
                   await battle.withdrawWinnings(1);
               },true);

               await battle.move(1, 1, 0);

               await fails(async()=> {
                   await battle.withdrawWinnings(1);
               },true);
           });


           it("withdrawWinnings pays prize (solo winner)", async()=>{
               await battle.startGame();

               account = player0;
               await mint();
               await mint();

               await enterGame(1,0,0); // 1
               await enterGame(2, 2,0); // 2


               await advanceDays(1.01);

               await battle.move(1, 1, 0);
               await battle.move(2, -1, 0);

               let winner;
               const piece = await battle.pieces(1);
               if(BigInt(piece.data) < UINT32_MAX){
                   winner = 1;
               }else{
                   winner = 2;
               }

               const piece2 = await battle.pieces(2);


               // log("remaining:",(await battle.games(await battle.game())).remaining)
               // log("turn number:",await battle.turnNumber());
               // log("game is active",await battle.gameIsActive())
               //
               // log("piece 1:",BigInt(piece.data));
               // log("piece 2:",BigInt(piece2.data));
               //
               // log("winner:",winner)



               const gains = await getGainsFromTx( async ()=> {
                   return await battle.withdrawWinnings(winner)
               });

               const gains_expected = FEE_ENTRY * 2n * (100n - PERCENT_OWNER) / 100n;

               assert.equal(gains,gains_expected);
           });
           it("withdrawWinnings pays prize (stalemate winner)", async()=>{
               await battle.startGame();



               account = player0;
               await mint();
               await mint();
               await mint();


               await enterGame(1,2,0); // 1
               await enterGame(2,4,0); // 2
               await enterGame(3,6,0); // 3


                await advanceToNextTurn();

               await battle.move(1, 1, 0);
               await battle.move(2, -1, 0);

               await advanceToNextTurn();
               await advanceToNextTurn();
               await advanceToNextTurn();
               await advanceToNextTurn();
               await advanceToNextTurn();
               await advanceToNextTurn();
               await advanceToNextTurn();
               await advanceToNextTurn();


               let battleWinner;
               const piece = await battle.pieces(1);
               if(BigInt(piece.data) < UINT32_MAX){
                   battleWinner = 1;
               }else{
                   battleWinner = 2;
               }



               let gains = await getGainsFromTx( async ()=> {
                   return await battle.withdrawWinnings(battleWinner)
               });

               let gains_expected = FEE_ENTRY * 3n * (100n - PERCENT_OWNER) / 100n;

               assert.equal(gains,gains_expected);


               gains = await getGainsFromTx( async ()=> {
                   return await battle.withdrawWinnings(3)
               });

               gains_expected = 0n;//FEE_ENTRY * 3n * (100n - PERCENT_OWNER) / 100n;

               assert.equal(gains,gains_expected);



           });

        });

        describe("ownerWithdraw ()",async()=>{
            it("Can ownerWithdraw", async()=>{
                account = player0;
                await mint();
                await mint();

                account = player1;
                await mint();
                await mint();

                account = player2;
                await mint();
                await mint();

                account = owner;
                await succeeds(async()=>{
                   await battle.ownerWithdraw();
                });

            });
            it("Can't ownerWithdraw if not owner", async()=>{
                account = player0;
                await mint();
                await mint();

                account = player1;
                await mint();
                await mint();

                account = player2;
                await mint();
                await mint();

                account = nonOwner;
                await fails(async()=>{
                    await battle.ownerWithdraw();
                });
            });
            it("Can't ownerWithdraw if nothing to withdraw", async()=>{
                account = player0;
                await mint();
                await mint();

                account = player1;
                await mint();
                await mint();

                account = player2;
                await mint();
                await mint();

                account = owner;
                await battle.ownerWithdraw();
                await fails(async()=>{
                    await battle.ownerWithdraw();
                });

                account = player2;
                await mint();

                account = owner;
                await succeeds(async()=>{
                    await battle.ownerWithdraw();
                });
            })
        });

    });

    describe("BattleToken",async()=> {
        describe("setBattle ( address _battle )", async()=>{
            beforeEach(async()=>{
                await refresh_contracts(false);
            })
            it("Can setBattle", async()=>{
                await succeeds(async()=> {
                    await battleToken.setBattle(Battle.address);
                },true);
            });
            it("Can't setBattle if already set", async()=>{
                await battleToken.setBattle(Battle.address);

                await fails(async()=> {
                    await battleToken.setBattle(Battle.address);
                },true);
            });
        });

        describe("mint ( address to, uint tokenId )", async()=>{
            beforeEach(async()=>{
                await refresh_contracts(false);
                await battleToken.setBattle(approved.address);
            })

            it("Can mint", async()=>{
                account = approved;
                await succeeds(async()=> {
                    await battleToken.mint(player1.address,1);
                },true);
            });
            it("Can't mint if not battle", async()=>{
                account = nonApproved;
                await fails(async()=> {
                    await battleToken.mint(player1.address,1);
                },true);
            });
        });

    });


    describe("GasEstimates",async()=>{


        beforeEach(async()=>{
            resetGas();
            await battle.startGame();

        });
        afterEach(async()=>{
            logGas();
        })
        it("Mint token",async()=>{



            tallyGas(await mint());
            tallyGas(await mint());
            tallyGas(await mint());

            account = player0;

            tallyGas(await mint());
            tallyGas(await mint());
            tallyGas(await mint());

            account = player1;

            tallyGas(await mint());
            tallyGas(await mint());
            tallyGas(await mint());



        });
        it("Enter game",async()=>{

            account = owner;
            await mint();
            tallyGas(await enterGame(1,0,0));

            account = player0;
            await mint();
            tallyGas(await enterGame(2,2,0));

            account = player1;
            await mint();
            tallyGas(await enterGame(3,0,2));

            account = player2;
            await mint();
            tallyGas(await enterGame(4,6,8));

            account = approved;
            await mint();
            tallyGas(await enterGame(5,8,8));




        });
        it("Move, no other action",async()=>{

            account = owner;
            await mint();
            await enterGame(1,0,0);

            account = player0;
            await mint();
            await enterGame(2,2,0);

            account = player1;
            await mint();
            await enterGame(3,0,2);

            account = player2;
            await mint();
            await enterGame(4,6,8);

            account = approved;
            await mint();
            await enterGame(5,8,8);

            await advanceToNextTurn();

            account = owner;
            tallyGas(await move(1,0,1));

            account = player0;
            tallyGas(await move(2,0,1));

            account = player1;
            tallyGas(await move(3,0,1));

            account = player2;
            tallyGas(await move(4,-1,0));

            account = approved;
            tallyGas(await move(5,-1,0));



        });
        it("Move, pick up first weapon",async()=>{

            account = owner;
            await mint();
            await enterGame(1,2,0);

            account = player0;
            await mint();
            await enterGame(2,4,0);

            account = player1;
            await mint();
            await enterGame(3,6,0);

            account = player2;
            await mint();
            await enterGame(4,2,8);

            account = approved;
            await mint();
            await enterGame(5,4,8);

            await advanceToNextTurn();

            account = owner;
            await move(1,1,1)

            account = player0;
            await move(2,0,1)

            account = player1;
            await move(3,-1,1)

            account = player2;
            await move(4,1,-1)

            account = approved;
            await move(5,0,-1)


            await advanceToNextTurn();

            account = owner;
            await move(1,0,1)

            account = player0;
            await move(2,0,1)

            account = player1;
            await move(3,0,1)

            account = player2;
            await move(4,0,-1)

            account = approved;
            await move(5,0,-1)



            await advanceToNextTurn();

            account = owner;
            await move(1,0,1)

            account = player0;
            await move(2,0,1)

            account = player1;
            await move(3,0,1)

            account = player2;
            await move(4,0,-1)

            account = approved;
            await move(5,0,-1)


            await advanceToNextTurn();

            account = owner;
            tallyGas(await move(1,0,1));

            account = player0;
            tallyGas(await move(2,0,1))

            account = player1;
            tallyGas(await move(3,0,1))

            account = player2;
            tallyGas(await move(4,0,-1))

            account = approved;
            tallyGas(await move(5,0,-1))


        });
        it("Move, pick up subsequent weapon", async()=>{

            account = owner;
            await mint();
            await enterGame(1,2,0);
            await mint();


            account = player1;
            await mint();
            await enterGame(3,6,0);

            account = player2;
            await mint();
            await enterGame(4,2,8);

            account = approved;
            await mint();
            await enterGame(5,6,8);

            await advanceToNextTurn();

            account = owner;
            await move(1,1,1)

            account = player1;
            await move(3,-1,1)

            account = player2;
            await move(4,1,-1)

            account = approved;
            await move(5,-1,-1)


            await advanceToNextTurn();

            account = owner;
            await move(1,0,1)

            account = player1;
            await move(3,0,1)

            account = player2;
            await move(4,0,-1)

            account = approved;
            await move(5,0,-1)


            await advanceToNextTurn();

            account = owner;
            await move(1,0,1)

            account = player1;
            await move(3,0,1)

            account = player2;
            await move(4,0,-1)

            account = approved;
            await move(5,0,-1)


            // log(1, "x:",(await battle.pieces(1)).x,"y:", (await battle.pieces(1)).y);
            // log(3, "x:",(await battle.pieces(3)).x,"y:", (await battle.pieces(3)).y);
            // log(4, "x:",(await battle.pieces(4)).x,"y:", (await battle.pieces(4)).y);
            // log(5, "x:",(await battle.pieces(5)).x,"y:", (await battle.pieces(5)).y);

            // return;



            await advanceToNextTurn();

            account = owner;
            tallyGas(await move(1,0,1));

            // return;

            account = player1;
            tallyGas(await move(3,-1,0))

            account = player2;
            tallyGas(await move(4,1,0))

            account = approved;
            tallyGas(await move(5,0,-1))
        });
        it("Move, battle (win)", async()=>{
            account = owner;
            await mint();
            await enterGame(1,2,0);

            account = player0;
            await mint();
            await enterGame(2,4,0);

            account = player1;
            await mint();
            await enterGame(3,6,0);

            account = player2;
            await mint();
            await enterGame(4,2,8);

            account = approved;
            await mint();
            await enterGame(5,4,8);



            account = owner;
            await mint();
            await enterGame(6,8,0);

            account = player0;
            await mint();
            await enterGame(7,8,2);

            account = player1;
            await mint();
            await enterGame(8,8,4);

            account = player2;
            await mint();
            await enterGame(9,8,6);

            account = approved;
            await mint();
            await enterGame(10,8,8);


        let tx;

            await advanceToNextTurn();

            account = owner;
            await move(1,1,1)
            await move(6,0,1)


            account = player0;
            await move(2,0,1)
            await move(7,0,1)

            account = player1;
            await move(3,-1,1)

            account = player2;
            await move(4,1,-1)
            await move(9,0,-1)


            account = approved;
            await move(5,0,-1)
            await move(10,0,-1)


            await advanceToNextTurn();

            let dead = {};
            account = owner;
            await move(1,0,1)
            await move(6,0,1)

            account = player0;
            await move(2,0,1)
            tx = await move(7,0,1)
            dead[7] = BigInt((await battle.pieces(7)).data) === 2n**32n - 1n;
            if(!dead[7]){
                tallyGas(tx);
            }


            account = player1;
            await move(3,0,1)


            account = player2;
            await move(4,0,-1)
            tx = await move(9,0,-1)
            dead[9] = BigInt((await battle.pieces(9)).data) === 2n**32n - 1n;
            if(!dead[9]){
                tallyGas(tx);
            }

            account = approved;
            await move(5,0,-1)
            await move(10,0,-1)


            dead[7] = BigInt((await battle.pieces(7)).data) === 2n**32n - 1n;
            dead[8] = BigInt((await battle.pieces(8)).data) === 2n**32n - 1n;
            dead[9] = BigInt((await battle.pieces(9)).data) === 2n**32n - 1n;



            await advanceToNextTurn();

            account = owner;
            await move(1,0,1)
            await move(6,0,1)

            account = player0;
            await move(2,0,1)

            account = player1;
            await move(3,0,1)

            account = player2;
            await move(4,0,-1)

            account = approved;
            await move(5,0,-1)
            await move(10,0,-1)



            await advanceToNextTurn();

            account = owner;
            await move(1,1,1);

            tx = await move(6,0,1)
            dead[6] = BigInt((await battle.pieces(6)).data) === 2n**32n - 1n;
            if(!dead[6]){
                tallyGas(tx);
            }

            account = player0;
            tx = await move(2,0,1);
            dead[2] = BigInt((await battle.pieces(2)).data) === 2n**32n - 1n;
            if(!dead[2]){
                tallyGas(tx);
            }

            account = player1;
            tx = await move(3,-1,1)
            dead[3] = BigInt((await battle.pieces(3)).data) === 2n**32n - 1n;
            if(!dead[3]){
                tallyGas(tx);
            }

            account = player2;
            tx = await move(4,1,-1)
            dead[4] = BigInt((await battle.pieces(4)).data) === 2n**32n - 1n;
            if(!dead[4]){
                tallyGas(tx);
            }

            account = approved;
            tx = await move(5,0,-1)
            dead[5] = BigInt((await battle.pieces(5)).data) === 2n**32n - 1n;
            if(!dead[5]){
                tallyGas(tx);
            }

            tx = await move(10,0,-1)
            dead[10] = BigInt((await battle.pieces(10)).data) === 2n**32n - 1n;
            if(!dead[10]){
                tallyGas(tx);
            }

        });
        it("Move, battle (lose)", async()=>{
            account = owner;
            await mint();
            await enterGame(1,2,0);

            account = player0;
            await mint();
            await enterGame(2,4,0);

            account = player1;
            await mint();
            await enterGame(3,6,0);

            account = player2;
            await mint();
            await enterGame(4,2,8);

            account = approved;
            await mint();
            await enterGame(5,4,8);



            account = owner;
            await mint();
            await enterGame(6,8,0);

            account = player0;
            await mint();
            await enterGame(7,8,2);

            account = player1;
            await mint();
            await enterGame(8,8,4);

            account = player2;
            await mint();
            await enterGame(9,8,6);

            account = approved;
            await mint();
            await enterGame(10,8,8);


            let tx;

            await advanceToNextTurn();

            account = owner;
            await move(1,1,1)
            await move(6,0,1)


            account = player0;
            await move(2,0,1)
            await move(7,0,1)

            account = player1;
            await move(3,-1,1)

            account = player2;
            await move(4,1,-1)
            await move(9,0,-1)


            account = approved;
            await move(5,0,-1)
            await move(10,0,-1)


            await advanceToNextTurn();

            let dead = {};
            account = owner;
            await move(1,0,1)
            await move(6,0,1)

            account = player0;
            await move(2,0,1)
            tx = await move(7,0,1)
            dead[7] = BigInt((await battle.pieces(7)).data) === 2n**32n - 1n;
            if(dead[7]){
                tallyGas(tx);
            }


            account = player1;
            await move(3,0,1)


            account = player2;
            await move(4,0,-1)
            tx = await move(9,0,-1)
            dead[9] = BigInt((await battle.pieces(9)).data) === 2n**32n - 1n;
            if(dead[9]){
                tallyGas(tx);
            }

            account = approved;
            await move(5,0,-1)
            await move(10,0,-1)


            dead[7] = BigInt((await battle.pieces(7)).data) === 2n**32n - 1n;
            dead[8] = BigInt((await battle.pieces(8)).data) === 2n**32n - 1n;
            dead[9] = BigInt((await battle.pieces(9)).data) === 2n**32n - 1n;



            await advanceToNextTurn();

            account = owner;
            await move(1,0,1)
            await move(6,0,1)

            account = player0;
            await move(2,0,1)

            account = player1;
            await move(3,0,1)

            account = player2;
            await move(4,0,-1)

            account = approved;
            await move(5,0,-1)
            await move(10,0,-1)



            await advanceToNextTurn();

            account = owner;
            await move(1,1,1);

            tx = await move(6,0,1)
            dead[6] = BigInt((await battle.pieces(6)).data) === 2n**32n - 1n;
            if(dead[6]){
                tallyGas(tx);
            }

            account = player0;
            tx = await move(2,0,1);
            dead[2] = BigInt((await battle.pieces(2)).data) === 2n**32n - 1n;
            if(dead[2]){
                tallyGas(tx);
            }

            account = player1;
            tx = await move(3,-1,1)
            dead[3] = BigInt((await battle.pieces(3)).data) === 2n**32n - 1n;
            if(dead[3]){
                tallyGas(tx);
            }

            account = player2;
            tx = await move(4,1,-1)
            dead[4] = BigInt((await battle.pieces(4)).data) === 2n**32n - 1n;
            if(dead[4]){
                tallyGas(tx);
            }

            account = approved;
            tx = await move(5,0,-1)
            dead[5] = BigInt((await battle.pieces(5)).data) === 2n**32n - 1n;
            if(dead[5]){
                tallyGas(tx);
            }

            tx = await move(10,0,-1)
            dead[10] = BigInt((await battle.pieces(10)).data) === 2n**32n - 1n;
            if(dead[10]){
                tallyGas(tx);
            }

        });


    });

    describe("Extra checks",async()=>{
        it("Weapon stats roll corrctly", async()=>{
            await battle.startGame();

            // log(await viewer.getCurrentBoard());

            log(await battle.pieces(801));
            log(await battle.getStats(801));
        });
    });
});