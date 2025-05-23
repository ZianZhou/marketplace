# Blockchain Marketplace

A decentralized marketplace built on Ethereum where users can buy, sell, and manage products. Features include product listings, shopping cart functionality, service offerings, and the ability to donate to marketplace owners.

## 🛠 Technology Stack & Versions

- **Node.js**: v14.x or higher
- **Truffle**: v5.0.5
- **Solidity**: ^0.5.0
- **Web3.js**: v1.0.0-beta.55
- **React**: v16.8.4
- **React Bootstrap**: v1.0.0-beta.5
- **Ganache**: Latest version (for local blockchain)
- **MetaMask**: Latest version (for wallet integration)

## 📋 Prerequisites

1. Install Node.js (v14.x or higher)
2. Install Truffle globally:
   ```bash
   npm install -g truffle@5.0.5
   ```
3. Install Ganache (local blockchain)
4. Install MetaMask browser extension
5. Configure MetaMask to connect to your local Ganache blockchain

## 🚀 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone git@github.com:ZianZhou/marketplace.git
   cd marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Ganache**
   - Open Ganache
   - Create a new workspace (or use quickstart)
   - Make sure it's running on `HTTP://127.0.0.1:8545`

4. **Configure MetaMask**
   - Connect MetaMask to your local Ganache blockchain
   - Import accounts from Ganache using private keys
   - Network settings:
     - Network Name: Ganache
     - RPC URL: HTTP://127.0.0.1:8545
     - Chain ID: 1337
     - Currency Symbol: ETH

5. **Deploy smart contracts**
   ```bash
   truffle compile
   truffle migrate --reset
   ```

6. **Start the application**
   ```bash
   npm start
   ```
   The application will open in your default browser at `http://localhost:3000`

## 🌟 Features

- **Product Marketplace**
  - List products for sale with name, price, and category
  - Browse available products
  - Purchase products with ETH
  - Filter products by category
  - Search products by name
  - View product ownership details
  - Refund system for purchased items

- **My Items Dashboard**
  - View all owned products
  - Filter owned items by category
  - Search owned items by name
  - Track purchase history
  - Request refunds for eligible items

- **Shopping Cart**
  - Add multiple products to cart
  - Remove products from cart
  - View cart total
  - Checkout functionality
  - Real-time price updates

- **Services Platform**
  - Browse available services
  - Purchase services with ETH
  - View service descriptions and pricing
  - Real-time service status updates

- **Donation System**
  - Donate ETH to marketplace owners
  - Automatic split between owners
  - Transaction history tracking
  - Real-time donation confirmation

- **User Features**
  - MetaMask wallet integration
  - Real-time transaction status
  - Account balance tracking
  - Transaction history

- **Search and Filter System**
  - Category-based filtering
  - Name-based search
  - Combined search and filter functionality
  - Real-time results updates

## 💡 Usage

1. **Connecting Wallet**
   - Click "Connect Wallet" in MetaMask when prompted
   - Ensure you're connected to the Ganache network

2. **Listing a Product**
   - Fill in the product details in the "Add Product" form
   - Submit the transaction through MetaMask

3. **Purchasing Products**
   - Browse products in the marketplace
   - Click "Buy" or "Add to Cart"
   - Confirm the transaction in MetaMask

4. **Making Donations**
   - Click "Donate to Marketplace"
   - Enter the amount in ETH
   - Confirm the transaction in MetaMask

## 🔧 Common Issues & Troubleshooting

1. **MetaMask Connection Issues**
   - Ensure you're on the correct network (Ganache)
   - Reset your account in MetaMask if transactions aren't showing

2. **Transaction Failures**
   - Check if you have sufficient ETH in your wallet
   - Ensure you're using the correct account in MetaMask

3. **Contract Deployment Issues**
   - Make sure Ganache is running
   - Try running `truffle migrate --reset`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
