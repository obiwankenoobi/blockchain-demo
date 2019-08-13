const { BlockChain, Wallet,  Block, GeneralTransaction } = require("./blockchain.js");

const obiCoin     = new BlockChain();
const transaction = GeneralTransaction(obiCoin);
const myWallet    = new Wallet(1000);
const yourWallet  = new Wallet(1000);
const mainWallet  = new Wallet(1000);

obiCoin.wallets.add(myWallet.publicAddress, myWallet.funds);
obiCoin.wallets.add(yourWallet.publicAddress, yourWallet.funds);
obiCoin.wallets.add(mainWallet.publicAddress, mainWallet.funds);

const block = new Block(obiCoin.chain[obiCoin.chain.length - 1].hash);
const tx = transaction(myWallet.privateKey, yourWallet.publicAddress, 100);
const tx1 = transaction(myWallet.privateKey, yourWallet.publicAddress, 50);

obiCoin.addPendingTransaction(tx);
obiCoin.addPendingTransaction(tx1);
obiCoin.mineBlock(block, myWallet.publicAddress);
block.transactions;

obiCoin.isValid();
myWallet.privateKey;
Wallet.checkFunds(JSON.parse(myWallet.privateKey), obiCoin);

const block1 = new Block(obiCoin.chain[obiCoin.chain.length - 1].hash);

obiCoin.mineBlock(block1, myWallet.publicAddress);
Wallet.checkFunds(JSON.parse(myWallet.privateKey), obiCoin); /*?*/

obiCoin.chain[1].transactions[1].amount = 1;




