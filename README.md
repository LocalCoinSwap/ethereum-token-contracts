# escrow-contract
LocalCoinSwap non-custodial smart contracts for Ethereum & Tokens.

## Installation

We use the Buidler tool for local smart contract development, due to the versatile manner in which it can handle smart contracts built with different versions of Solidity.

After pulling from remote and cd'ing to directory:
```
yarn install
```

## Development and testing

The first step in local development is to compile all of the smart contracts, which will populate the artifacts directory.

Currently Buidler requires different config files for different versions of Solidity. Our smart contracts all use the same version and are specified in the standard config file, but we use other projects contracts which use different versions. 

Use the provided script to compile everything
```
./compile.sh
```

The next step is to run tests for all of the compiled smart contracts:
```
npx buidler test
```

## Deployment

Set private key and infura API in .env, then:
```
npx buidler --network mainnet deploy --write true
```

## Verification:

Set Etherscan key in `.env` and run:
```
npx buidler verify --network mainnet DEPLOYED_CONTRACT_ADDRESS
```