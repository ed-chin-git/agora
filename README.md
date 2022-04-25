# `Midnight Owl`  
## Framework for Web3 Applications  
A full-stack Dapp framework consisting of a React front-end running on NodeJS that interacts with a solidity smart contract deployed to an etherium-compatible blockchain.  
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
