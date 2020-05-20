/*
 * @Last Modified by: litingwei
 * @Last Modified time: 2018-10-11 15:42:47
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Icon, Radio} from 'antd';
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'
import { service } from 'common/service'
import { common } from 'common/common'
// import getJSON from '../../common/getJSON'
// import {url} from '../../common/url';
// import { global } from 'common/global'

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const RadioGroup = Radio.Group;

class Notifications extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value:''
        }
    }

    componentDidMount() {
      
    }
    onChange = (e) => {
        console.log('radio checked', e.target.value);
        this.setState({
          value: e.target.value,
        });
    }


    examTime = (e) =>{
        return this.props.examTime(e.target.value)
    }
    examExplain = (e) =>{
        return this.props.examExplain(e.target.value)
    }
    render() {
        const { visible } = this.props
        return (
           <div>
                <div style = {{display:`${visible?'block':'none'}`}}>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;学员姓名：xx学员
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;报考课程：学员专业名称
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;考试时间：
                        <input value = {this.props.paramKeyValue3} onChange = {this.examTime} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;培训学校：尚德机构+xx学院
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;报考说明：
                        <input value = {this.props.paramKeyValue5} onChange = {this.examExplain} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                    </div>
                </div>
           </div>
        )
    }
}

export default Notifications

