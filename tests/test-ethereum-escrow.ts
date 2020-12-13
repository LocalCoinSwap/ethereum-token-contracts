import { soliditySHA3 } from 'ethereumjs-abi';
import {
  bufferToHex,
  hashPersonalMessage,
  ecsign,
  toBuffer
} from 'ethereumjs-util';
import { ethers, artifacts, web3 } from "hardhat";
import { assert } from "chai";
import { describe } from "mocha";
const EscrowContract = artifacts.require("LocalCoinSwapEthereumEscrow");


describe("Test Ethereum Escrow Contract", async () => {
  const accounts = await ethers.getSigners();
  const signer = accounts[0];
  let escrowContract

  beforeEach(async () => {
    escrowContract = await EscrowContract.new(signer.address);
    EscrowContract.setAsDeployed(escrowContract);
  });

  it("Basic example trade", async () => {
    // Basic parameters for trade
    const accounts = await web3.eth.getAccounts();
    const _tradeID = '0x6dc5743d193d42cfa02ef7c617555bf8'
    const _seller = accounts[1];
    const _buyer = accounts[2];
    const _value = 1010000;
    const _fee = 100;
    const _paymentWindowInSeconds = 2700;
    const _expiry = 1680188239;

    // Calculate _v, _r, _s
    const trade_hash_bytes = soliditySHA3(
      ['bytes16', 'address', 'address', 'uint256', 'uint16'],
      [_tradeID, _seller, _buyer, _value, _fee]);
    const trade_hash_hex = bufferToHex(trade_hash_bytes);
    const instruction_hash_bytes = soliditySHA3(
      ['bytes32', 'uint32', 'uint32'],
      [trade_hash_hex, _paymentWindowInSeconds, _expiry])
    const prefixed_hash = hashPersonalMessage(instruction_hash_bytes);
    const signed = ecsign(
      prefixed_hash,
      toBuffer("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
    );
    const _r = bufferToHex(signed.r);
    const _s = bufferToHex(signed.s);
    const _v = signed.v;

    await escrowContract.createEscrow(
      _tradeID,
      _seller,
      _buyer,
      _value,
      _fee,
      _paymentWindowInSeconds,
      _expiry,
      _v,
      _r,
      _s,
      {from: accounts[1], value: _value}
    );

    let result = await escrowContract.escrows(trade_hash_hex);
    assert.equal(result.exists, true);
  });
});