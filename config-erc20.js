module.exports = {
  solc: {
    version: "0.4.16",
    optimizer: {
      enabled: true,
      runs: 200
    }
  },

  paths: {
    sources: "./contracts/erc20",
  },
};