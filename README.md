LocalCoinSwap non-custodial smart contracts for Ethereum & Tokens.


## Installation and tests

We use the HardHat tool for local smart contract development, due to the versatile manner in which it can handle smart contracts built with different versions of Solidity.

After pulling from remote and cd'ing to directory:
```
yarn install
npx hardhat test
```


## Deployment

Set private key and infura API in .env, then:
```
npx hardhat --network mainnet deploy --write true
```

## Verification:

Set Etherscan key in `.env` and run:
```
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS OWNER_ADDRESS
```
