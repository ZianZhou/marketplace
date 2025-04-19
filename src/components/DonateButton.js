import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import Web3 from 'web3'

const DonateButton = ({ marketplace, account }) => {
    const [show, setShow] = useState(false)
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleClose = () => {
        setShow(false)
        setAmount('')
        setError('')
    }

    const handleShow = () => setShow(true)

    const handleDonate = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const web3 = new Web3(window.ethereum)
            const amountInWei = web3.utils.toWei(amount, 'ether')

            await marketplace.methods.donate().send({
                from: account,
                value: amountInWei
            })

            handleClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button variant="success" onClick={handleShow}>
                Donate to Marketplace
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Donate to Marketplace</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleDonate}>
                        <Form.Group>
                            <Form.Label>Amount (ETH)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount in ETH"
                                required
                            />
                        </Form.Group>
                        {error && <p className="text-danger mt-2">{error}</p>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleDonate}
                        disabled={loading || !amount}
                    >
                        {loading ? 'Processing...' : 'Donate'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default DonateButton 