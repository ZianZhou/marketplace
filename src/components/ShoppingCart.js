import React, { useState } from 'react';
import Web3 from 'web3';
import './ShoppingCart.css';

const ShoppingCart = ({ marketplace, account, cartItems = [], removeFromCart }) => {
    const [loading, setLoading] = useState(false);

    const getTotalPrice = () => {
        if (!cartItems || cartItems.length === 0) return '0';
        return cartItems.reduce((total, item) => {
            if (!item || !item.price) return total;
            return window.web3.utils.toBN(total).add(window.web3.utils.toBN(item.price)).toString();
        }, '0');
    };

    const formatPrice = (price) => {
        try {
            return window.web3.utils.fromWei(price, 'ether');
        } catch (error) {
            console.error('Error formatting price:', error);
            return '0';
        }
    };

    const checkout = async () => {
        if (!marketplace || !account || !cartItems || cartItems.length === 0) return;

        setLoading(true);
        try {
            const validItems = cartItems.filter(item => item && item.id);
            const totalPrice = getTotalPrice();

            // Purchase all products in one transaction
            await marketplace.methods.purchaseProduct(validItems[0].id)
                .send({
                    from: account,
                    value: totalPrice
                });

            // Clear cart after successful purchase
            validItems.forEach(item => removeFromCart(item.id));
        } catch (error) {
            console.error('Error during checkout:', error);
        }
        setLoading(false);
    };

    return (
        <div className="shopping-cart">
            <h2>Shopping Cart</h2>
            {!cartItems || cartItems.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <>
                    <div className="cart-items">
                        {cartItems.map((item) => {
                            if (!item || !item.id) return null;
                            return (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-details">
                                        <h3>{item.name || 'Unnamed Item'}</h3>
                                        <p>Category: {item.category}</p>
                                        <p>Price: {formatPrice(item.price)} ETH</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="btn btn-danger"
                                    >
                                        Remove
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="cart-summary">
                        <h3>Total: {formatPrice(getTotalPrice())} ETH</h3>
                        <div className="checkout-warning">
                            <p>Note: Currently only supporting single item checkout</p>
                        </div>
                        <button
                            onClick={checkout}
                            disabled={loading || !marketplace || !account || cartItems.length === 0}
                            className="btn btn-success"
                        >
                            {loading ? 'Processing...' : 'Checkout'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShoppingCart; 