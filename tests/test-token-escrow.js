const bigNumber = require('bignumber.js')
const abi = require('ethereumjs-abi');
const utils = require('ethereumjs-util');


const Dai = artifacts.require("Dai");
const Usdc = artifacts.require("FiatTokenV2");
const Tether = artifacts.require("TetherToken");
const ERC20 = artifacts.require("ERC20Token");

const V2Escrow = artifacts.require("LocalCoinSwapV2Escrow");

contract("LocalCoinSwapV2", async accounts => {
  const MAX_UINT128 = "0xffffffffffffffffffffffffffffffff";

  const _seller = '0xead9c93b79ae7c1591b1fb5323bd777e86e150d4';
  const _sellerPriv = '0xd49743deccbccc5dc7baa8e69e5be03298da8688a15dd202e20f15d5e0e9a9fb';
  const _buyer = '0xe5904695748fe4a84b40b3fc79de2277660bd1d3';
  const _buyerPriv = '0x23c601ae397441f3ef6f1075dcb0031ff17fb079837beadaf3c84d96c6f3e569';
  const _relayPriv = '0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122';
  const _value = 1010000;
  const _fee = 100;

  let fiatOnRamp; 
  let dai;
  let usdc;
  let tether;
  let erc20;
  let cryptos;


  before(async () => {
    dai = await Dai.deployed();
    usdc = await Usdc.deployed();
    tether = await Tether.deployed();
    erc20 = await ERC20.deployed();

    // [ Trade ID, Crypto Object, Name]
    cryptos = [
      ["0x6ac5743d193d42cfa02ef7c617555bf1", dai, "DAI"],
      ["0x6ac5743d193d42cfa02ef7c617555bf2", usdc, "USDC"],
      ["0x6ac5743d193d42cfa02ef7c617555bf3", tether, "TETHER"],
      ["0x6ac5743d193d42cfa02ef7c617555bf4", erc20, "ERC20"],
    ]
  })


  beforeEach(async () => {
    fiatOnRamp = await V2Escrow.new(accounts[0]);
  });

  let average = (array) => array.reduce((a, b) => a + b) / array.length;

  async function initialiseTrade(_tradeID, crypto) {
    const accounts = await web3.eth.getAccounts();

    // Calculate VRS of invitation to escrow by relayer
    const tradeHashBytes = abi.soliditySHA3(
      ['bytes16', 'address', 'address', 'uint256', 'uint16'],
      [_tradeID, _seller, _buyer, _value, _fee]);
    const tradeHashHex = utils.bufferToHex(tradeHashBytes);
    
    const instructionHashBytes = abi.soliditySHA3(
      ['bytes32',],
      [tradeHashHex,])
    const prefixedHash = utils.hashPersonalMessage(instructionHashBytes);
    const signed = utils.ecsign(
      prefixedHash,
      utils.toBuffer(_relayPriv)
    );
    const _r = utils.bufferToHex(signed.r);
    const _s = utils.bufferToHex(signed.s);
    const _v = signed.v;
    
    // Approval
    await crypto.approve(
      fiatOnRamp.address,
      _value,
      {from: accounts[1]}
    );
  
    // Open escrow
    await fiatOnRamp.createEscrow(
      _tradeID,
      crypto.address,
      _seller,
      _buyer,
      _value,
      _fee,
      _v,
      _r,
      _s,
      {from: accounts[1]}
    );

    return tradeHashHex;
  }


  it("Create escrow", async () => {
    for (const crypto of cryptos) {
      const tradeHashHex = await initialiseTrade(crypto[0], crypto[1]);
  
      let result = await fiatOnRamp.escrows(tradeHashHex);
      assert.equal(result.exists, true);
  
      const contractBalance = await crypto[1].balanceOf(fiatOnRamp.address);
      assert.equal(contractBalance, _value);
    }
  });

  it("Release", async () => {
    let gasUsed = [];
    for (const crypto of cryptos) {
      const _tradeID = crypto[0];
      await initialiseTrade(_tradeID, crypto[1]);

      const relayedSenderParams = abi.soliditySHA3(
        ["bytes16", "uint8", "uint128"],
        [_tradeID, 0x01, MAX_UINT128]);
      const prefixedHash = utils.hashPersonalMessage(relayedSenderParams);
      const signed = utils.ecsign(prefixedHash, utils.toBuffer(_sellerPriv));
      const _r = utils.bufferToHex(signed.r);
      const _s = utils.bufferToHex(signed.s);
      const _v = signed.v;

      const tx = await fiatOnRamp.relay(
        _tradeID,
        _seller,
        _buyer,
        _value,
        _fee,
        MAX_UINT128,
        _v,
        _r,
        _s,
        0x01,
        0);
      gasUsed.push(tx.receipt.gasUsed)
      console.log(`Gas used: ${crypto[2]} - release`, tx.receipt.gasUsed);

      const _totalFees = (_value * _fee / 10000);
      const buyerBalance = await crypto[1].balanceOf(_buyer);
      assert.equal(buyerBalance, _value - _totalFees);
    }
    console.log(`Average gas: ${average(gasUsed)}`)
  });

  it("Buyer cancel", async () => {
    let gasUsed = [];
    for (const crypto of cryptos) {
      const _tradeID = crypto[0];
      await initialiseTrade(_tradeID, crypto[1]);

      const relayedSenderParams = abi.soliditySHA3(
        ["bytes16", "uint8", "uint128"],
        [_tradeID, 0x02, MAX_UINT128]);
      const prefixedHash = utils.hashPersonalMessage(relayedSenderParams);
      const signed = utils.ecsign(prefixedHash, utils.toBuffer(_buyerPriv));
      const _r = utils.bufferToHex(signed.r);
      const _s = utils.bufferToHex(signed.s);
      const _v = signed.v;

      // We expect the buyer wallet to remain the same and the seller to
      //  get the trade value back when cancelling
      const buyerBalance = await crypto[1].balanceOf(_buyer);
      let expectedSellerBalance = new bigNumber(await crypto[1].balanceOf(_seller));
      expectedSellerBalance = expectedSellerBalance.plus(_value);

      const tx = await fiatOnRamp.relay(
        _tradeID,
        _seller,
        _buyer,
        _value,
        _fee,
        MAX_UINT128,
        _v,
        _r,
        _s,
        0x02,
        0,
      );
      gasUsed.push(tx.receipt.gasUsed)
      console.log(`Gas used: ${crypto[2]} - buyer cancel`, tx.receipt.gasUsed);

      const newBuyerBalance = await crypto[1].balanceOf(_buyer);
      assert.equal(newBuyerBalance.toString(), buyerBalance.toString());
      const newSellerBalance = new bigNumber(await crypto[1].balanceOf(_seller));
      assert.equal(newSellerBalance.toString(), expectedSellerBalance.toString());
    }
    console.log(`Average gas: ${average(gasUsed)}`)
  });

  it("Dispute seller wins", async () => {
    let gasUsed = [];
    for (const crypto of cryptos) {      
      const _tradeID = crypto[0];
      await initialiseTrade(_tradeID, crypto[1]);

      const _buyerPercent = 0

      const relayedSenderParams = abi.soliditySHA3(
        ["bytes16", "uint8"],
        [_tradeID, 0x03]);
      const prefixedHash = utils.hashPersonalMessage(relayedSenderParams);
      const signed = utils.ecsign(prefixedHash, utils.toBuffer(_buyerPriv));
      const _r = utils.bufferToHex(signed.r);
      const _s = utils.bufferToHex(signed.s);
      const _v = signed.v;

      // We expect the buyer wallet to remain the same and the seller to
      //  get the trade value back when cancelling
      const buyerBalance = await crypto[1].balanceOf(_buyer);
      let expectedSellerBalance = new bigNumber(await crypto[1].balanceOf(_seller));
      expectedSellerBalance = expectedSellerBalance.plus(_value);

      const tx = await fiatOnRamp.resolveDispute(
        _tradeID,
        _seller,
        _buyer,
        _value,
        _fee,
        _v,
        _r,
        _s,
        _buyerPercent
      );
      gasUsed.push(tx.receipt.gasUsed)
      console.log(`Gas used: ${crypto[2]} - dispute seller wins`, tx.receipt.gasUsed);

      const newBuyerBalance = await crypto[1].balanceOf(_buyer);
      assert.equal(newBuyerBalance.toString(), buyerBalance.toString());
      const newSellerBalance = new bigNumber(await crypto[1].balanceOf(_seller));
      assert.equal(newSellerBalance.toString(), expectedSellerBalance.toString());
    }
    console.log(`Average gas: ${average(gasUsed)}`)
  });

  it("Dispute buyer wins", async () => {
    let gasUsed = [];
    for (const crypto of cryptos) {      
      const _tradeID = crypto[0];
      await initialiseTrade(_tradeID, crypto[1]);

      const _buyerPercent = 100

      const relayedSenderParams = abi.soliditySHA3(
        ["bytes16", "uint8"],
        [_tradeID, 0x03]);
      const prefixedHash = utils.hashPersonalMessage(relayedSenderParams);
      const signed = utils.ecsign(prefixedHash, utils.toBuffer(_buyerPriv));
      const _r = utils.bufferToHex(signed.r);
      const _s = utils.bufferToHex(signed.s);
      const _v = signed.v;

      // We expect the buyer wallet to remain the same and the seller to
      //  get the trade value back when cancelling
      let buyerBalance = new bigNumber(await crypto[1].balanceOf(_buyer));
      const sellerBalance = new bigNumber(await crypto[1].balanceOf(_seller));
      const _totalFees = (_value * _fee / 10000);
      buyerBalance = buyerBalance.plus(_value).minus(_totalFees);

      const tx = await fiatOnRamp.resolveDispute(
        _tradeID,
        _seller,
        _buyer,
        _value,
        _fee,
        _v,
        _r,
        _s,
        _buyerPercent
      );
      gasUsed.push(tx.receipt.gasUsed)
      console.log(`Gas used: ${crypto[2]} - dispute buyer wins`, tx.receipt.gasUsed);

      const newBuyerBalance = await crypto[1].balanceOf(_buyer);
      assert.equal(newBuyerBalance.toString(), buyerBalance.toString());
      const newSellerBalance = new bigNumber(await crypto[1].balanceOf(_seller));
      assert.equal(newSellerBalance.toString(), sellerBalance.toString());
    }
    console.log(`Average gas: ${average(gasUsed)}`)
  });
});