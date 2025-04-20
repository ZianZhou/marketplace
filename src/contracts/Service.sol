pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Service {
    string public name;
    uint public serviceCount = 0;
    mapping(uint => ServiceItem) public services;
    
    // Mapping to track services purchased by each address
    mapping(address => uint[]) public purchasedServices;
    
    // Define available services
    string[] public serviceTypes = [
        "Repair",
        "Install",
        "Shipping",
        "Consultation",
        "Training",
        "Data Recovery",
        "Web Development",
        "Security Audit",
        "Cloud Setup"
    ];
    
    // Define service prices (in wei)
    mapping(string => uint) public servicePrices;
    
    struct ServiceItem {
        uint id;
        string serviceType;
        uint price;
        address owner;
        bool purchased;
        address purchaser;
    }

    event ServicePurchased(
        uint id,
        string serviceType,
        uint price,
        address owner,
        address purchaser,
        bool purchased
    );

    constructor() public {
        name = "Dapp University Services";
        // Initialize service prices
        servicePrices["Repair"] = 0.1 ether;        // 0.1 ETH
        servicePrices["Install"] = 0.05 ether;      // 0.05 ETH
        servicePrices["Shipping"] = 0.02 ether;     // 0.02 ETH
        servicePrices["Consultation"] = 0.15 ether; // 0.15 ETH
        servicePrices["Training"] = 0.2 ether;      // 0.2 ETH
        servicePrices["Data Recovery"] = 0.25 ether; // 0.25 ETH
        servicePrices["Web Development"] = 0.3 ether; // 0.3 ETH
        servicePrices["Security Audit"] = 0.35 ether; // 0.35 ETH
        servicePrices["Cloud Setup"] = 0.12 ether;   // 0.12 ETH
    }

    // Helper function to validate service type
    function isValidServiceType(string memory _serviceType) internal view returns (bool) {
        for (uint i = 0; i < serviceTypes.length; i++) {
            if (keccak256(abi.encodePacked(serviceTypes[i])) == keccak256(abi.encodePacked(_serviceType))) {
                return true;
            }
        }
        return false;
    }

    function purchaseService(string memory _serviceType) public payable {
        // Validate service type
        require(isValidServiceType(_serviceType), "Invalid service type");
        
        // Get the price for the service
        uint price = servicePrices[_serviceType];
        
        // Check if enough ETH was sent
        require(msg.value >= price, "Insufficient payment");
        
        // Increment service count
        serviceCount++;
        
        // Create and purchase the service in one step
        services[serviceCount] = ServiceItem(
            serviceCount,
            _serviceType,
            price,
            address(this),  // Contract holds the service
            true,          // Marked as purchased immediately
            msg.sender     // Purchaser
        );
        
        // Add to purchaser's services
        purchasedServices[msg.sender].push(serviceCount);
        
        // Emit event
        emit ServicePurchased(
            serviceCount,
            _serviceType,
            price,
            address(this),
            msg.sender,
            true
        );
    }

    // Function to get services purchased by an address
    function getPurchasedServices(address _owner) public view returns (uint[] memory) {
        return purchasedServices[_owner];
    }

    // Helper function to get service details
    function getService(uint _id) public view returns (
        uint id,
        string memory serviceType,
        uint price,
        address owner,
        bool purchased,
        address purchaser
    ) {
        ServiceItem memory service = services[_id];
        return (
            service.id,
            service.serviceType,
            service.price,
            service.owner,
            service.purchased,
            service.purchaser
        );
    }

    // Helper function to get all service types
    function getServiceTypes() public view returns (string[] memory) {
        return serviceTypes;
    }

    // Helper function to get price for a service type
    function getServicePrice(string memory _serviceType) public view returns (uint) {
        return servicePrices[_serviceType];
    }

    // Function to withdraw contract balance (only owner can call this)
    function withdraw() public {
        address payable owner = address(uint160(address(this)));
        owner.transfer(address(this).balance);
    }
} 