import React, { Component } from 'react';
import Web3 from 'web3';
import Service from '../abis/Service.json';

class ServiceComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            serviceTypes: [],
            loading: true,
            prices: {},
            showSuccessPopup: false,
            lastPurchase: null,
            serviceDescriptions: {
                'Repair': 'Professional repair service for your electronic devices, computers, and gadgets',
                'Install': 'Expert installation of software, hardware, and system configurations',
                'Shipping': 'Fast and secure shipping service for your purchased items',
                'Consultation': 'Professional consultation for your technical needs and project planning',
                'Training': 'Personalized training sessions for various technical skills and tools',
                'Data Recovery': 'Professional data recovery service for lost or corrupted data',
                'Web Development': 'Custom web development and design services',
                'Security Audit': 'Comprehensive security assessment and vulnerability testing',
                'Cloud Setup': 'Professional cloud infrastructure setup and configuration'
            },
            serviceIcons: {
                'Repair': '🔧',
                'Install': '💻',
                'Shipping': '📦',
                'Consultation': '💡',
                'Training': '📚',
                'Data Recovery': '💾',
                'Web Development': '🌐',
                'Security Audit': '🔒',
                'Cloud Setup': '☁️'
            }
        };
    }

    async componentDidMount() {
        await this.loadServices();
    }

    async loadServices() {
        const { service } = this.props;
        if (!service) {
            this.setState({ loading: false });
            return;
        }

        try {
            // Load service types
            const serviceTypes = await service.methods.getServiceTypes().call();
            this.setState({ serviceTypes });

            // Initialize Web3 instance
            const web3 = new Web3(window.ethereum);

            // Load prices for each service type
            const prices = {};
            for (let type of serviceTypes) {
                try {
                    const priceInWei = await service.methods.getServicePrice(type).call();
                    prices[type] = web3.utils.fromWei(priceInWei.toString(), 'ether');
                    console.log(`Price for ${type}:`, priceInWei, prices[type]);
                } catch (error) {
                    console.error(`Error loading price for ${type}:`, error);
                    prices[type] = '0';
                }
            }
            this.setState({ prices });
        } catch (error) {
            console.error('Error loading services:', error);
        }

        this.setState({ loading: false });
    }

    purchaseService = async (serviceType) => {
        this.setState({ loading: true });
        try {
            const web3 = new Web3(window.ethereum);
            const price = await this.props.service.methods.getServicePrice(serviceType).call();

            // Purchase service
            await this.props.service.methods.purchaseService(serviceType)
                .send({
                    from: this.props.account,
                    value: price
                });

            // Show success popup
            this.setState({
                showSuccessPopup: true,
                lastPurchase: {
                    type: serviceType,
                    price: web3.utils.fromWei(price.toString(), 'ether')
                }
            });

            // Hide popup after 5 seconds
            setTimeout(() => {
                this.setState({ showSuccessPopup: false, lastPurchase: null });
            }, 5000);

        } catch (error) {
            console.error('Error purchasing service:', error);
            window.alert('Error purchasing service: ' + error.message);
        }
        this.setState({ loading: false });
    }

    render() {
        if (this.state.loading) {
            return (
                <div className="container-fluid mt-5">
                    <div className="text-center">
                        <h2>Loading services...</h2>
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (!this.props.service) {
            return (
                <div className="container-fluid mt-5">
                    <div className="alert alert-warning">
                        Service contract is not loaded. Please make sure you are connected to the correct network.
                    </div>
                </div>
            );
        }

        return (
            <div className="container-fluid mt-5">
                {/* Success Popup */}
                {this.state.showSuccessPopup && this.state.lastPurchase && (
                    <div className="alert alert-success alert-dismissible fade show position-fixed"
                        style={{
                            top: '20px',
                            right: '20px',
                            zIndex: 1050,
                            minWidth: '300px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                        role="alert"
                    >
                        <strong>Success!</strong> You have purchased {this.state.lastPurchase.type} service for {this.state.lastPurchase.price} ETH.
                        <button type="button" className="close" onClick={() => this.setState({ showSuccessPopup: false })}>
                            <span>&times;</span>
                        </button>
                    </div>
                )}

                <div className="row">
                    <main role="main" className="col-lg-12 d-flex">
                        <div id="content" className="w-100">
                            <h1 className="mb-4">Available Services</h1>
                            <div className="row">
                                {this.state.serviceTypes.length === 0 ? (
                                    <div className="col-12">
                                        <div className="alert alert-info">
                                            No services available at the moment.
                                        </div>
                                    </div>
                                ) : (
                                    this.state.serviceTypes.map((serviceType, key) => (
                                        <div key={key} className="col-md-4 mb-4">
                                            <div className="card h-100 shadow-sm">
                                                <div className="card-body">
                                                    <div className="d-flex align-items-center mb-3">
                                                        <span className="display-4 mr-2">{this.state.serviceIcons[serviceType]}</span>
                                                        <h5 className="card-title mb-0">{serviceType}</h5>
                                                    </div>
                                                    <p className="card-text text-muted">
                                                        {this.state.serviceDescriptions[serviceType]}
                                                    </p>
                                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                                        <h6 className="mb-0 text-primary font-weight-bold">
                                                            Price: {this.state.prices[serviceType]} ETH
                                                        </h6>
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => this.purchaseService(serviceType)}
                                                            disabled={this.state.loading}
                                                        >
                                                            {this.state.loading ? 'Processing...' : 'Purchase Service'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }
}

export default ServiceComponent; 