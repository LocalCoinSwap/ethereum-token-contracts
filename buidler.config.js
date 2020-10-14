require('dotenv').config();

usePlugin("buidler-deploy");
usePlugin("@nomiclabs/buidler-ethers");
usePlugin("@nomiclabs/buidler-truffle5");
usePlugin("@nomiclabs/buidler-etherscan");


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
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solc: {
    version: "0.5.17",
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  namedAccounts: {
    deployer: {
        default: 0,
    },
    feeCollector:{
        default: 1,
    }
  },
  paths: {
    sources: "./contracts/localcoinswap",
    tests: "./tests",
  },
};