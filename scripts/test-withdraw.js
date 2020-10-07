require('dotenv').config();
const fs = require('fs');
const Web3 = require('web3');

// Script variables
const DEPLOYED_ADDRESS = '0x559A805DA2f7e6bcDa9E9C0e16BaEb10b2F64341';
const OWNER_PRIV = process.env.PRIV;
const WEB3_PROVIDER = process.env.WEB3_API;

// Cryptos of interest
const ERC20 = [
    ["LCS", "0xAA19961b6B858D9F18a115f25aa1D98ABc1fdBA8"],
    ["NEXO", "0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206"],
    ["USDT", "0xdAC17F958D2ee523a2206206994597C13D831ec7"],
    ["DAI", "0x6B175474E89094C44Da98b954EedeAC495271d0F"],
    ["PAX", "0x8E870D67F660D95d5be530380D0eC0bd388289E1"],
    ["USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
]

// Setup Web3 and signer
const web3 = new Web3(new Web3.providers.HttpProvider(WEB3_PROVIDER));
web3.eth.accounts.wallet.add(OWNER_PRIV);
const { address } = web3.eth.accounts.wallet['0'];
console.log("Signing address", address);

// Instantiate contract
var V2JSON = JSON.parse(fs.readFileSync("artifacts/LocalCoinSwapV2Escrow.json"));
let V2 = new web3.eth.Contract(V2JSON.abi, DEPLOYED_ADDRESS);

// Log available withdrawals
const balances = {};
async function log_balances() {
  for (const crypto of ERC20) {
    const total = await V2.methods.feesAvailableForWithdraw(crypto[1]).call();
    console.log(`Available ${crypto[0]}: ${total}`);
    if (total !== '0') {
      balances[crypto[1]] = total;
    }
  }
}

// Withdraw
async function withdraw() {
  for (let [crypto, amount] of Object.entries(balances)) {
    let gas = await new Promise((resolve, reject) => {
      V2.methods.withdrawFees(
        address, crypto, amount
      ).estimateGas({ from: address }).then((gas) => { resolve({ gas }); })
      .catch((error) => { console.log(error); reject({ error }); });
    });
    console.log(`Gas for withdrawal of ${amount} ${crypto}: ${gas.gas}`);
  
    let result = await new Promise((resolve, reject) => {
      V2.methods.withdrawFees(
        address, crypto, amount
      ).send({ from: address, gas: gas.gas }).then((tx_hash) => { resolve({ tx_hash }); })
        .catch((error) => { console.log(error); reject({ error }); });
    });
    console.log(result);
  }
}

async function main() {
  await log_balances();
  await withdraw();
}
main()