pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Marketplace {
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;
    
    // Define available categories
    string[] public categories = ["Electronics", "Clothing", "Books", "Home", "Other"];
    
    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
        string category;
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

    constructor() public {
        name = "Dapp University Marketplace";
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
        products[productCount] = Product(productCount, _name, _price, msg.sender, false, _category);
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
        // Pay the seller by sending them Ether
        address(_seller).transfer(msg.value);
        // Trigger an event
        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true, _product.category);
    }

    // Helper function to get all categories
    function getCategories() public view returns (string[] memory) {
        return categories;
    }
}
