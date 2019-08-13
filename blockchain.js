const crypto = require("crypto");
const EC     = require('elliptic').ec;
const ec     = new EC("secp256k1");


class Wallets {
    constructor() {
        this.wallets = {};
    }

    add(address, initialFunds) {
        this.wallets[address] = { initialFunds };
    }

    searchWallet(key) {
        return this.wallets[key];
    }
}


class Wallet {
    constructor(funds) {
        const address = ec.genKeyPair();
        
        this.publicAddress = address.getPublic().encode("hex"); 
        this.privateKey = JSON.stringify(address.getPrivate());
        this.private = ec.keyFromPrivate(this.privateKey, "hex").getPublic();
        this.funds  = funds;        
    }

    static checkFunds(address, blockChain) {

        const publicAddress = ec.keyFromPrivate(address, "hex").getPublic().encode("hex");
        let amount = blockChain.wallets.searchWallet(publicAddress).initialFunds; 
        
        for (const block of blockChain.chain) {
            for (const tx of block.transactions) {
                const publicFromAddress = ec.keyFromPrivate(tx.fromAddress, "hex").getPublic().encode("hex");
                 
                if (publicFromAddress === publicAddress) amount -= tx.amount;
                if (tx.toAddress === publicAddress) amount += tx.amount;
                
            }            
        }
        return amount;
    }


    getInitialFunds() { return this.funds; }

}

class Block {
    constructor(previousHash) {
        this.previousHash = previousHash;
        this.transactions = [];
        this.timeStamp    = Date.now();
        this.nonce        = 0;
        this.hash         = "";
    }

    genHash() {
        return this.hash = crypto.createHmac("sha256", this.previousHash + JSON.stringify(this.transactions) + this.timeStamp + this.nonce).digest("hex");
    }
}

const GeneralTransaction = blockChain => 
        (fromAddress, toAddress, amount) => 
            new Transaction(fromAddress, toAddress, amount, blockChain);



class Transaction {
    constructor(fromAddress, toAddress, amount, blockChain) {
        const parsedFromAddress = JSON.parse(fromAddress)
        const wallet            = ec.keyFromPrivate(parsedFromAddress, "hex").getPublic().encode("hex");
        
        if (!blockChain.wallets.searchWallet(wallet)) {
            wallet
            blockChain.wallets /*?*/
            throw new Error("No such wallet!")
        }
        
        if (amount > Wallet.checkFunds(parsedFromAddress, blockChain)) {
            throw new Error("No enought funds to make the transaction!")
        }
        
        this.fromAddress = JSON.parse(fromAddress);
        this.toAddress   = toAddress;
        this.amount      = amount;
    }
}


class BlockChain {
    constructor() {
        this.chain               = [ new Block("", {}) ];
        this.dificulty           = 2;
        this.pendingTransactions = [];
        this.mainWallet          = new Wallet(10000000);
        this.wallets             = new Wallets();

        this.wallets.add(this.mainWallet.publicAddress, this.mainWallet.funds)
    }

    addPendingTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    mineBlock(block, addressToReward) {
        
        block.transactions = this.pendingTransactions;
        this.pendingTransactions = [];
        
        while(block.hash.slice(0, this.dificulty) !== "0".repeat(this.dificulty)) {
            block.nonce++;
            block.genHash();
        }

        this.addPendingTransaction(new Transaction(this.mainWallet.privateKey, addressToReward, 10, this));
        this.addBlock(block)
    }

    addBlock(block) {
        this.chain.push(block);
    }

    isValid() {

        if (this.chain.length === 1) return true;

        for (let idx = 1; idx < this.chain.length; idx++) {

            const currentBlock    = this.chain[idx];
            const prevBlock       = this.chain[idx - 1];
            const isHashValid     = currentBlock.hash === currentBlock.genHash();
            const isPrevHashValid = prevBlock.hash === prevBlock.genHash() || idx === 1;  // if idx is 1 its the first block and dont have hash

            if (!isHashValid || !isPrevHashValid || currentBlock.previousHash !== prevBlock.hash && idx !== 1) {
                return false
            } 

        }
        return true
    }
}


module.exports = { BlockChain, Wallet, Wallets, Transaction, Block, GeneralTransaction };