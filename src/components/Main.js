import React, { Component } from 'react';
import DonateButton from './DonateButton';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategory: 'All',
      selectedMyItemsCategory: 'All',
      searchTerm: '',
      myItemsSearchTerm: '',
      refundingProduct: null,
      purchasingProduct: null
    };
  }

  render() {
    // Filter products for buy section
    const filteredProducts = this.props.products
      .filter(product =>
        this.state.selectedCategory === 'All' || product.category === this.state.selectedCategory
      )
      .filter(product =>
        product.name.toLowerCase().includes(this.state.searchTerm.toLowerCase())
      );

    // Get owned items details and filter them
    const ownedItems = this.props.products
      .filter(product =>
        product.owner === this.props.account
      )
      .filter(item =>
        this.state.selectedMyItemsCategory === 'All' || item.category === this.state.selectedMyItemsCategory
      )
      .filter(item =>
        item.name.toLowerCase().includes(this.state.myItemsSearchTerm.toLowerCase())
      );

    return (
      <div id="content" className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h1 className="h3 mb-0">Add Product</h1>
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
                  <div className="form-group mb-3">
                    <input
                      id="productName"
                      type="text"
                      ref={(input) => { this.productName = input }}
                      className="form-control"
                      placeholder="Product Name"
                      required />
                  </div>
                  <div className="form-group mb-3">
                    <input
                      id="productPrice"
                      type="text"
                      ref={(input) => { this.productPrice = input }}
                      className="form-control"
                      placeholder="Product Price"
                      required />
                  </div>
                  <div className="form-group mb-3">
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
                  <button type="submit" className="btn btn-primary w-100">Add Product</button>
                </form>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h2 className="h4 mb-4">My Items</h2>
                <div className="form-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search my items..."
                    value={this.state.myItemsSearchTerm}
                    onChange={(e) => this.setState({ myItemsSearchTerm: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <select
                    className="form-control"
                    onChange={(e) => this.setState({ selectedMyItemsCategory: e.target.value })}
                    value={this.state.selectedMyItemsCategory}>
                    <option value="All">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Home">Home</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="thead-light">
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
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h4 mb-4">Buy Product</h2>
                <div className="form-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search products..."
                    value={this.state.searchTerm}
                    onChange={(e) => this.setState({ searchTerm: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
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
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="thead-light">
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Category</th>
                        <th scope="col">Price</th>
                        <th scope="col">Owner</th>
                        <th scope="col">Actions</th>
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
                              {!product.purchased && (
                                <div className="d-flex gap-2">
                                  <button
                                    name={product.id}
                                    value={product.price.toString()}
                                    onClick={(event) => {
                                      const id = event.target.name;
                                      const price = event.target.value;
                                      this.setState({ purchasingProduct: id });
                                      this.props.purchaseProduct(id, price)
                                        .finally(() => this.setState({ purchasingProduct: null }));
                                    }}
                                    disabled={this.state.purchasingProduct === product.id}
                                    className="btn btn-primary btn-sm">
                                    {this.state.purchasingProduct === product.id ? 'Processing...' : 'Buy'}
                                  </button>
                                  <button
                                    onClick={() => this.props.addToCart({
                                      id: product.id,
                                      name: product.name,
                                      price: product.price.toString(),
                                      category: product.category
                                    })}
                                    disabled={this.state.purchasingProduct === product.id}
                                    className="btn btn-outline-primary btn-sm">
                                    Add to Cart
                                  </button>
                                </div>
                              )}
                              {product.purchased && product.owner === this.props.account && (
                                <button
                                  onClick={() => {
                                    this.setState({ refundingProduct: product.id });
                                    this.props.refundProduct(product.id)
                                      .finally(() => this.setState({ refundingProduct: null }));
                                  }}
                                  disabled={this.state.refundingProduct === product.id}
                                  className="btn btn-danger btn-sm">
                                  {this.state.refundingProduct === product.id ? 'Processing...' : 'Refund'}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
