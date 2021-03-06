import React, { Component } from 'react';
import { connect } from 'react-redux';

import OrdersAdmin from './OrdersAdmin';
import RedeemsAdmin from './RedeemsAdmin';
import Certificates from './Certificates';


class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = { isOwner: null };
  }

  componentDidMount() {
    this.props.LNKSExchange.deployed().then(exchange => {
      exchange.validate(this.props.account)
        .then(res => {
            this.setState({isOwner: res});
        });
    });
  }

  render() {
    console.log(this.state.isOwner);

    return (
      <div>
          <div className="row">
            {this.state.isOwner ?
              <div>
                <div className="col-xs-12">
                  <h3 style={{marginTop: 30}}>Orders</h3>
                  <OrdersAdmin />
                </div>

                <div className="col-xs-12">
                  <h3 style={{marginTop: 30}}>Redeems</h3>
                  <RedeemsAdmin />
                </div>

                <div className="col-xs-12">
                  <h3 style={{marginTop: 30}}>Certificates</h3>
                  <Certificates />
                </div>
              </div> :
              <div className="col-xs-12"><h2>This area is admin only</h2></div>
            }
          </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    web3: state.web3,
    LNKSExchange: state.LNKSExchange,
    account: state.account
  }
}

export default connect(mapStateToProps)(Admin);
