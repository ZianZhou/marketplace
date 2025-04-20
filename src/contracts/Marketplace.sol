pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Marketplace {
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;
    address payable[] public marketplaceOwners;
    
    // Mapping to track items owned by each address
    mapping(address => uint[]) public ownedItems;
    
    // Define available categories
    string[] public categories = ["Electronics", "Clothing", "Books", "Home", "Other"];
    
    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
        string category;
        address payable originalSeller;  // Track the original seller
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased,
        string category
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased,
        string category
    );

    event DonationReceived(
        address indexed donor,
        uint amount,
        uint timestamp
    );

    event ProductRefunded(
        uint id,
        string name,
        uint price,
        address payable seller,
        address payable buyer
    );

    constructor() public {
        name = "Dapp University Marketplace";
        // Add marketplace owners
        marketplaceOwners.push(address(0x123)); // Replace with Spencer's address
        marketplaceOwners.push(address(0x456)); // Replace with Zian's address
    }

    function donate() public payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        // Split the donation equally between owners
        uint shareAmount = msg.value / marketplaceOwners.length;
        for(uint i = 0; i < marketplaceOwners.length; i++) {
            marketplaceOwners[i].transfer(shareAmount);
        }
        
        // Emit donation event
        emit DonationReceived(msg.sender, msg.value, now);
    }

    // Helper function to validate category
    function isValidCategory(string memory _category) internal view returns (bool) {
        for (uint i = 0; i < categories.length; i++) {
            if (keccak256(abi.encodePacked(categories[i])) == keccak256(abi.encodePacked(_category))) {
                return true;
            }
        }
        return false;
    }

    function createProduct(string memory _name, uint _price, string memory _category) public {
        // Require a valid name
        require(bytes(_name).length > 0);
        // Require a valid price
        require(_price > 0);
        // Require a valid category
        require(isValidCategory(_category), "Invalid category");
        // Increment product count
        productCount ++;
        // Create the product
        products[productCount] = Product(productCount, _name, _price, msg.sender, false, _category, msg.sender);
        // Add to owner's items
        ownedItems[msg.sender].push(productCount);
        // Trigger an event
        emit ProductCreated(productCount, _name, _price, msg.sender, false, _category);
    }

    function purchaseProduct(uint _id) public payable {
        // Fetch the product
        Product memory _product = products[_id];
        // Fetch the owner
        address payable _seller = _product.owner;
        // Make sure the product has a valid id
        require(_product.id > 0 && _product.id <= productCount);
        // Require that there is enough Ether in the transaction
        require(msg.value >= _product.price);
        // Require that the product has not been purchased already
        require(!_product.purchased);
        // Require that the buyer is not the seller
        require(_seller != msg.sender);
        // Transfer ownership to the buyer
        _product.owner = msg.sender;
        // Mark as purchased
        _product.purchased = true;
        // Update the product
        products[_id] = _product;
        // Store the payment in the contract for potential refund
        // The excess payment is returned to the buyer
        if (msg.value > _product.price) {
            msg.sender.transfer(msg.value - _product.price);
        }
        // Remove from seller's items and add to buyer's items
        _removeFromOwnedItems(_seller, _id);
        ownedItems[msg.sender].push(_id);
        // Trigger an event
        emit ProductPurchased(_id, _product.name, _product.price, msg.sender, true, _product.category);
    }

    // Add fallback function to allow contract to receive ETH
    function() external payable {}

    function refundProduct(uint _id) public {
        require(_id > 0 && _id <= productCount, "Invalid product ID");
        Product storage _product = products[_id];
        require(_product.purchased, "Product is not purchased");
        require(msg.sender == _product.owner, "Only the current owner can request a refund");
        require(address(this).balance >= _product.price, "Contract has insufficient balance for refund");

        // Store values before state changes
        uint refundAmount = _product.price;
        address payable buyer = _product.owner;
        address payable seller = _product.originalSeller;

        // Update state before transfer
        _product.owner = seller;
        _product.purchased = false;
        products[_id] = _product;

        // Update ownership tracking
        _removeFromOwnedItems(buyer, _id);
        ownedItems[seller].push(_id);

        // Transfer ETH to buyer using transfer instead of call
        buyer.transfer(refundAmount);

        // Emit event
        emit ProductRefunded(_id, _product.name, refundAmount, seller, buyer);
    }

    // Helper function to remove an item from ownedItems
    function _removeFromOwnedItems(address _owner, uint _id) internal {
        uint[] storage items = ownedItems[_owner];
        for (uint i = 0; i < items.length; i++) {
            if (items[i] == _id) {
                items[i] = items[items.length - 1];
                items.pop();
                break;
            }
        }
    }

    // Function to get items owned by an address
    function getOwnedItems(address _owner) public view returns (uint[] memory) {
        return ownedItems[_owner];
    }

    // Helper function to get all categories
    function getCategories() public view returns (string[] memory) {
        return categories;
    }

    // Helper function to get marketplace owners
    function getMarketplaceOwners() public view returns (address payable[] memory) {
        return marketplaceOwners;
    }
}
