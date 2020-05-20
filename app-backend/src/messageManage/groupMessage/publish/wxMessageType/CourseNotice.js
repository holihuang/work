/*
 * @Last Modified by: litingwei
 * @Last Modified time: 2018-10-11 16:14:18
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'
import { service } from 'common/service'
import { common } from 'common/common'

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class CourseNotice extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
           
        }
    }

    componentDidMount() {
      
    }
    courseName = (e) =>{
        return this.props.courseName(e.target.value)
    }
    courseTime = (e) =>{
        return this.props.courseTime(e.target.value)
    }
    coursePlace = (e) =>{
        return this.props.coursePlace(e.target.value)
    }
    render() {
        const { visible } = this.props
        return (
           <div>
                <div style = {{display:`${visible?'block':'none'}`}}>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;课程名称：
                        <input value = {this.props.paramKeyValue1} onChange = {this.courseName} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;上课时间：
                        <input value = {this.props.paramKeyValue2} onChange = {this.courseTime} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;上课地点：
                        <input value = {this.props.paramKeyValue3} onChange = {this.coursePlace} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                    </div>
                </div>
           </div>
        )
    }
}

export default CourseNotice

