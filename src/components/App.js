import React, { Component } from 'react';
import Web3 from 'web3'
import logo from '../logo.png';
import './App.css';
import Marketplace from '../abis/Marketplace.json'
import Service from '../abis/Service.json'
import Navbar from './Navbar'
import Main from './Main'
import ServiceComponent from './ServiceComponent'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
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
      currentPage: 'services', // Set default to services for testing
      loading: true
    }

    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
    this.switchPage = this.switchPage.bind(this)
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
      })
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true })
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
      .once('receipt', async (receipt) => {
        await this.loadBlockchainData()
      })
  }

  render() {
    return (
      <div>
        <Navbar
          account={this.state.account}
          switchPage={this.switchPage}
          currentPage={this.state.currentPage}
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
                    marketplace={this.state.marketplace}
                    account={this.state.account}
                    ownedItems={this.state.ownedItems} />
                  : this.state.currentPage === 'services'
                    ? <ServiceComponent
                      service={this.state.service}
                      account={this.state.account} />
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
