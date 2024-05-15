var express = require('express');
var router = express.Router();
const fs = require('fs');
const { Web3 } = require('web3');

const fromAddress = process.env.FROM_ADDRESS;
const privateKey = process.env.PRIVATE_KEY
const spender = process.env.SPENDER;
const amount = 100000000;

// fetch contract info from filesystem
const { abi } = JSON.parse(fs.readFileSync('contracts/contractABI.json', 'utf8'));
const { address } = JSON.parse(fs.readFileSync('contracts/contractAddress.json', 'utf8'));

const web3 = new Web3('https://bsc-dataseed.binance.org/');
const contract = new web3.eth.Contract(abi, address);

router.get('/total-supply', async function(req, res) {
    try {
        const value = await contract.methods.totalSupply().call()
        res.status(200).json({ total_supply: Number(value) });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

router.post('/approve', async function(req, res) {
    const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest');
    const gasPrice = await web3.eth.getGasPrice();
    const data = contract.methods.approve(spender, amount).encodeABI();

    const tx = {
        from: fromAddress,
        to: address,
        nonce: nonce,
        gas: 200000,
        gasPrice: gasPrice,
        data: data,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

    try {
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        res.status(200).json({ response: "approved" });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

module.exports = router;