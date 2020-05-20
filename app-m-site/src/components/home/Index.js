import React from 'react';
import styles from '../../styles/less/index.less';
import {gray3, f30} from '../../styles/less/common.less';
import classNames from 'classnames';

import { Button, Toast, Card, Modal } from 'antd-mobile';

class Room extends React.Component {
    render() {
        const { room, cancelRoom } = this.props;
        const { id, title, roomName, building, floor, reserveInfo } = room;
        const cardHeaderClass = classNames(gray3, f30);
        return (
            <Card>
              <Card.Header
                title={<span className={cardHeaderClass}>{reserveInfo.title}</span>}
                thumb=""
                extra=""
              />
              <Card.Body>
                <div className={styles["card-content"]}>
                  <ul>
                  <li><span className="left">会议室：</span><span className="right">{building + '#楼' + floor + '层-' + roomName}</span></li>
                  <li><span className="left">会议日期：</span><span className="right">{reserveInfo.date}</span></li>
                  <li><span className="left">会议时间：</span><span className="right">{reserveInfo.start + '-' + reserveInfo.end}</span></li>
                  </ul>
                  <div>
                    <Button size="small" inline onClick={() => cancelRoom(reserveInfo.reserveId)}>撤销会议</Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
        )
    }
}

export default Room;
