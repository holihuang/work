/*
 * @Last Modified by: litingwei
 * @Last Modified time: 2018-10-11 16:14:47
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'
import { service } from 'common/service'
import { common } from 'common/common'
// import getJSON from '../../common/getJSON'
// import {url} from '../../common/url';
// import { global } from 'common/global'

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class ServiceStatusNotice extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
           
        }
    }

    componentDidMount() {
      
    }
    serviceName = (e) =>{
        return this.props.serviceName(e.target.value)
    }

    serviceProgress = (e) =>{
        return this.props.serviceProgress(e.target.value)
    }

    render() {
        const { visible } = this.props
        return (
            <div>
                <div style = {{display:`${visible?'block':'none'}`}}>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;服务名称：
                        <input value = {this.props.paramKeyValue1} onChange = {this.serviceName} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;服务进度：
                        <input value = {this.props.paramKeyValue2} onChange = {this.serviceProgress} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                    </div>
                </div>
            </div>
        )
    }
}

export default ServiceStatusNotice

