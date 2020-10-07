require('dotenv').config();
const fs = require('fs');
const Web3 = require('web3');

// Script variables
const DEPLOYED_ADDRESS = '0x559A805DA2f7e6bcDa9E9C0e16BaEb10b2F64341';
const NEW_RELAY = '0x877cf5F02497607E0B4e4E6AaF6C275648Cd5ce5';
const OWNER_PRIV = process.env.PRIV;
const WEB3_PROVIDER = process.env.WEB3_API;

// Setup Web3 and signer
const web3 = new Web3(new Web3.providers.HttpProvider(WEB3_PROVIDER));
web3.eth.accounts.wallet.add(OWNER_PRIV);
const { address } = web3.eth.accounts.wallet['0'];
console.log("Signing address", address);

// Instantiate contract
var V2JSON = JSON.parse(fs.readFileSync("artifacts/LocalCoinSwapV2Escrow.json"));
let V2 = new web3.eth.Contract(V2JSON.abi, DEPLOYED_ADDRESS);

// Log current relay
let relayer;
async function log_relayer() {
    relayer = await V2.methods.relayer().call();
    console.log("Relayer address", relayer);
}
log_relayer();

// Update relay
async function set_relay() {
  let gas = await new Promise((resolve, reject) => {
    V2.methods.setRelayer(NEW_RELAY).estimateGas({ from: address }).then((gas) => { resolve({ gas }); })
    .catch((error) => { console.log(error); reject({ error }); });
  });
  console.log("Tx estimated gas", gas.gas);

  if (relayer === NEW_RELAY) {
    console.log("Relayer already set to specified address");
    return;
  }

  let result = await new Promise((resolve, reject) => {
    V2.methods.setRelayer(NEW_RELAY).send({ from: address, gas: gas.gas }).then((tx_hash) => { resolve({ tx_hash }); })
      .catch((error) => { console.log(error); reject({ error }); });
  });
  console.log(result);
}
set_relay()
