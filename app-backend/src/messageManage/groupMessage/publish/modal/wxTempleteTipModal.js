/*
 * @Last Modified by: litingwei
 * @Last Modified time: 2018-10-19 17:48:39
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'
import { service } from 'common/service'
import { common } from 'common/common'
import { Modal, Button } from 'antd';

class WxTempleteTipModal extends React.Component {
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
    return (
      <div>
        <Modal
            title="微信模板消息说明"
            visible={this.props.visible}
            onOk={this.props.wxTempleteTipModalClose}
            onCancel={this.props.wxTempleteTipModalClose}
            footer = {null}
            style = {{position:'relative'}}
            >
                <div style = {{fontSize: '12px',width:'100%'}}>
                    <img style = {{ width:'100%'}} src="images/publish-wxTemplete-tips.png" alt=""/>
                </div>
                
                <div style = {{height:'32px',borderTop:'1px solid #e8e8e8',marginTop:'10px'}}>
                    <Button onClick = {this.props.wxTempleteTipModalClose} style = {{position:'absolute',right:'20px',marginTop:'10px'}} type = 'primary'>确认</Button>
                </div>
        </Modal>
      </div>
    );
  }
}
export default WxTempleteTipModal