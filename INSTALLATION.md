# Setup (linux)
https://blog.suhailkakar.com/setup-and-build-your-first-web-3-application  
https://medium.com/building-blocks-on-the-chain/how-to-build-a-react-dapp-with-hardhat-and-metamask-9cec8f6410d3#7c9f  
https://medium.com/coinsbench/building-a-dapp-using-truffle-and-react-with-ci-cd-integration-aa278a207247  
https://youtu.be/Q_cxytZZdnc  
## Install dependencies
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
    > $ git clone https://github.com/EDC-Web3-Lab/Agora.git

- Install npm dependencies 
    > $ npm install
- Install identicon.js
    > $ npm install identicon
- Install React router components  (version 6)
    > $ npm install react-router-dom@6.3.0
- Install Openzeppelin Smart Contract library
    > $ npm install @openzeppelin/contracts@4.5.0

## Launch a local blockchain node
### Hardhat 
+ Start a local ethereum node for testing
    > $ npx hardhat node
+ Must be running a version of nodeJS supported by Hardhat
+ Smart Contracts/Tokens must be deployed to the blockchain using deploy.js before launching the application
+ Hardhat javascript console
    > $ npx hardhat console --network localhost
    >& const contract = 

## Smart Contract development workflow
+ Modify smart contract code in Agora_contracts.sol
+ If not already there, add smart contract to deploy.js . Location is commented.
+ Compile & deploy to executing hardhat process.
    > $npm run deploy
+ src/back/scripts/deploy.js contains the code for deploying the smart contract to the Hardhat blockchain node.
+ deploys using first demo wallet account 
+ Note Smart contract address for next step
+ Verify deployment using hardhat console
  > $ npx hardhat console --network localhost
  >>const contract = await ethers.getContractAt(".sol contract name","smart contract address")

 
## Start the Application
+ NodeJS must be installed and running
+ From the application directory
    > $npm run start
## Sample Application Data
+ IPFS  : create initial NFT metadata file(.car) from JSON metadata https://car.ipfs.io 
+ NFT.storage  : store NFT metadata in .car files. https://NFT.storage/new-file/
    * Create a new account and login to upload metadata files
    * Creates URI address accessed by smart contract code
+ src/back/scripts/deploy.js contains the code for deploying the smart contract to the Hardhat blockchain node.

## Deploy to AWS
+ https://aws.amazon.com/getting-started/hands-on/build-react-app-amplify-graphql/module-one/?e=gs2020&p=build-a-react-app-intro  

## Webpack issue
The issue is tied to the version of react-scripts you are using. v5 has an issue as it excludes support for some node features and polyfills that were available in lower versions.

Your quick fix is to take react scripts down to v4 until a fix for v5 is in place unless you are comfortable with: 1) ejecting your app; 2) adding the webpack config changes that are needed. This link recaps the ongoing discussion of this topic.

Issue Recap:
+ https://stackoverflow.com/questions/68206050/breaking-change-webpack-5-used-to-include-polyfills-for-node-js-core-modules  
+ https://stackoverflow.com/questions/70591567/module-not-found-error-cant-resolve-fs-in-react  
+ https://github.com/facebook/create-react-app/issues/11756  

TL:DR   react-scripts:5.0 $ webpack:5.72 don't play together
Use react-scripts <5.0  until resolved.
webpack config is here: node_modules/react-scripts/config/webpack.config.js

+ npm ls
+ npm view react-scripts versions
+ npm uninstall react-scripts
+ npm install react-scripts@4.0.3

## Downgrading react-scripts to 4.0.3  
> MidnightOwl@0.1.0 start
> react-scripts start


There might be a problem with the project dependency tree.
It is likely not a bug in Create React App, but something you need to fix locally.

The react-scripts package provided by Create React App requires a dependency:

  "webpack": "4.44.2"

Don't try to install it manually: your package manager does it automatically.
However, a different version of webpack was detected higher up in the tree:

  /home/edc/dev/github/Agora/node_modules/webpack (version: 5.69.0) 

Manually installing incompatible versions is known to cause hard-to-debug issues.

If you would prefer to ignore this check, add SKIP_PREFLIGHT_CHECK=true to an .env file in your project.
That will permanently disable this message but you might encounter other issues.

To fix the dependency tree, try following the steps below in the exact order:

  1. Delete package-lock.json (not package.json!) and/or yarn.lock in your project folder.
  2. Delete node_modules in your project folder.
  3. Remove "webpack" from dependencies and/or devDependencies in the package.json file in your project folder.
  4. Run npm install or yarn, depending on the package manager you use.

In most cases, this should be enough to fix the problem.
If this has not helped, there are a few other things you can try:

  5. If you used npm, install yarn (http://yarnpkg.com/) and repeat the above steps with it instead.
     This may help because npm has known issues with package hoisting which may get resolved in future versions.

  6. Check if /home/edc/dev/github/Agora/node_modules/webpack is outside your project directory.
     For example, you might have accidentally installed something in your home folder.

  7. Try running npm ls webpack in your project folder.
     This will tell you which other package (apart from the expected react-scripts) installed webpack.

If nothing else helps, add SKIP_PREFLIGHT_CHECK=true to an .env file in your project.
That would permanently disable this preflight check in case you want to proceed anyway.