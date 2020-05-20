
import React, { Component, PropTypes } from 'react';
import { Router, Route, Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Footer from './footer/footer';

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

  }
  componentDidMount(){

  }
  componentWillUnmount(){
  }

  render() {
    const { dispatch } = this.props;
    let footer = (<Footer {...this.props} />);
    return (
      <div className='w_100 h_100'>
        <div>
          {this.props.children}
          {footer}
        </div>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

const getState = (state) => {
  return state ;
};

const selectors = createSelector(
  [getState],
  (state) => {
    return  state ;
  }
)

export default connect(selectors)(AppComponent);
