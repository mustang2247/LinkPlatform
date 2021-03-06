import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button } from 'antd';
import axios from 'axios';
const FormItem = Form.Item;


class BuyDirect extends Component {
	constructor(props) {
		super(props);

		this.state = {
			amountEth: 1,
			amountTokens: '...',
			priceGram: '...',
			priceEth: '...',
			fee: '...',
			success: '',
			failure: '',
		}

	    this.handleChange = this.handleChange.bind(this);
	    this.handleSubmit = this.handleSubmit.bind(this);
	    this.calculateTokens = this.calculateTokens.bind(this);
	}

	componentDidMount() {
		this.getFee();

		axios.all([
			axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'),
			axios.get('https://www.quandl.com/api/v3/datasets/LBMA/SILVER.json?api_key=y7Pa1CUGkHby28hYKivu')
		])
        .then(axios.spread((eth, silver) => {
            this.setState({
                priceEth: eth.data.USD,
                priceGram: (parseFloat(silver.data.dataset.data[0][1]) / 28.3495).toFixed(2)
            }, () => {
            	this.calculateTokens();
            });
        }))
        .catch(error => {
            console.log(error);
        });
	}

	getFee() {
		this.props.LNKSExchange.deployed().then(exchange => {
			exchange.fee()
				.then(res => {
					this.setState({
						fee: `${res.toNumber() / 10}% or at least 0.001 LNKS`
					});
				});
		});
	}

	calculateTokens() {
		let etherInUsd = this.state.amountEth * this.state.priceEth,
			amountTokens = (etherInUsd / this.state.priceGram).toFixed(2);

		this.setState({amountTokens});

		this.props.LNKSExchange.deployed().then(exchange => {
			exchange.calculateFee.call(amountTokens * 1000)
				.then(res => {
					this.setState({
						fee: `${res.toNumber() / 1000} LNKS`
					});
				});
		});
	}

	handleChange(event) {
		this.setState({amountEth: event.target.value}, () => {
			this.calculateTokens();
		});
	}

	handleSubmit(event) {
		event.preventDefault();

		this.props.LNKSExchange.deployed().then(exchange => {
			exchange.buyDirect({
				from: this.props.account,
				value: this.props.web3.web3.toWei(this.state.amountEth, 'ether'),
				gas: 200000
			}).then(receipt => {
				this.setState({success: `Success! Transaction hash - ${receipt.tx}`});
			}).catch(error => {
				this.setState({failure: error.message});
			});
		});
	}

	render() {
		return (
			<div id="buydirect">
				<h4>Buy Direct</h4>

				<p style={{color: "green"}}>{this.state.success ? this.state.success : null}</p>
				<p style={{color: "red"}}>{this.state.failure ? this.state.failure : null}</p>

				<h5><font size="2"><font color="white">1 ETH = </font><font color="#64b0ed">{this.state.priceEth} USD</font></font></h5>
				<h5><font size="2"><font color="white">Silver Gram Price = </font><font color="#64b0ed"> {this.state.priceGram} USD</font></font></h5>
				<h5><font size="2"><font color="white">{this.state.amountEth ? this.state.amountEth : 0}</font> ETH = <font color="#64b0ed"> {this.state.amountTokens} LNKS</font></font></h5>

				<Form onSubmit={this.handleSubmit}>
			        <FormItem>
			        	<Input style={{marginTop: 5}} type="number" onChange={this.handleChange} value={this.state.amountEth} placeholder="Amount to buy" />
			        </FormItem>

					<Button type="primary" htmlType="submit">Buy tokens</Button>
					<h6>* Fee: {this.state.fee} (for first time buyers)</h6>
				</Form>
			</div>
		);
	}
};


function mapStateToProps(state) {
  return {
    LNKSExchange: state.LNKSExchange,
    account: state.account,
    web3: state.web3
  }
}

export default connect(mapStateToProps)(BuyDirect);
