console.log("EthereumEscrow deploy task");

const name = "LocalCoinSwapEthereumEscrow";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const accounts = await ethers.getSigners();
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deployer address", deployer);

  const deployResult = await deploy(name, {
    from: deployer,
    args: [accounts[0]._address],
    logs: true,
  });

  if (deployResult.newlyDeployed) {
    console.log(
      `contract ${name} deployed at ${deployResult.receipt.contractAddress} using ${deployResult.receipt.gasUsed} gas`
    );
  }
};
