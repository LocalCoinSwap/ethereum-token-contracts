const Dai = artifacts.require("Dai");
const Usdc = artifacts.require("FiatTokenV2");
const Tether = artifacts.require("TetherToken");
const ERC20 = artifacts.require("ERC20Token");


module.exports = async (params) => {
  const accounts = await web3.eth.getAccounts();

  /*
  Generic ERC20
  */
  const erc20 = await ERC20.new();
  ERC20.setAsDeployed(erc20);
  await erc20.transfer(accounts[1], 100000000000)

  /* 
  USDC
  */
  const usdc = await Usdc.new();
  Usdc.setAsDeployed(usdc);
  await usdc.initialize("USDC Coin", "USDC", "USD", 6, accounts[0], accounts[0], accounts[0], accounts[0])
  await usdc.initializeV2("USD Coin")
  await usdc.configureMinter(accounts[0], 100000000000)
  await usdc.mint(accounts[1], 100000000000)

  /* 
  DAI
  */
  const dai = await Dai.new(1);
  Dai.setAsDeployed(dai);
  await dai.mint(accounts[1], 100000000000)

  /* 
  TETHER
  */
  const tether = await Tether.new(2298568033111951, "Tether", "USDT", 6);
  Tether.setAsDeployed(tether);
  await tether.transfer(accounts[1], 100000000000)
}