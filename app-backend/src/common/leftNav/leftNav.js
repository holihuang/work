import React from 'react' 
import PropTypes from 'prop-types'
import { Menu, Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'
import { service } from 'common/service'
import { common } from 'common/common'
import getJSON from '../../common/getJSON'
import {url} from '../../common/url';
import { global } from 'common/global'

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class LeftNav extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isShow:'none',
            navWidth:38,
            menuKey:'',
            itemKey:'',
            menuDefaultchecked:'',
            itemDefaultchecked:'',
            currentKey:9999999,
            addCheckedClass:false,
            currentTop:0,
        }
    }

    componentDidMount() {
    //    console.log(this.props)
       const { siteMap } = this.props
       siteMap.map((item,index) => {
           if(!item.foldClass){
               this.setState({
                menuDefaultchecked:index
               })
               item.nodeList.map((detail,key) => {
                   if(detail.activeHashClass){
                        this.setState({
                            itemDefaultchecked:key
                        })
                   }
               })
           }
       })
    }
    mouseEnter = (e) => {
        e.stopPropagation()
        if(e.target.className === 'firstLevel'){
            this.setState({
                isShow:'none',
                navWidth:138
            })
        }
    }
    mouseLeave = () => {
        this.setState({
            isShow:'none',
            navWidth:38
        })
    }
    menuMouseEnter = (index,event) =>{
        event.stopPropagation()
        const querySelectorTop = document.getElementsByClassName("querySelector");
        // console.log(event.toElement)

        // console.log(event.target.getBoundingClientRect());
        this.setState({
            isShow:'block',
            navWidth:138,
            currentKey:index,
            menuKey:index,
            currentTop:event.toElement.getBoundingClientRect().top
        })
    }
    menuMouseLeave = (e) =>{
        e.stopPropagation()
        this.setState({
            isShow:'none',
            navWidth:38,
        })
    }
    checkClick = (hash,index) => {
        this.setState({
            isShow:'none',
            navWidth:38,
            menuDefaultchecked:this.state.menuKey,
            itemDefaultchecked:index
        },()=>{
            // this.setState({
            //     menuDefaultchecked:this.state.menuKey,
            //     itemDefaultchecked:this.state.itemKey,
            // })
            location.hash = hash
            // console.log(this.props)
        })
    }
    renderNav = () =>{
        const { 
            navWidth,
            menuDefaultchecked,
            itemDefaultchecked,
            currentKey,
            isShow,
            currentTop
        } = this.state
        const { siteMap } = this.props
        let currentClassName = ''
        return siteMap.map((item,index) => {
            switch (item.nodeListTitle) {
                case '内容管理':
                    currentClassName = 'content-title';
                    break;
                case '社区管理':
                    currentClassName = 'community-title';
                    break;
                case '班主任管理':
                    currentClassName = 'teacher-title';
                    break;
                case '消息管理':
                    currentClassName = 'message-title';
                    break;
                case '权限管理':
                    currentClassName = 'authority-title';
                    break;
                case '敏感词管理':
                    currentClassName = 'sensitive-words-manage-title';
                    break;
                case '值班老师管理':
                    currentClassName = 'duty-teacher-title';
                    break;
                case '客诉老师管理':
                    currentClassName = 'after-teacher-title';
                    break;
                case '话题管理':
                    currentClassName = 'topic-title';
                    break;
                case '群聊管理':
                    currentClassName = 'group-talk-title';
                    break;
                case '信息通道':
                    currentClassName = 'msg-channel-title';
                    break;
                case '审核管理':
                    currentClassName = 'examine-title';
                    break;
                case '专业信息管理':
                    currentClassName = 'professional-message-title';
                    break;
                default:
                    currentClassName = 'content-title';
                    break;
            }
            currentClassName = `iconContainer ${currentClassName}`
            return (
                <div className = 'querySelector' key = {index} 
                    onMouseEnter = { navWidth === 138?() => this.menuMouseEnter(index,event):''} 
                    onClick = {() => this.menuMouseEnter(index,event)} 
                    onMouseLeave = {this.menuMouseLeave} 
                    className = {index === menuDefaultchecked?'selected secondLevel':'secondLevel'} 
                    data-key = {index}
                    >
                        <div  style = {{position:'relative'}} className = {currentClassName}>{item.nodeListTitle}</div>
                        {
                            +index === currentKey?
                            <div style = {{zIndex:'999',position:'fixed',left:'137px',top:`${currentTop}px`,display:isShow,border:'1px solid #D8D8D8',maxHeight:'400px',overflow:'auto'}}>
                                {
                                   
                                    item.nodeList.map((detail,key) => {
                                        return (
                                            <div 
                                                key = {detail.hash} 
                                                onClick = {
                                                    (event) => {
                                                        event.stopPropagation()
                                                        this.checkClick(detail.hash,key)
                                                    }
                                                } 
                                                className = {key === itemDefaultchecked && index === menuDefaultchecked?'selected thirdLevel':'thirdLevel'}
                                                style = {{borderBottom:`${item.nodeList.length - 1 ===key?'none':'1px solid #D8D8D8'}`}}
                                            >
                                                {detail.text}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            :
                            null
                        }
                </div>
            )
        })
    }
    render() {
        const  { 
            navWidth,
        } = this.state
        const { siteMap } = this.props
        return (
            <div className = 'leftNavContainer'>
                <div className = 'firstLevel' style={{ width: navWidth}} onClick = {this.mouseEnter} onMouseLeave = {this.mouseLeave}>
                    {this.renderNav()}
                </div>
            </div>
        )
    }
}

export default LeftNav

