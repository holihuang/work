/*
 * @Last Modified by: litingwei
 * @Last Modified time: 2018-10-11 16:13:20
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

class ClassNotice extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
           
        }
    }

    componentDidMount() {
      
    }
   
    classTime = (e) =>{
        return this.props.classTime(e.target.value)
    }

    classContent = (e) =>{
        return this.props.classContent(e.target.value)
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
                        &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;通知人：班主任
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;时间：
                        <input value = {this.props.paramKeyValue3} onChange = {this.classTime} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;通知内容：
                        <input value = {this.props.paramKeyValue4} onChange = {this.classContent} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                    </div>
                </div>
           </div>
        )
    }
}

export default ClassNotice

