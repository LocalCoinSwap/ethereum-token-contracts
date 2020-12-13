require('dotenv').config();
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-deploy";


export default {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      blockGasLimit: 12000000
    }
    // [BE CAREFUL THIS IS EXPENSIVE]
    // mainnet: {
    //   url: process.env.WEB3_API,
    //   accounts: [process.env.PRIV]
    // },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solidity: {
    compilers: [
      {
        version: "0.5.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.5.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.4.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: false,
            runs: 0
          }
        }
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
    ]
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
    tests: "tests",
  },
};