const Marketplace = artifacts.require('./Marketplace.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Marketplace', ([deployer, seller, buyer]) => {
  let marketplace

  before(async () => {
    // Fund the test accounts
    const accounts = await web3.eth.getAccounts();
    const amount = web3.utils.toWei('20', 'ether');

    // Fund seller and buyer accounts from deployer
    await web3.eth.sendTransaction({
      from: deployer,
      to: seller,
      value: amount
    });

    await web3.eth.sendTransaction({
      from: deployer,
      to: buyer,
      value: amount
    });

    marketplace = await Marketplace.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await marketplace.name()
      assert.equal(name, 'Dapp University Marketplace')
    })
  })

  describe('products', async () => {
    let result, productCount

    before(async () => {
      result = await marketplace.createProduct('iPhone X', web3.utils.toWei('1', 'Ether'), 'Electronics', { from: seller })
      productCount = await marketplace.productCount()
    })

    it('creates products', async () => {
      // SUCCESS
      assert.equal(productCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'iPhone X', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, seller, 'owner is correct')
      assert.equal(event.purchased, false, 'purchased is correct')
      assert.equal(event.category, 'Electronics', 'category is correct')

      // FAILURE: Product must have a name
      await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), 'Electronics', { from: seller }).should.be.rejected
      // FAILURE: Product must have a price
      await marketplace.createProduct('iPhone X', 0, 'Electronics', { from: seller }).should.be.rejected
      // FAILURE: Product must have a valid category
      await marketplace.createProduct('iPhone X', web3.utils.toWei('1', 'Ether'), 'InvalidCategory', { from: seller }).should.be.rejected
    })

    it('lists products', async () => {
      const product = await marketplace.products(productCount)
      assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(product.name, 'iPhone X', 'name is correct')
      assert.equal(product.price, '1000000000000000000', 'price is correct')
      assert.equal(product.owner, seller, 'owner is correct')
      assert.equal(product.purchased, false, 'purchased is correct')
      assert.equal(product.category, 'Electronics', 'category is correct')
    })

    it('sells products', async () => {
      // Track the seller balance before purchase
      let oldSellerBalance
      oldSellerBalance = await web3.eth.getBalance(seller)
      oldSellerBalance = new web3.utils.BN(oldSellerBalance)

      // SUCCESS: Buyer makes purchase
      result = await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') })

      // Check logs
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'iPhone X', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, buyer, 'owner is correct')
      assert.equal(event.purchased, true, 'purchased is correct')
      assert.equal(event.category, 'Electronics', 'category is correct')

      // Check that seller received funds
      let newSellerBalance
      newSellerBalance = await web3.eth.getBalance(seller)
      newSellerBalance = new web3.utils.BN(newSellerBalance)

      let price
      price = web3.utils.toWei('1', 'Ether')
      price = new web3.utils.BN(price)

      const exepectedBalance = oldSellerBalance.add(price)

      assert.equal(newSellerBalance.toString(), exepectedBalance.toString())

      // FAILURE: Tries to buy a product that does not exist, i.e., product must have valid id
      await marketplace.purchaseProduct(99, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected
      // FAILURE: Buyer tries to buy without enough ether
      await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected
      // FAILURE: Deployer tries to buy the product, i.e., product can't be purchased twice
      await marketplace.purchaseProduct(productCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected
      // FAILURE: Buyer tries to buy again, i.e., buyer can't be the seller
      await marketplace.purchaseProduct(productCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected
    })

    it('validates categories', async () => {
      // SUCCESS: Create products with valid categories
      await marketplace.createProduct('Book', web3.utils.toWei('0.5', 'Ether'), 'Books', { from: seller }).should.be.fulfilled
      await marketplace.createProduct('T-Shirt', web3.utils.toWei('0.3', 'Ether'), 'Clothing', { from: seller }).should.be.fulfilled

      // FAILURE: Create product with invalid category
      await marketplace.createProduct('Invalid Item', web3.utils.toWei('1', 'Ether'), 'InvalidCategory', { from: seller }).should.be.rejected
    })
  })

  describe('donations', async () => {
    let result
    const donationAmount = web3.utils.toWei('1', 'Ether')

    it('allows users to donate', async () => {
      // Get initial balances of marketplace owners
      const owners = await marketplace.getMarketplaceOwners()
      const initialBalances = await Promise.all(
        owners.map(owner => web3.eth.getBalance(owner))
      )

      // Make donation
      result = await marketplace.donate({ from: buyer, value: donationAmount })

      // Check event
      const event = result.logs[0].args
      assert.equal(event.donor, buyer)
      assert.equal(event.amount.toString(), donationAmount)
      assert.notEqual(event.timestamp, 0)

      // Check that owners received their share
      const shareAmount = web3.utils.toBN(donationAmount).div(web3.utils.toBN(owners.length))
      const finalBalances = await Promise.all(
        owners.map(owner => web3.eth.getBalance(owner))
      )

      // Verify each owner received their share
      owners.forEach((owner, index) => {
        const expectedBalance = web3.utils.toBN(initialBalances[index]).add(shareAmount)
        assert.equal(finalBalances[index], expectedBalance.toString())
      })
    })

    it('requires donation amount to be greater than 0', async () => {
      await marketplace.donate({ from: buyer, value: 0 }).should.be.rejected
    })
  })

  describe('item ownership', async () => {
    let result, productCount

    before(async () => {
      // Reset the marketplace contract to ensure clean state
      marketplace = await Marketplace.new()
      // Create initial products
      await marketplace.createProduct('Laptop', web3.utils.toWei('2', 'Ether'), 'Electronics', { from: seller })
      await marketplace.createProduct('Headphones', web3.utils.toWei('0.5', 'Ether'), 'Electronics', { from: seller })
      productCount = await marketplace.productCount()
    })

    it('tracks items owned by seller', async () => {
      // Get seller's owned items
      const sellerItems = await marketplace.getOwnedItems(seller)
      assert.equal(sellerItems.length, 2, 'Seller should own 2 items')
      assert.equal(sellerItems[0].toString(), '1', 'First item ID should be 1')
      assert.equal(sellerItems[1].toString(), '2', 'Second item ID should be 2')
    })

    it('updates ownership after purchase', async () => {
      // Buyer purchases first item
      await marketplace.purchaseProduct(1, { from: buyer, value: web3.utils.toWei('2', 'Ether') })

      // Check seller's items
      const sellerItems = await marketplace.getOwnedItems(seller)
      assert.equal(sellerItems.length, 1, 'Seller should now own 1 item')
      assert.equal(sellerItems[0].toString(), '2', 'Seller should only own the second item')

      // Check buyer's items
      const buyerItems = await marketplace.getOwnedItems(buyer)
      assert.equal(buyerItems.length, 1, 'Buyer should own 1 item')
      assert.equal(buyerItems[0].toString(), '1', 'Buyer should own the first item')
    })

    it('handles multiple purchases correctly', async () => {
      // Create another product
      await marketplace.createProduct('Keyboard', web3.utils.toWei('0.3', 'Ether'), 'Electronics', { from: seller })

      // Buyer purchases the new item
      await marketplace.purchaseProduct(3, { from: buyer, value: web3.utils.toWei('0.3', 'Ether') })

      // Check seller's items
      const sellerItems = await marketplace.getOwnedItems(seller)
      assert.equal(sellerItems.length, 1, 'Seller should still own 1 item')
      assert.equal(sellerItems[0].toString(), '2', 'Seller should still own the second item')

      // Check buyer's items
      const buyerItems = await marketplace.getOwnedItems(buyer)
      assert.equal(buyerItems.length, 2, 'Buyer should now own 2 items')
      assert.include(buyerItems.map(id => id.toString()), '1', 'Buyer should own the first item')
      assert.include(buyerItems.map(id => id.toString()), '3', 'Buyer should own the third item')
    })
  })
})
