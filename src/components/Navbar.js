import React, { Component } from 'react';

class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <div className="navbar-brand col-sm-3 col-md-2 mr-0">
          Zian and Spencer's Blockchain Marketplace
        </div>
        <ul className="navbar-nav px-3 d-flex flex-row">
          <li className="nav-item text-nowrap mx-2">
            <button
              className={`btn ${this.props.currentPage === 'marketplace' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => this.props.switchPage('marketplace')}
            >
              Marketplace
            </button>
          </li>
          <li className="nav-item text-nowrap mx-2">
            <button
              className={`btn ${this.props.currentPage === 'services' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => this.props.switchPage('services')}
            >
              Services
            </button>
          </li>
          <li className="nav-item text-nowrap mx-2">
            <button
              className={`btn ${this.props.currentPage === 'cart' ? 'btn-primary' : 'btn-outline-primary'} position-relative`}
              onClick={() => this.props.switchPage('cart')}
            >
              Cart
              {this.props.cartItems.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {this.props.cartItems.length}
                </span>
              )}
            </button>
          </li>
          <li className="nav-item text-nowrap mx-2">
            <small className="text-white"><span id="account">{this.props.account}</span></small>
          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
