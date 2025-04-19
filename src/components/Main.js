import React, { Component } from 'react';
import DonateButton from './DonateButton';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategory: 'All'
    };
  }

  render() {
    const filteredProducts = this.state.selectedCategory === 'All'
      ? this.props.products
      : this.props.products.filter(product => product.category === this.state.selectedCategory);

    // Get owned items details
    const ownedItems = this.props.ownedItems.map(id =>
      this.props.products.find(product => product.id.toString() === id.toString())
    ).filter(Boolean);

    return (
      <div id="content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Add Product</h1>
          <DonateButton
            marketplace={this.props.marketplace}
            account={this.props.account}
          />
        </div>
        <form onSubmit={(event) => {
          event.preventDefault()
          const name = this.productName.value
          const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'Ether')
          const category = this.productCategory.value
          this.props.createProduct(name, price, category)
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="productName"
              type="text"
              ref={(input) => { this.productName = input }}
              className="form-control"
              placeholder="Product Name"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="productPrice"
              type="text"
              ref={(input) => { this.productPrice = input }}
              className="form-control"
              placeholder="Product Price"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <select
              id="productCategory"
              ref={(input) => { this.productCategory = input }}
              className="form-control"
              required>
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Books">Books</option>
              <option value="Home">Home</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Add Product</button>
        </form>
        <p>&nbsp;</p>
        <h2>My Items</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            {ownedItems.map((product, key) => (
              <tr key={key}>
                <th scope="row">{product.id.toString()}</th>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{window.web3.utils.fromWei(product.price.toString(), 'Ether')} Eth</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>&nbsp;</p>
        <h2>Buy Product</h2>
        <div className="form-group mr-sm-2">
          <select
            className="form-control"
            onChange={(e) => this.setState({ selectedCategory: e.target.value })}
            value={this.state.selectedCategory}>
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Home">Home</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">Owner</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody id="productList">
            {filteredProducts.map((product, key) => {
              return (
                <tr key={key}>
                  <th scope="row">{product.id.toString()}</th>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{window.web3.utils.fromWei(product.price.toString(), 'Ether')} Eth</td>
                  <td>{product.owner}</td>
                  <td>
                    {!product.purchased
                      ? <button
                        name={product.id}
                        value={product.price.toString()}
                        onClick={(event) => {
                          this.props.purchaseProduct(event.target.name, event.target.value)
                        }}
                        className="btn btn-primary">
                        Buy
                      </button>
                      : null
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Main;
