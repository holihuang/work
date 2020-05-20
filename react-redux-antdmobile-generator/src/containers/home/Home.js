
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import styles from '../../styles/less/index.less';
import { Button, Toast, Card, Modal } from 'antd-mobile';
import Room from '../../components/home/Index';
import { MYROOM_SUMMARY_REQUESTED, MYROOM_DELETE_REQUESTED } from '../../constants/home';

let pageNo = 1;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.deleteRoom = this.deleteRoom.bind(this);
  }
  componentDidMount(){
    const { dispatch } = this.props;
    let params = {
      pageNo: 1,
      pageSize: 100,
    }
    dispatch({type: MYROOM_SUMMARY_REQUESTED, params});
  }
  deleteRoom(id) {
    const { dispatch } = this.props;
    Modal.alert('', (<span style={{color: '#030303'}}>是否撤销会议室?</span>), [
     { text: '取消', style: { color: '#0076FF' } },
     { text: '确认', style: { color: '#0076FF' }, onPress: () => {
        const params = {
          reserveId: id
        }
        dispatch({type: MYROOM_DELETE_REQUESTED, params});
     } },
   ]);
  }

  createRoomList() {
    const { roomList } = this.props;
    let rows = [];
    if(roomList.length&&roomList.length > 0){
      roomList.forEach( (room, index) => {
        rows.push(
          <div key={index}>
            <div key={'reservertime_' + index} className={styles["reserve-time"]}>{room.reserveInfo.reserveTime}</div>
            <Room key={'room' + index} room={room} cancelRoom={this.deleteRoom}/>
          </div>
        )
      });
    } else {
      rows.push(<div className={styles['no-reserve-info']}>没有预定记录</div>);
    }

    return rows;
  }

  render() {
    return (
      <div className={styles['app-wrap']}>
        {this.createRoomList()}
      </div>
    );
  }
}

const getHome = (state) => {
  return state.home;
}
const selectors = createSelector(
  [getHome],
  (home) => {
    return {...home};
  }
)

export default connect(selectors)(Home);
