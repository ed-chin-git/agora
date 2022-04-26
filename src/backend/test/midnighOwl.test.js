/* __________UNIT TESTS_________
   
Run tests via hardhat :  $npx hardhat test
docs: https://hardhat.org/tutorial/testing-contracts.html

vid time https://youtu.be/Q_cxytZZdnc?t=2629
https://www.edureka.co/blog/advanced-javascript-tutorial/

____ Tech Stack & Tools _____
WAFFLE : library for writing and testing smart contracts.
         Sweeter, simpler and faster than Truffle.
         Works with ethers-js. 
         https://www.getwaffle.io

MOCHA : feature-rich JavaScript test framework running on Node.js
        Makes asynchronous testing simple and fun. 
        Mocha tests run serially, allowing for flexible and accurate reporting, 
        while mapping uncaught exceptions to the correct test cases.
        https://mochajs.org/ 

 CHAIjs - Assertion library :  https://www.chaijs.com/
    
___________________________________________________________________*/

const { expect } = require("chai")
const { ethers } = require("hardhat")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("UNIT TESTS : Main Smart Contract", function () {
    const erc721Name = "MidnightOwl"
    const erc721Symbol = "MOWL"
    let smartContract
    let deployer, artist, user1, user2, users;
    let royaltyFee = toWei(0.01);
    let metadataURI = "https://bafybeihzlnpv7eq5i5utkmc7xeub3gvzszjiqu6jv5rpbdhi42niefb6du.ipfs.nftstorage.link/";
    let prices = [toWei(1),
                  toWei(2),
                  toWei(3),
                  toWei(4),
                  toWei(5),
                  toWei(6),
                  toWei(7),
                  toWei(8) ];
    let deploymentFees = toWei(prices.length * 0.01)

    // beforeEach() is run before each test in a describe : MochaJS
    beforeEach(async () => {
        // instantiate ContractFactory obj
        const smartContractName = "MidnightOwl"
        const contractFactory = await ethers.getContractFactory(smartContractName);
        // Assign first 4 sample wallets(signers) to deployer, artists, users ...
        [deployer, artist, user1, user2, ...users] = await ethers.getSigners();

        // Deploy smart contract to blockchain
        smartContract = await contractFactory.deploy(
            artist.address,
            royaltyFee,
            prices,
            { value: deploymentFees }
        );
    });
    
    describe("Deployment Test", function () {
        it("ERC721 name, symbol are valid", async function () {
            expect(await smartContract.name()).to.equal(erc721Name);
            expect(await smartContract.symbol()).to.equal(erc721Symbol);
        });
        it("Artist address, royalty fee, and data URI are valid", async function () {
            expect(await smartContract.metadataURI()).to.equal(metadataURI);
            expect(await smartContract.royaltyFee()).to.equal(royaltyFee);
            expect(await smartContract.artist()).to.equal(artist.address);
        });
        it("Number of initial audio NFTs = 8", async function () {
            expect( await smartContract.balanceOf(smartContract.address)).to.equal(8);
        });
        it("Deployment Fee(0.01 eth) total balance = "+ fromWei(deploymentFees)+" eth", async function () {
            expect( await ethers.provider.getBalance(smartContract.address)).to.equal(deploymentFees);
        });
        it("Audio NFT data fields are valid", async function () {
            // get each item in from the marketPlace array then check validity of fields
            await Promise.all(prices.map(async (i, indx) => {
                const item = await smartContract.marketItems(indx)
                expect(item.tokenId).to.equal(indx)
                expect(item.seller).to.equal(deployer.address)
                expect(item.price).to.equal(i)
            }));
        });
    })

    describe("Test UpdateRoyaltyFee()", function () {
        const fee = toWei(0.02)
        it("Royalty fee amount changed properly", async function () {
            await smartContract.updateRoyaltyFee(fee)
            expect(await smartContract.royaltyFee()).to.equal(fee)
        });
        it("Only deployer can update royalty fee", async function () {
            await expect(smartContract.connect(user1).updateRoyaltyFee(fee)
                ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
    describe("function BuyToken", function () {
        //  https://youtu.be/Q_cxytZZdnc?t=3386
        it("Updates seller to zero addr, transfers, pays royalty, & emits event", async function () {
            // ___ store balances BEFORE buying ___
            const deployerInitialEthBal = await deployer.getBalance()
            const artistInitialEthBal = await artist.getBalance()

            // ___ user1 buys NFT/token #0 & triggers MarketItemBought event ___
            const tokenId = 0
            await expect(smartContract.connect(user1).buyToken(tokenId, {value: prices[tokenId]}))
             .to.emit(smartContract, "MarketItemBought")
             .withArgs(
                tokenId,
                deployer.address,
                user1.address,
                prices[tokenId]
             )

            // ___ store balances AFTER buying ____
            const deployerFinalEthBal = await deployer.getBalance()
            const artistFinalEthBal = await artist.getBalance()
            
            // __ item sold should have zeroed address ___
            expect( (await smartContract.marketItems(tokenId)).seller).to.equal("0x0000000000000000000000000000000000000000")

            // __ seller should receive pmt = price of NFT sold ___
            //  why the + in front of fromWei() ??? signing?
            expect(+fromWei(deployerFinalEthBal) ).to.equal(+fromWei(prices[tokenId]) + +fromWei(deployerInitialEthBal))

            // __ artist should receive royalty fee ___
            expect(+fromWei(artistFinalEthBal) ).to.equal(+fromWei(royaltyFee) + +fromWei(artistInitialEthBal))

            // // __ buyer should own the NFT ___
            expect( await smartContract.ownerOf(tokenId) ).to.equal( user1.address )
        });
        it("Should fail when ether amt sent does not = asking price", async function () {
            const tokenId = 0
            await expect(smartContract.connect(user1).buyToken(tokenId, { value: prices[tokenId+1]} )
            ).to.be.revertedWith("Please send the asking price in order to complete the transaction");
        });
    });
    describe("function relistToken", function () {
        //  https://youtu.be/Q_cxytZZdnc?t=3572
        beforeEach (async function () {
            // user1 purchases an item
            const tokenId = 0
            await smartContract.connect(user1).buyToken(tokenId, {value: prices[tokenId]})
        });

        it("Relists NFT , adds royalty fee, & emits event", async function () {
            const resalePrice = toWei(2)
            const initMarketBal = await ethers.provider.getBalance(smartContract.address)
            // user1 lists the nft at  price = 2, hoping to flip it @ 2x his investment
            const tokenId = 0
            await expect(smartContract.connect(user1).relistToken(tokenId, resalePrice, {value: royaltyFee}))
             .to.emit(smartContract, "MarketItemRelisted")
             .withArgs(
                tokenId,
                user1.address,
                resalePrice
             )
            const finalMarketBal = await ethers.provider.getBalance(smartContract.address)

            // finalMarketBal must = initMarketBal + royalty fee
            expect(+fromWei(finalMarketBal)).to.equal( +fromWei(initMarketBal) + +fromWei(royaltyFee) )

            // owner of NFT should be smart contract
            expect(await smartContract.ownerOf(tokenId)).to.equal(smartContract.address)

            // validate marketItem fields in smart contract
            const item = await smartContract.marketItems(tokenId)
            expect(item.tokenId).to.equal(tokenId)
            expect(item.price).to.equal(resalePrice)
            expect(item.seller).to.equal(user1.address)
        });

        it("Should fail if price=0 & royalty not paid", async function () {
            const tokenId = 0
            await expect( smartContract.connect(user1).relistToken(tokenId, 0, {value:royaltyFee}) )
            .to.be.revertedWith("Price must be greater than zero")
            await expect( smartContract.connect(user1).relistToken(tokenId, toWei(1), {value:0}) )
            .to.be.revertedWith("Must pay royalty")


        });
    });
    describe("Get functions", function () {
        //  https://youtu.be/Q_cxytZZdnc?t=4034
        let soldItems = [0, 1, 4]
        let ownedByUser1 = [0, 1]
        let ownedByUser2 = [4]
        beforeEach (async function () {
            // user1 purchases item 0
            await (await smartContract.connect(user1).buyToken(0, {value: prices[0]})).wait();
            // user1 purchases item 1
            await (await smartContract.connect(user1).buyToken(1, {value: prices[1]})).wait();
            // user2 purchases item 4
            await (await smartContract.connect(user2).buyToken(4, {value: prices[4]})).wait();
        });

        it("getAllUnsoldTokens verified", async function () {

            console.log('_____START______')
            const results = await smartContract.getAllUnsoldTokens()
            const unsold = await Promise.all(results.map(async i => {
                const uri = await smartContract.tokenURI(i.tokenId) // get uri from contract
                // %EDC%
                console.log(i.tokenId, fromWei(i.price));
  
                // and return them
                return ({
                    price: i.price,
                    itemId: i.tokenId
                })
            }))
            console.log('_____END______')


            const unsoldItems = await smartContract.getAllUnsoldTokens()
            // make sure all the returned items have filtered out the sold items
            expect(unsoldItems.every(I =>!soldItems.some(j => j === I.tokenId.toNumber()))).to.equal(true)
            // check that the length is correct
            expect(unsoldItems.length === prices.length - soldItems.length).to.equal(true)
        });

        it("getMyTokens verified", async function () {
            // get items owned by user1
            let myItems = await smartContract.connect(user1).getMyTokens()
            // check that returned array is correct
            expect(myItems.every(i => ownedByUser1.some(j => j === i.tokenId.toNumber()))).to.equal(true)
            expect(ownedByUser1.length === myItems.length).to.equal(true)
            // get items owned by user2
            myItems = await smartContract.connect(user2).getMyTokens()
            // check that returned array is correct
            expect(myItems.every(i => ownedByUser2.some(j => j === i.tokenId.toNumber()))).to.equal(true)
            expect(ownedByUser2.length === myItems.length).to.equal(true)
        });
    });
});