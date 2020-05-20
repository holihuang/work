
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {TabBar} from 'antd-mobile';
import { hashHistory, History } from 'react-router';

class Footer extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { pathname } = this.props.location;
    let selectedTab;
    if(pathname == '/myRoom' || pathname == 'myRoom') {
      selectedTab = 'redTab'
    } else if(pathname == '/' || pathname == '/roomList' || pathname == 'roomList') {
      selectedTab = 'blueTab'
    }
    return (
      <div style={{position: 'relative', zIndex: 100}}>
        <TabBar
          unselectedTintColor="#949494"
          tintColor="#33A3F4"
          barTintColor="white"
        >
          <TabBar.Item
            title="会议室预定"
            key="会议室预定"
            icon={require('../../images/icon-meetroom@3x.png')}
            selectedIcon={require('../../images/icon-meetroom-sel@3x.png')}
            selected={selectedTab === 'blueTab'}
            onPress={() => {
              hashHistory.push('roomList');
            }}
            data-seed="logId"
          >
          </TabBar.Item>
          <TabBar.Item
            icon={require('../../images/icon-user@3x.png')}
            selectedIcon={require('../../images/icon-user-sel@3x.png')}
            title="我的会议"
            key="我的会议"
            selected={selectedTab === 'redTab'}
            onPress={() => {
              hashHistory.push('myRoom');
            }}
            data-seed="logId1"
          >
          </TabBar.Item>
        </TabBar>
      </div>
    );
  }
}

export default Footer;
