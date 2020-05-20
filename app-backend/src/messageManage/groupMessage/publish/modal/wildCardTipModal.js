/*
 * @Last Modified by: litingwei
 * @Last Modified time: 2018-10-15 10:57:19
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'
import { service } from 'common/service'
import { common } from 'common/common'
import { Modal, Button } from 'antd';

class WildCardTipModal extends React.Component {
  state = { visible: false }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  handleOk = (e) => {
    this.setState({
      visible: false,
    });
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  }

  render() {
    const { sendUserType } = this.props.sendUserType
    return (
      <div>
        <Modal
            title="各类通配符使用说明"
            visible={this.props.visible}
            onOk={this.props.wildCardTipModalClose}
            onCancel={this.props.wildCardTipModalClose}
            footer = {null}
            style = {{position:'relative'}}
            >
                <div style = {{fontSize: '12px',width:'100%'}}>
                    <img style = {{ width:'100%'}} src={this.props.sendUserType === 0?'images/publish-free-tips.png':'images/publish-unfree-tips.png'} alt=""/>
                </div>
                
                <div style = {{height:'32px',borderTop:'1px solid #e8e8e8',marginTop:'10px'}}>
                    <Button onClick = {this.props.wildCardTipModalClose} style = {{position:'absolute',right:'20px',marginTop:'10px'}} type = 'primary'>确认</Button>
                </div>
        </Modal>
      </div>
    );
  }
}
export default WildCardTipModal