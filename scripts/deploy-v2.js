
async function main() {
  const accounts = await ethers.getSigners();

  const V2 = await ethers.getContractFactory("LocalCoinSwapV2Escrow");
  const v2 = await V2.deploy(accounts[0]._address);
  
  await v2.deployed();
  
  console.log("V2 deployed to:", v2.address);
}
  
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });