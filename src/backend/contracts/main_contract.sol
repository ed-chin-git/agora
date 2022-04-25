// SPDX-License-Identifier: UNLICENSED
pragma solidity  ^0.8.4; 
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

string constant tokenName = "MidnightOwl";
string constant tokenSymbol = "MOWL";

/* MidnightOwl : Main Smart Contract */
contract MidnightOwl is ERC721(tokenName, tokenSymbol) , Ownable {
    // ___ STATE VARIABLES ____
    string  public metadataURI = "https://bafybeihzlnpv7eq5i5utkmc7xeub3gvzszjiqu6jv5rpbdhi42niefb6du.ipfs.nftstorage.link/";
    string  public baseExtension = ".json";
    address public artist;
    uint256 public royaltyFee;
    struct  MarketItem {
            uint256 tokenId;
            address payable seller; // notice the "payable" keyword
            uint256 price;
            }
    MarketItem[] public marketItems;    // define an array of type MarketItem

    /*  _______ EVENTS _______ */
    event MarketItemBought(
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price
    );
    event MarketItemRelisted(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    /* ______ CONSTRUCTOR ________ */
    constructor(
            address   _artist,  // underscores mark arguments versus state-variables
            uint256   _royaltyFee,
            uint256[] memory _prices
            ) payable {  
                require(_prices.length * _royaltyFee <= msg.value,"deployer must pay royalty fee for each token listed ");
                royaltyFee = _royaltyFee;
                artist = _artist;
                // loop thru each price
                for ( uint8 i = 0; i < _prices.length; i++ ) {
                    require(_prices[i] > 0, "Price must be greater than 0"); // must be valid
                    _mint(address(this), i); // mint the collection item
                    marketItems.push(MarketItem(i, payable(msg.sender), _prices[i] ) ); // add it to the marketItems array
                    }
            }   

    /* ______ FUNCTIONS ________ */
    function updateRoyaltyFee( uint256 _royaltyFee) external onlyOwner {
        royaltyFee = _royaltyFee;
    }
    // https://youtu.be/Q_cxytZZdnc?t=3215
    function buyToken( uint256 _tokenId) external payable {
        uint256 price = marketItems[_tokenId].price;
        address seller = marketItems[_tokenId].seller;

        require(msg.value == price, "Please send the asking price in order to complete the transaction" );

        marketItems[_tokenId].seller = payable(address(0)); // zero out the seller address

        _transfer(address(this), msg.sender, _tokenId);
        payable(artist).transfer(royaltyFee);
        payable(seller).transfer(msg.value);
        emit MarketItemBought(_tokenId, seller, msg.sender, price);
    }
    // https://youtu.be/Q_cxytZZdnc?t=3485
    function relistToken( uint256 _tokenId, uint256 _price) external payable {
        
        require(msg.value == royaltyFee, "Must pay royalty" ); // validate 
        require(_price >0 , "Price must be greater than zero" );

        marketItems[_tokenId].price = _price; //  set NFT price
        marketItems[_tokenId].seller = payable(msg.sender); //  set seller address
        
        _transfer(msg.sender, address(this), _tokenId); // xfer NFT from sellers wallet to smartContract
        emit MarketItemRelisted(_tokenId, msg.sender, _price);
    }
    function getAllUnsoldTokens() external view returns (MarketItem[] memory) {
        uint256 currentIndex;
        uint256 unsoldCount = balanceOf(address(this));
        MarketItem[] memory tokens = new MarketItem[](unsoldCount); // build an array of tokens
        for (uint256 i = 0; i < marketItems.length; i++) {
            if(marketItems[i].seller != address(0)) {
                tokens[currentIndex] = marketItems[i];
                currentIndex++;
            }
        }
        return (tokens);
    }
    function getMyTokens() external view returns (MarketItem[] memory) {
        uint256 currentIndex;
        uint256 myTokenCount = balanceOf(msg.sender);
        MarketItem[] memory tokens = new MarketItem[](myTokenCount); // build an array of tokens
        for (uint256 i = 0; i < marketItems.length; i++) {
            if(ownerOf(i) == msg.sender) {
                tokens[currentIndex] = marketItems[i];
                currentIndex++;
            }
        }
        return (tokens);
    }
    /* Internal function overrides _baseURI() inherited from ERC721 parent class
           returns state-variable metadataURI     */
    function _baseURI() internal view virtual override returns (string memory) {
        return metadataURI;
    }
}

/* Reference Materials and Documentation
   https://www.theengineeringprojects.com/2021/06/what-is-solidity-programming.html
   https://www.bitdegree.org/learn/solidity-examples 
*/