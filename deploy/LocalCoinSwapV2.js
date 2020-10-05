console.log("LocalCoinSwapV2 deploy task");

const name = "LocalCoinSwapV2Escrow";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const accounts = await ethers.getSigners();
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deployer address", deployer);

  const deployResult = await deploy(name, {
    from: deployer,
    // gas: 4000000,
    args: [accounts[0]._address],
    logs: true,
  });

  if (deployResult.newlyDeployed) {
    console.log(
      `contract ${name} deployed at ${deployResult.receipt.contractAddress} using ${deployResult.receipt.gasUsed} gas`
    );
  }
};