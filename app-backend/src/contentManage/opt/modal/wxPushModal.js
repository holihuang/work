/*
 * @Last Modified by: litingwei
 * @Last Modified time: 2018-10-19 17:32:36
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'
import { service } from 'common/service'
import { common } from 'common/common'
import { Modal, Button } from 'antd';

class WxPushModal extends React.Component {
    state = { visible: true }
    
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
            title="小程序推送必读"
            visible={this.props.miniProgressModal}
            onOk={this.props.miniProgressModalClose}
            onCancel={this.props.miniProgressModalClose}
            footer = {null}
            style = {{position:'relative'}}
            >
                <div style = {{fontSize: '12px'}}>
                <div style = {{color: '#FF4949',marginBottom:'10px'}}>在您推送小程序前，请务必仔细阅读下面的信息：</div>
                <div>
                    平台主体均为“北京尚德在线教育科技有限公司”，以下简称主体。
                </div>  
                <div>
                    微信公众平台，以下简称公众平台。
                </div>  
                <div>
                    微信开放平台，以下简称开放平台。
                </div> 
                <div style = {{marginTop:'20px',marginBottom:'20px'}}>
                    在App端推送时，满足以下条件其一即可：
                    <div>
                        &ensp;&ensp;（1）小程序已绑定至主体开放平台，平台限制说明如下：
                        <div>
                            &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;①小程序主体与开放平台主体相同，可绑定数量上限50个，次数不限。<br />
                            &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;②小程序主体与开放平台主体不同，可绑定数量上限5个。
                        </div>
                        &ensp;&ensp;（2）小程序未绑定至主体开放平台，但需与主体开放平台下的App进行关联，一个App能最多同时关联3个小程序，每月支持关联3次。
                    </div>
                </div>
                <div style = {{ marginTop:'10px',color: '#FF4949'}}>建议推送前，进行个人账号测试，确保推送效果。</div>
                </div>

                <div style = {{height:'32px',borderTop:'1px solid #e8e8e8',marginTop:'10px'}}>
                    <Button onClick = {this.props.miniProgressModalClose} style = {{position:'absolute',right:'20px',marginTop:'10px'}} type = 'primary'>确认</Button>
                </div>
        </Modal>
      </div>
    );
  }
}
export default WxPushModal