import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';


class RecentTransactions extends Component {
  constructor(props) {
    super(props);
    this.state = { transactions: [] }

    this.fetchTransactions = this.fetchTransactions.bind(this);
  }

  componentDidMount() {
    this.fetchTransactions();
  }

  fetchTransactions() {

    this.props.web3.web3.eth.getBlockNumber((err, latestBlock) => {
      this.props.LNKSExchange.deployed().then(exchange => {
        exchange.allEvents({fromBlock: latestBlock - 100000, toBlock: 'latest'})
          .watch((error, event) => {
            if (error) {
              console.log(error);
            } else if (
              (event.event === 'RedeemEvent' || event.event === 'BuyDirectEvent') &&
              _.findIndex(this.state.transactions, { 'hash': event.transactionHash }) === -1)
            {
              let updatedTransactions = this.state.transactions.slice();
              updatedTransactions.push({
                hash: event.transactionHash,
                amount: event.event === 'RedeemEvent' ? event.args._amount.toNumber() / 1000 : this.props.web3.web3.fromWei(event.args._amount.toNumber(), 'ether'),
                type: event.event === 'RedeemEvent' ? 'Redeem' : 'Buy Direct',
                time: moment.unix(event.args._timestamp.toNumber()).fromNow(),
                unix: event.args._timestamp.toNumber()
              });
              updatedTransactions = _.sortBy(updatedTransactions, 'unix', 'desc');

              this.setState({
                transactions: updatedTransactions
              });
            }
          });
      });
    });
  }

  render() {
    let transactions = this.state.transactions.map(transaction => {
      return <tr key={transaction.hash}>
        <td>{transaction.hash}</td>
        <td>{transaction.amount} ETH</td>
        <td>{transaction.type}</td>
        <td>{transaction.time}</td>
      </tr>;
    });

    return <div className="col-xs-12" style={{marginBottom: 30}}>
      <h2>Recent Transactions</h2>

      <table style={{width: "100%"}}>
        <thead>
          <tr>
            <th>Tx Hash</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {transactions}
        </tbody>
      </table>
    </div>;
  }
}


function mapStateToProps(state) {
  return {
    LNKSExchange: state.LNKSExchange,
    web3: state.web3
  }
}

export default connect(mapStateToProps)(RecentTransactions);
