# Setup for WSL2 ( Ubuntu )
## verify WSL2 is running
## Install Ubuntu from MS Store
## documentation
https://blog.suhailkakar.com/setup-and-build-your-first-web-3-application  
https://medium.com/building-blocks-on-the-chain/how-to-build-a-react-dapp-with-hardhat-and-metamask-9cec8f6410d3#7c9f  
https://medium.com/coinsbench/building-a-dapp-using-truffle-and-react-with-ci-cd-integration-aa278a207247  
https://youtu.be/Q_cxytZZdnc  
https://youtu.be/Q_cxytZZdnc?si=OjOoJLPz7M25ilkc  

## Install linux dependencies
- Install nvm   NodeJS version manager
    > $ sudo apt install curl 

    > $ curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
    
    > $ nvm -v

- Install nodeJS using nvm
    > $ nvm install node

    > $ nvm current
- Verify node & npm(bundled) versions
    > $ node -v  
    
    > $ npm -v  
- Install Hardhat   
    https://hardhat.org/getting-started/#installation  
    https://medium.com/coinmonks/hardhat-configuration-c96415d4fcba  
    > $ npm install --save-dev hardhat@2.8.4

- (if necessary) install and enable MetaMask chrome extension https://metamask.io

- cd to project folder and clone this repo
    > $ git clone https://github.com/ed-chin-git/agora.git

- Install npm dependencies 
    > $ npm install
- Install identicon.js
    > $ npm install identicon
- Install React router components  (version 6)
    > $ npm install react-router-dom@6.3.0
- Install Openzeppelin Smart Contract library
    > $ npm install @openzeppelin/contracts@4.5.0
- Update legacy dependencies if hardhat node does not start
    > $ npm update --legacy-peer-deps

## Launch a local blockchain node
### Hardhat 
+ Start a local ethereum node : cd to project directory (location of hardhat.config.js) and launch a hardhat node for testing
    > $ cd dev/github/blockchain101/agora

    > $ npx hardhat node

+ Must be running a version of nodeJS supported by Hardhat
+ Smart Contracts/Tokens must be deployed to the blockchain using deploy_smartcontract.js before launching the application
    > $ cd src\backend\scripts
    
    > $ npm run deploy_smartcontract
+ Hardhat javascript console
    > $ npx hardhat console --network localhost  


## Smart Contract development workflow
+ Modify smart contract code in src/contracts/main_contract.sol
+ If not already there, add smart contract to deploy_smartcontract.js . Location is commented.
+ Compile & deploy to executing hardhat process. (deploy_smartcontract.js)
    > $ npm run deploy_smartcontract
+ src/back/scripts/deploy_smartcontract.js contains the code for deploying the smart contract to the Hardhat blockchain node.
+ deploys using first demo wallet account 
+ Note Smart contract address for next step
+ Verify deployment using hardhat console
  > $ npx hardhat console --network localhost  
  ~>const contract = await ethers.getContractAt(".sol contract name","smart contract address")
+ To deploy on Rinkeby testnet : https://www.scien.cx/2021/09/17/how-to-deploy-a-smart-contract-to-rinkeby-testnet-using-infura-and-hardhat/


## Connect MetaMask to Hardhat 
Select the “Add Network” button and you will be greeted with a form requesting for the relevant network details.   
In order to connect to our local network, we will be using the following:
+ Network Name: localhost:8545 — This is up to you and defines how the network will show up in your network dropdown.
+ New RPC URL: http://127.0.0.1:8545 — The endpoint returned from running npx hardhat node earlier.
+ Chain ID: 1337 — This is the default chain identifier that is implemented by Hardhat. You can refer to their documentation here.
+ Currency Symbol: ETH — This is up to you and defines the symbol for the local network currency (ie. ETH).  
### Import Hardhat Test Accounts into metamask
+ Select the hardhat network in metamask
+ add new accounts using private keys in the hardhat blockchain (keys are listed in terminal when node is started)
 
## Start the Application
+ NodeJS must be installed and running
+ From the application directory
    > $ npm run start
## Sample Application Data
+ IPFS  : create initial NFT metadata file(.car) from JSON metadata https://car.ipfs.io 
+ NFT.storage  : store NFT metadata in .car files. https://NFT.storage/new-file/
    * Create a new account and login to upload metadata files
    * Creates URI address accessed by smart contract code
+ src/backend/scripts/deploy_smartcontract.js contains the code for deploying the smart contract to the Hardhat blockchain node.

## Deploy to AWS
+ https://aws.amazon.com/getting-started/hands-on/build-react-app-amplify-graphql/module-one/?e=gs2020&p=build-a-react-app-intro  

## NPM commands
+ npm ls
+ npm view react-scripts versions
+ npm uninstall react-scripts
+ npm install react-scripts@4.0.3

## WSL commands (in Powershell)
### List installed Distros
+ wsl -l -v

### List valid Distros available for install
+ wsl -l -o

### Backup a Distro (stored in D:\WSL_backups\ )
+ wsl --export <Distro_name> <backup_filename.vhdx> --vhdx     
  i.e >  wsl --export Ubuntu Ubuntu_backup.vhdx --vhdx
### Restore a Distro
+ wsl --import <new_Distro_name> <backup_filename.vhdx> --vhdx     
  i.e >  wsl --import Ubuntu2 Ubuntu_backup.vhdx --vhdx
