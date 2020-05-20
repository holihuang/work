/*
 * @Last Modified by: litingwei
 * @Last Modified time: 2018-10-11 16:13:57
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

class LearningNotice extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
           
        }
    }

    componentDidMount() {
      
    }

    learningReason = (e) =>{
        return this.props.learningReason(e.target.value)
    }

    learningTime = (e) =>{
        return this.props.learningTime(e.target.value)
    }
    render() {
        const { visible } = this.props
        return (
           <div>
                <div style = {{display:`${visible?'block':'none'}`}}>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;班级：学员实际班级信息
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;原因：
                        <input value = {this.props.paramKeyValue2} onChange = {this.learningReason} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;时间：
                        <input value = {this.props.paramKeyValue3} onChange = {this.learningTime} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                    </div>
                </div>
           </div>
        )
    }
}

export default LearningNotice

