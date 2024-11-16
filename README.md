# Agora
A full-stack Dapp framework consisting of a React front-end running on NodeJS that interacts with a solidity smart contract deployed to an etherium-compatible blockchain.  
## Framework for Web3 Applications  

This sample application models an online marketplace where a user can connect a metamask wallet to buy & sell audio NFTs.  
## Tech Stack  
+ NodeJS  : javascript runtime (backend) Version 16.14.2
+ React : front-end component-based framework
+ Ethers.js : Etherium Blockchain library https://docs.ethers.io
+ Solidity : smart contract programming 
    * https://www.theengineeringprojects.com/2021/06/what-is-solidity-programming.html
    * https://www.bitdegree.org/learn/solidity-examples 
+ OpenZeppelin : Solidity lib for Etherium Smart Contracts  https://docs.openzeppelin.com/contracts/4.x/
+ HardHat.org Version: 2.9.3 
    + Etherium local development environment https://hardhat.org/getting-started/#installation
+ SAMPLE DATA
    + IPFS  : create initial NFT metadata file(.car) from JSON metadata https://car.ipfs.io 
    + NFT.storage  : store NFT metadata in .car files. https://NFT.storage/new-file/
        * Create a new account and login to upload metadata files
        * Creates URI address accessed by smart contract code
# Development Workflow
## Launch a local blockchain node
### Hardhat 
+ Start a local ethereum node : cd to project directory (location of hardhat.config.js) and launch a hardhat node for testing
    > $ cd dev/github/blockchain101/agora

    > $ npx hardhat node

+ Must be running a version of nodeJS supported by Hardhat
+ Smart Contracts/Tokens must be deployed to the blockchain using deploy.js before launching the application
    > $ cd src\backend\scripts
    
    > $npm run deploy
+ Hardhat javascript console
    > $ npx hardhat console --network localhost

## Smart Contract development workflow
+ Modify smart contract code in src/contracts/main_contract.sol
+ Run Unit tests & check for errors
    > $ npx hardhat test
+ If not already there, add smart contract to deploy.js . Location is commented.
+ Compile & deploy to executing hardhat blockchain process. (deploy.js)
    > $ npm run src/back/scripts/deploy
+ src/back/scripts/deploy.js contains the code for deploying the smart contract to the Hardhat blockchain node.
+ deploys using first demo wallet account 
+ Note Smart contract address for next step
+ Verify deployment using hardhat console
  > $ npx hardhat console --network localhost  
   ~> const contract = await ethers.getContractAt(".sol contract name","smart contract address")
+ To deploy on Rinkeby testnet : https://www.scien.cx/2021/09/17/how-to-deploy-a-smart-contract-to-rinkeby-testnet-using-infura-and-hardhat/

 
## Start the Application
+ NodeJS must be installed and running
+ From the application directory
    > $ npm run start
## Sample Application Data
+ IPFS  : create initial NFT metadata file(.car) from JSON metadata https://car.ipfs.io 
+ NFT.storage  : store NFT metadata in .car files. https://app.nft.storage/login
    * Create a new account and login to upload metadata files
    * Creates URI address accessed by smart contract code
+ src/backend/scripts/deploy.js contains the code for deploying the smart contract to the Hardhat blockchain node.