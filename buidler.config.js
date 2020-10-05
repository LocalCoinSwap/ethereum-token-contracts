require('dotenv').config();

usePlugin("@nomiclabs/buidler-ethers");
usePlugin("@nomiclabs/buidler-truffle5");


module.exports = {
  defaultNetwork: "buidlerevm",
  networks: {
    buidlerevm: {
      "chainId": 1,
    },
    // [BE CAREFUL THIS IS EXPENSIVE]
    mainnet: {
      url: process.env.WEB3_API,
      accounts: [process.env.PRIV]
    },
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