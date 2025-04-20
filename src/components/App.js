import React, { Component } from 'react';
import Web3 from 'web3'
import logo from '../logo.png';
import './App.css';
import Marketplace from '../abis/Marketplace.json'
import Service from '../abis/Service.json'
import Navbar from './Navbar'
import Main from './Main'
import ServiceComponent from './ServiceComponent'
import ShoppingCart from './ShoppingCart'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()

    // Add event listeners for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        this.setState({ loading: true })
        await this.loadBlockchainData()
      })

      window.ethereum.on('chainChanged', async () => {
        this.setState({ loading: true })
        await this.loadBlockchainData()
      })
    }

    // Add visibility change listener
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        this.setState({ loading: true })
        await this.loadBlockchainData()
      }
    })
  }

  componentWillUnmount() {
    // Clean up event listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged')
      window.ethereum.removeAllListeners('chainChanged')
    }
    document.removeEventListener('visibilitychange', this.loadBlockchainData)
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    // Load Marketplace contract
    const networkId = await web3.eth.net.getId()
    console.log('Network ID:', networkId)

    const marketplaceData = Marketplace.networks[networkId]
    if (marketplaceData) {
      const marketplace = new web3.eth.Contract(Marketplace.abi, marketplaceData.address)
      this.setState({ marketplace })
      const productCount = await marketplace.methods.productCount().call()
      this.setState({ productCount })
      // Reset products array
      this.setState({ products: [] })
      // Load products
      for (var i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call()
        this.setState({
          products: [...this.state.products, product]
        })
      }
      // Load owned items
      const ownedItems = await marketplace.methods.getOwnedItems(accounts[0]).call()
      this.setState({ ownedItems })
    } else {
      window.alert('Marketplace contract not deployed to detected network.')
    }

    // Load Service contract
    const serviceData = Service.networks[networkId]
    console.log('Service contract data:', serviceData)
    if (serviceData) {
      const service = new web3.eth.Contract(Service.abi, serviceData.address)
      console.log('Service contract loaded:', service)
      this.setState({ service })

      // Test service contract
      try {
        const types = await service.methods.getServiceTypes().call()
        console.log('Available service types:', types)
      } catch (error) {
        console.error('Error testing service contract:', error)
      }
    } else {
      window.alert('Service contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      ownedItems: [],
      service: null,
      currentPage: 'marketplace',
      loading: true,
      cartItems: []
    }

    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
    this.switchPage = this.switchPage.bind(this)
    this.addToCart = this.addToCart.bind(this)
    this.removeFromCart = this.removeFromCart.bind(this)
    this.refundProduct = this.refundProduct.bind(this)
  }

  switchPage(page) {
    console.log('Switching to page:', page)
    this.setState({ currentPage: page })
  }

  createProduct(name, price, category) {
    this.setState({ loading: true })
    this.state.marketplace.methods.createProduct(name, price, category).send({ from: this.state.account })
      .once('receipt', async (receipt) => {
        await this.loadBlockchainData()
        this.setState({ loading: false })
      })
      .on('error', (error) => {
        console.error('Create product error:', error);
        this.setState({ loading: false });
        window.alert('Error creating product');
      });
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true })
    return new Promise((resolve, reject) => {
      this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
        .once('receipt', async (receipt) => {
          console.log('Purchase successful:', receipt);
          await this.loadBlockchainData()
          this.setState({ loading: false })
          resolve(receipt)
        })
        .on('error', (error) => {
          console.error('Purchase error:', error);
          let errorMessage = 'Error during purchase';
          if (error.message.includes("revert")) {
            const revertMessage = error.message.split('revert');
            if (revertMessage.length > 1) {
              const reason = revertMessage[1].trim();
              errorMessage = 'Purchase failed: ' + reason;
            } else {
              errorMessage = 'Purchase failed: Unknown reason';
            }
          }
          window.alert(errorMessage);
          this.setState({ loading: false });
          reject(error);
        });
    });
  }

  addToCart(item) {
    this.setState(prevState => ({
      cartItems: [...prevState.cartItems, item]
    }))
  }

  removeFromCart(itemId) {
    this.setState(prevState => ({
      cartItems: prevState.cartItems.filter(item => item.id !== itemId)
    }))
  }

  refundProduct(id) {
    this.setState({ loading: true })
    return new Promise((resolve, reject) => {
      this.state.marketplace.methods.refundProduct(id).send({ from: this.state.account })
        .once('receipt', async (receipt) => {
          console.log('Refund successful:', receipt);
          await this.loadBlockchainData()
          this.removeFromCart(id)
          this.setState({ loading: false })
          resolve(receipt)
        })
        .on('error', async (error) => {
          console.error('Detailed refund error:', error);
          let errorMessage = 'Error during refund';
          if (error.message.includes("revert")) {
            const revertMessage = error.message.split('revert');
            if (revertMessage.length > 1) {
              const reason = revertMessage[1].trim();
              errorMessage = 'Refund failed: ' + reason;
            } else {
              errorMessage = 'Refund failed: Unknown reason';
            }
          }
          window.alert(errorMessage);
          this.setState({ loading: false });
          reject(error);
        });
    });
  }

  render() {
    return (
      <div>
        <Navbar
          account={this.state.account}
          switchPage={this.switchPage}
          currentPage={this.state.currentPage}
          cartItems={this.state.cartItems}
        />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              {this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : this.state.currentPage === 'marketplace'
                  ? <Main
                    products={this.state.products}
                    createProduct={this.createProduct}
                    purchaseProduct={this.purchaseProduct}
                    addToCart={this.addToCart}
                    removeFromCart={this.removeFromCart}
                    refundProduct={this.refundProduct}
                    account={this.state.account}
                    cartItems={this.state.cartItems}
                    marketplace={this.state.marketplace}
                  />
                  : this.state.currentPage === 'services'
                    ? <ServiceComponent
                      service={this.state.service}
                      account={this.state.account} />
                    : this.state.currentPage === 'cart'
                      ? <ShoppingCart
                        marketplace={this.state.marketplace}
                        account={this.state.account}
                        cartItems={this.state.cartItems}
                        removeFromCart={this.removeFromCart} />
                      : <div>Invalid page</div>
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
