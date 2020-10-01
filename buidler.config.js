usePlugin("@nomiclabs/buidler-truffle5");

module.exports = {
  networks: {
    "buidlerevm": {
      "chainId": 1,
    }
  },
  solc: {
    version: "0.5.17",
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  paths: {
    sources: "./contracts/localcoinswap",
    tests: "./tests",
  },
};