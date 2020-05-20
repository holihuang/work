import React, { Component, PropTypes } from 'react';
import { Router, Route, Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

class AppComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        
    }

    componentDidUpdate() {
        
    }

    componentWillUnmount(){
    }

    render() {
        const { dispatch } = this.props;
        return (
            <div style={{width: '100%', height: '100%'}}>
                {this.props.children}
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
