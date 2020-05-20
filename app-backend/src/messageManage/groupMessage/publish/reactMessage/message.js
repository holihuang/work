/*
 * @Last Modified by: litingwei
 * @Last Modified time: 2018-10-19 17:52:47
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Menu, Icon, DatePicker, Radio, Upload, message, Button, Modal, Select } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'
import { service } from 'common/service'
import { common } from 'common/common'
import locale from 'antd/lib/date-picker/locale/zh_CN';
import Notifications from '../wxMessageType/Notifications'
import CourseNotice from '../wxMessageType/CourseNotice'
import LearningNotice from '../wxMessageType/LearningNotice'
import ClassNotice from '../wxMessageType/ClassNotice'
import ServiceStatusNotice from '../wxMessageType/ServiceStatusNotice'
import Reminder from '../wxMessageType/Reminder'
import Weekly from '../wxMessageType/Weekly'
import Appointment from '../wxMessageType/Appointment'
import Mark from '../wxMessageType/Mark'
import WxPushModal from '../modal/wxPushModal'
import WildCardTipModal from '../modal/wildCardTipModal'
import WxTempleteTipModal from '../modal/wxTempleteTipModal'
import Editor from '../editor/editor'
import { isAbsolute } from 'path'
import { REGEXP_ABSOLUTE_RESOURCE_PATH } from 'webpack/lib/ModuleFilenameHelpers'

import cfg from './config'

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;

const wildcardsArr = [
    '用户姓名',
    '缺勤次数',
    '入学天数',
    '休眠天数',
    '报考地域'
]

class Message extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            //消息标题value (param)
            messageTitleValue:'',
            //微信模板消息标题value (param)
            wxMessageTitleValue:'',
            //微信模板消息标题结尾 (param)
            wxMessageEndValue:'', 
            //上传按钮文案
            uploadBtnText:'上传',
            //上传图片 预览图片url (param)
            preViewSrc:'',
            //微信消息模板控制显隐变量
            wxMessageDisplay:'none',
            // //微信消息模板类型
            // wxMessageType:1,
            // isShowNotifications:true,
            // isShowCourseNotice:false,
            // isShowLearningNotice:false,
            // isShowClassNotice:false,
            // isShowServiceStatusNotice:false,
            //跳转页面模板类型
            goToPageType:4,
            isShowDetail:true,
            isShowApp:false,
            isShowH5:false,
            isShowMiniProgram:false,
            isShowParamIpt:false,
            //预览展示
            isShowPreview:false,
            isShowPreviewBtn:true,
            //弹窗控制
            miniProgressModal:false,
            wildCardTipModal:false,
            wxTempleteTipModal:false,
            allSkipPage: [],

            // 消息发布title
            paramMessageTitle: '',
            // 消息发布时间
            paramPublishTime: '',
            //消息类型参数
            paramMessageType: 3,
            // 上传图片后 返回的url 即预览图片的url
            // paramUrl:'',
            // 微信模板是否被选中
            paramWxIsChecked: false,
            // App是否选中
            paramAppIsChecked: false,
            // 微信模板 消息类型
            paramWxMessageType: 1,
            // 消息结尾颜色
            paramWxMessageEndColor: '#E25B00',
            // 页面跳转类型
            // paramGoToType:4,
            // 模板中的信息
            paramKeyValue1: '',
            paramKeyValue2: '',
            paramKeyValue3: '',
            paramKeyValue4: '',
            paramKeyValue5: '',
            // 跳转页面  App // 跳转页面 第三方H5
            paramSkipName: '',
            paramAppId: '',
            // paramH5Url:'',
            // 跳转页面 小程序
            paramMiniProgramUrl: '',
            paramMiniProgramAppId: '',
            paramMiniProgramOriginalId: '',
            // 渠道
            channelCode: 'CS_PC',
            // 操作人 及 用户名称
            creater: '',
            createrName: '',
            fileId: '',
            sendUserType: '',
            succCount: '',
            fileName: '',
            // 微信取消 判断标记
            isShowWxChannel: false,
            isShowMiniProgramType: false,
            // 显示发送二次确认modal
            showSendModal: false,
        }
    }

    componentDidMount() {
        global.userInfo.userRole.split(',').map((index) => {
            if(index == 'WEI_XIN_MSGCHANNEL'){
                this.setState({
                    isShowWxChannel:true
                })
            }
            if(index == 'SMALL_PRO_MSGCHANNEL'){
                this.setState({
                    isShowMiniProgramType:true
                })
            }
        })
        service.getAllSkipPage({}, (response) => {
            if (response.rs) {
                this.setState({
                    allSkipPage:response.resultMessage
                })
            } else {
                alert(response.rs);
            }
        })
        const userInfo = common.getUserInfo()
        const {
            userNickname,
            questionAssist,
            userRole,
            robotAssist
        } = userInfo
        this.setState({
            creater:this.props.operator,
            fileId:this.props.fileId,
            sendUserType:this.props.sendUserType,
            paramWxMessageType: +this.props.sendUserType === 1 ? 1 : 5,
            succCount:this.props.succCount,
            createrName:userNickname,
            fileName:this.props.fileName,
        })
        if(this.props.sendUserType == 0){
            this.setState({
                paramWxMessageType:5,
                // isShowNotifications:false,
                // isShowCourseNotice:false,
                // isShowLearningNotice:false,
                // isShowClassNotice:false,
                // isShowServiceStatusNotice:true,
            })
        }
    }

    //消息发布时间选择
    pushlishMessageTime = (value, dateString) => {
        this.setState({
            paramPublishTime:dateString
        })
    }

    //消息类型
    messageTypeSelect = (e) => {
        this.setState({
            paramMessageType: e.target.value,
        });
    }

    //上传图片功能
    uploadPic = (e) =>{
        common.picUploaderNew(response => {
            if (response.rs) {
                this.setState({
                    uploadBtnText:'更新'
                })
                const {linkUrl, height, width} = response.resultMessage[0];
                if (height * 3 != width) {
                    //需符合3:1的比例
                    alert('请上传3:1的图片');
                    this.setState({
                        uploadBtnText:'上传'
                    })
                    return;
                }
                this.setState({
                    preViewSrc:linkUrl,
                    // paramUrl:linkUrl
                })
            } else {
                this.setState({
                    uploadBtnText:'上传'
                })
            }
        }, ({size}) => {
            const MAX_SIZE = 2 * 1024 * 1024; //2M
            if (size > MAX_SIZE) {
                alert('图片上传不能大于2M');
                return false;
            }
            this.setState({
                uploadBtnText:'正在上传...'
            })
        })
    }

    appSelect = e => {
        this.setState({
            paramAppIsChecked: !!e.target.checked,
        })
    }

    //微信消息模板勾选 控制模板显隐
    wxSelect = (e) =>{
        if(e.target.checked){
            this.setState({
                wxMessageDisplay: 'block',
                paramWxIsChecked: true,
            })
        }else{
            this.setState({
                wxMessageDisplay: 'none',
                paramWxIsChecked: false,
            })
        }
        this.setState({
            goToPageType:4,
            isShowDetail:true,
            isShowApp:false,
            isShowH5:false,
            isShowMiniProgram:false,
            isShowPreviewBtn:true,
        })
    }

    //微信模板消息类型选择
    wxMessageTypeChage = e => {
        this.setState({
            // paramWxMessageType: e.target.value,
            paramWxMessageType: e,
            paramKeyValue1: '',
            paramKeyValue2: '',
            paramKeyValue3: '',
            paramKeyValue4: '',
            paramKeyValue5: '',
        })

        // if(e.target.value === 1){
        //     this.setState({
        //         isShowNotifications:true,
        //         isShowCourseNotice:false,
        //         isShowLearningNotice:false,
        //         isShowClassNotice:false,
        //         isShowServiceStatusNotice:false,
        //     })
        // }else if(e.target.value === 2){
        //     this.setState({
        //         isShowNotifications:false,
        //         isShowCourseNotice:true,
        //         isShowLearningNotice:false,
        //         isShowClassNotice:false,
        //         isShowServiceStatusNotice:false,
        //     })
        // }else if(e.target.value === 3){
        //     this.setState({
        //         isShowNotifications:false,
        //         isShowCourseNotice:false,
        //         isShowLearningNotice:true,
        //         isShowClassNotice:false,
        //         isShowServiceStatusNotice:false,
        //     })
        // }else if(e.target.value === 4){
        //     this.setState({
        //         isShowNotifications:false,
        //         isShowCourseNotice:false,
        //         isShowLearningNotice:false,
        //         isShowClassNotice:true,
        //         isShowServiceStatusNotice:false,
        //     })
        // }else{
        //     this.setState({
        //         isShowNotifications:false,
        //         isShowCourseNotice:false,
        //         isShowLearningNotice:false,
        //         isShowClassNotice:false,
        //         isShowServiceStatusNotice:true,
        //     })
        // }
    }

    //微信模板 消息结尾
    wxMessageEnd = (e) => {
        let value = ''
        if(e.target.value.length > 30){
            message.error('最多只能输入30字',3);
            value = e.target.value.substring(0,30)
            this.setState({
                wxMessageEndValue:value
            })
        }else{
            this.setState({
                wxMessageEndValue:e.target.value
            })
        }
        
    }

    //微信模板 消息结尾颜色
    wxMessageEndColor = (e) => {
        if( e.target.value == 1){
            this.setState({
                paramWxMessageEndColor:'#E25B00'
            })
        }else if( e.target.value == 2 ){
            this.setState({
                paramWxMessageEndColor:'#C228B4'
            })
        }else if( e.target.value == 3 ){
            this.setState({
                paramWxMessageEndColor:'#EA4141'
            })
        }else if( e.target.value == 4 ){
            this.setState({
                paramWxMessageEndColor:'#299D47'
            })
        }else{
            this.setState({
                paramWxMessageEndColor:'#333333'
            })
        }
        
    }

    //跳转页面类型选择
    goToPageTypeChange  = (e) => {
        // 清空富文本中的内容
        this.content.editor.txt.clear()
        this.setState({
            goToPageType:e.target.value,
            // paramGoToType:e.target.value,
            //跳转页面 详情页
            paramSkipName:'',
            paramAppId:'',
            // paramH5Url:'',
            //跳转页面 小程序
            paramMiniProgramUrl:'',
            paramMiniProgramAppId:'',
            paramMiniProgramOriginalId:'',
            isShowParamIpt:false
        })
        if(e.target.value === 4){
            this.setState({
                isShowDetail:true,
                isShowApp:false,
                isShowH5:false,
                isShowMiniProgram:false,
                isShowPreviewBtn:true,
            })
            
        }else if(e.target.value === 2){
            this.setState({
                isShowDetail:false,
                isShowApp:true,
                isShowH5:false,
                isShowMiniProgram:false,
                isShowPreviewBtn:false,
            })
        }else if(e.target.value === 3){
            this.setState({
                isShowDetail:false,
                isShowApp:false,
                isShowH5:true,
                isShowMiniProgram:false,
                isShowPreviewBtn:false,
            })
        }else{
            this.setState({
                isShowDetail:false,
                isShowApp:false,
                isShowH5:false,
                isShowMiniProgram:true,
                isShowPreviewBtn:false,
            })
        }
    }

    //消息标题输入框 输入文字 及 删除文字 
    messageTitleChange = (e) => {
        const html = e.target.value, beforeHtml = this.state.messageTitleValue
        if (this.state.messageTitleValue.length - e.target.value.length === 1) {
            let i = 0
            let f = true
            while (f) {
                if (html[i] !== beforeHtml[i]) {
                    f = false
                    if (beforeHtml[i] === '}') {
                        let j = i
                        let t = true
                        while (t && j >= 0) {
                            if (['<', '>'].includes(beforeHtml[j])) {
                                t = false
                            } else if (beforeHtml[j] === '{') {
                                this.setState({
                                    messageTitleValue:(this.state.messageTitleValue.substr(0, j) + this.state.messageTitleValue.substr(i + 1)),
                                    // paramMessageTitle:(this.state.messageTitleValue.substr(0, j) + this.state.messageTitleValue.substr(i + 1)),
                                })
                                // this.content.editor.txt.html(beforeHtml.substr(0, j) + beforeHtml.substr(i + 1))
                                // this.content.editor.change()
                                t = false
                            } else {
                                j -= 1
                            }
                        }
                    } else if (beforeHtml[i] === '{') {
                        let j = i
                        let t = true
                        while (t) {
                            if (['<', '>'].includes(beforeHtml[j])) {
                                t = false
                            } else if (beforeHtml[j] === '}') {
                                this.setState({
                                    messageTitleValue:this.state.messageTitleValue.substr(0, i) + this.state.messageTitleValue.substr(j + 1),
                                    // paramMessageTitle:this.state.messageTitleValue.substr(0, i) + this.state.messageTitleValue.substr(j + 1),
                                })
                                t = false
                            } else {
                                j += 1
                                if(beforeHtml[beforeHtml.length-1] === '{'){
                                    this.setState({
                                        messageTitleValue:html,
                                        // paramMessageTitle:html,
                                    })
                                    return
                                }
                                
                            }
                        }
                    }else{
                        this.setState({
                            messageTitleValue:html,
                            // paramMessageTitle:html,
                        })
                    }
                } else {
                    i += 1
                    this.setState({
                        messageTitleValue:html,
                        // paramMessageTitle:html,
                    })
                }
            }
        }else{
            this.setState({
                messageTitleValue:e.target.value,
                // paramMessageTitle:e.target.value,
            })
        }
        
        
    }

    //微信模板消息标题输入框 输入文字 及 删除文字 
    wxMessageTitleChange = (e) => {
        const html = e.target.value, beforeHtml = this.state.wxMessageTitleValue
        if (this.state.wxMessageTitleValue.length - e.target.value.length === 1) {
            let i = 0
            let f = true
            while (f) {
                if (html[i] !== beforeHtml[i]) {
                    
                    f = false
                    if (beforeHtml[i] === '}') {
                        let j = i
                        let t = true
                        while (t && j >= 0) {
                            if (['<', '>'].includes(beforeHtml[j])) {
                                t = false
                            } else if (beforeHtml[j] === '{') {
                                this.setState({
                                    wxMessageTitleValue:(this.state.wxMessageTitleValue.substr(0, j) + this.state.wxMessageTitleValue.substr(i + 1)),
                                    // paramWxMessageTitle:(this.state.wxMessageTitleValue.substr(0, j) + this.state.wxMessageTitleValue.substr(i + 1))
                                })
                                // this.content.editor.txt.html(beforeHtml.substr(0, j) + beforeHtml.substr(i + 1))
                                // this.content.editor.change()
                                t = false
                            } else {
                                j -= 1
                            }
                        }
                    } else if (beforeHtml[i] === '{') {
                        let j = i
                        let t = true
                        while (t) {
                            if (['<', '>'].includes(beforeHtml[j])) {
                                t = false
                            } else if (beforeHtml[j] === '}') {
                                this.setState({
                                    wxMessageTitleValue:this.state.wxMessageTitleValue.substr(0, i) + this.state.wxMessageTitleValue.substr(j + 1),
                                    // paramWxMessageTitle:this.state.wxMessageTitleValue.substr(0, i) + this.state.wxMessageTitleValue.substr(j + 1)
                                })
                                t = false
                            } else {
                                if(beforeHtml[beforeHtml.length-1] === '{'){
                                    this.setState({
                                        wxMessageTitleValue:html,
                                        // paramWxMessageTitle:html,
                                    })
                                    return
                                }
                                j += 1
                            }
                        }
                    }else{
                        this.setState({
                            wxMessageTitleValue:html,
                            // paramWxMessageTitle:html,
                        })
                    }
                } else {
                    i += 1
                    this.setState({
                        wxMessageTitleValue:html,
                        // paramWxMessageTitle:html,
                    })
                }
            }
        }else{
            this.setState({
                wxMessageTitleValue:e.target.value,
                // paramWxMessageTitle:e.target.value
            })
        }
        
        
    }

    //点击消息标题下的通配符 将内容塞进输入框
    wildcardsClickTitle = (item) => () => {
       this.setState({
            messageTitleValue:this.state.messageTitleValue.substring(0,this.refs.messageTitleRef.selectionEnd) + `{${item}}`+this.state.messageTitleValue.substring(this.refs.messageTitleRef.selectionEnd,this.state.messageTitleValue.length)
       })
    }

    //点击微信模板中消息标题下的通配符 将内容塞进输入框
    wildcardsClickWx = (item) => () => {
        this.setState({
            wxMessageTitleValue:this.state.wxMessageTitleValue.substring(0,this.refs.wxMessageTitleRef.selectionEnd) + `{${item}}`+this.state.wxMessageTitleValue.substring(this.refs.wxMessageTitleRef.selectionEnd,this.state.wxMessageTitleValue.length)
       })
    }

    //点击富文本下的通配符 将内容塞进富文本
    wildcardsClickEditor = (item) => () => {
        this.content.editor.cmd.do('insertHTML', `{${item}}`)
    }

    //富文本 编辑 自动删除通配符 {}及其中内容
    onContentChange = (html, beforeHtml) => {
        // 自动删标签，看不懂别看了。
        if (beforeHtml.length - html.length === 1) {
            let i = 0
            let f = true
            while (f) {
                if (html[i] !== beforeHtml[i]) {
                    f = false
                    if (beforeHtml[i] === '}') {
                        let j = i
                        let t = true
                        while (t && j >= 0) {
                            if (['<', '>'].includes(beforeHtml[j])) {
                                t = false
                            } else if (beforeHtml[j] === '{') {
                                this.content.editor.txt.html(beforeHtml.substr(0, j) + beforeHtml.substr(i + 1))
                                this.content.editor.change()
                                t = false
                            } else {
                                j -= 1
                            }
                        }
                    } else if (beforeHtml[i] === '{') {
                        let j = i
                        let t = true
                        while (t) {
                            if (['<', '>'].includes(beforeHtml[j])) {
                                t = false
                            } else if (beforeHtml[j] === '}') {
                                this.content.editor.txt.html(beforeHtml.substr(0, i) + beforeHtml.substr(j + 1))
                                this.content.editor.change()
                                t = false
                            } else {
                                j += 1
                            }
                        }
                    }
                } else {
                    i += 1
                }
            }
        }

        // // 判断字数
        // const pureText = getInnerTextInHTML(this.content.editor.txt.html()).innerText
        // this.setState({
        //     pureText,
        // })
    }
    
    //预览功能
    preViewFunc = () =>{
        const {
            messageTitleValue,
        } = this.state
        if(messageTitleValue){
            this.setState({
                isShowPreview:true
            })
            this.frame = this.refs.preViewRef;
            this.frame.contentWindow.initPage(messageTitleValue,this.content.editor.txt.html());
        }else{
            message.error('请输入标题或内容',5);
        }
    }

    //关闭预览弹窗
    previewClose = () => {
        this.setState({
            isShowPreview:false
        })
    }
    
    //显示小程序推送必读提示弹窗
    showMiniProgressModal = () => {
        this.setState({
            miniProgressModal: true,
        });
    }

    //close小程序推送必读提示弹窗
    miniProgressModalClose = () => {
        this.setState({
            miniProgressModal: false,
        });
    }

    //显示通配符提示弹窗
    showWildCardTipModal = () => {
        this.setState({
            wildCardTipModal: true,
        });
    }

    //close显示通配符提示弹窗
    wildCardTipModalClose = () => {
        this.setState({
            wildCardTipModal: false,
        });
    }

    //显示微信模板提示弹窗
    showWxTempleteTipModal = () => {
        this.setState({
            wxTempleteTipModal: true,
        });
    }

    //close显示微信模板提示弹窗
    wxTempleteTipModalClose = () => {
        this.setState({
            wxTempleteTipModal: false,
        });
    }

    //报考通知 考试时间
    examTime = (value) => {
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue3:value
        })
    }

    //报考通知 考试说明
    examExplain = (value) => {
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue5:value
        })
    }

    //上课通知 课程名称
    courseName = (value) =>{
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue1:value
        })
    }

    //上课通知 上课时间
    courseTime = (value) =>{
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue2:value
        })
    }

    //上课通知 上课地点
    coursePlace = (value) =>{
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue3:value
        })
    }

    //学习通知 原因
    learningReason = (value) =>{
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue2:value
        })
    }

    //学习通知 时间
    learningTime = (value) =>{
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue3:value
        })
    }

    //班级通知 时间
    classTime = (value) =>{
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue3:value
        })
    }

    //班级通知 内容
    classContent = (value) =>{
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue4:value
        })
    }

    //服务通知 名称
    serviceName = (value) =>{
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue1:value
        })
    }

    //服务通知 进度
    serviceProgress = (value) =>{
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue2:value
        })
    }
    
    // //跳转页面  App 路径
    goToApp = (e) => {
        this.setState({
            paramSkipName:e.target.value,
            isShowParamIpt:e.target.value.split('/split/')[1] === 'true'?true:false,
            paramAppId:''
        })
    }

    //跳转页面  App 参数
    goToAppId= (e) => {
        this.setState({
            paramAppId:e.target.value
        })
    }

    //跳转小程序 获取第三方H5 获取H5路径
    goToH5Url = (e) => {
        this.setState({
            paramSkipName:e.target.value
        })
    }

    //跳转小程序 获取跳转路径
    miniProgramUrl = (e) => {
        this.setState({
            paramMiniProgramUrl:e.target.value
        })
    }

    //跳转小程序 获取App ID
    miniProgramAppId = (e) => {
        this.setState({
            paramMiniProgramAppId:e.target.value
        })
    }

    //跳转小程序 获取原始ID
    miniProgramOriginalId = (e) => {
        this.setState({
            paramMiniProgramOriginalId:e.target.value
        })
    }

    //服务通知 进度
    serviceProgress = (value) =>{
        if(value.length > 30){
            message.error('最多只能输入30字',3);
            value = value.substring(0,30)
        }
        this.setState({
            paramKeyValue2:value
        })
    }

    // 通用
    setStateParamKeyValue = (value, item) => {
        if (value.length > 30) {
            message.error('最多只能输入30字', 3)
            value = value.substring(0, 30)
        }

        const changeState = {}
        changeState[`paramKeyValue${item}`] = value
        this.setState(changeState)
    }

    showSendModalHanlder = () => {
        // Modal
        this.setState({
            showSendModal: true,
        })
    }
    //发送信息
    postMessageDetail = () => {
        const {
            //消息发布title
            messageTitleValue,
            //消息发布时间
            paramPublishTime,
            //消息类型参数
            paramMessageType,
            //上传图片后 返回的url 即预览图片的url
            preViewSrc,
            //微信模板是否被选中
            paramWxIsChecked,
            // App是否选中
            paramAppIsChecked,
            //微信模板 消息类型
            paramWxMessageType,
            //微信模板 消息开头
            wxMessageTitleValue,
            //消息结尾
            wxMessageEndValue,
            //消息结尾颜色
            paramWxMessageEndColor,
            //页面跳转类型
            goToPageType,
            // paramGoToType,
            //模板中的信息
            paramKeyValue1,
            paramKeyValue2,
            paramKeyValue3,
            paramKeyValue4,
            paramKeyValue5,
            //跳转页面  App // 跳转页面 第三方H5
            paramSkipName,
            paramAppId,
            // paramH5Url,
            //跳转页面 小程序
            paramMiniProgramUrl,
            paramMiniProgramAppId,
            paramMiniProgramOriginalId,
            //渠道
            channelCode,
            //操作人 及 用户名称
            creater,
            createrName,
            fileId,
            sendUserType,
            succCount,
            isShowParamIpt
        } = this.state

        console.log(this.content.editor.txt.text())
        console.log('处理前富文本内容')
        console.log(this.content.editor.txt.html())

        if (!paramWxIsChecked && !paramAppIsChecked) {
            alert('消息渠道为空，不能发布通知')
            return
        }
        
        //处理font 标签
        // let translationPreViewHtml = this.content.editor.txt.html().replace(/<font color="([^"]*)">(.*)<\/font>/g,'<span style="color:$1">$2</span>')
        // let translationPreViewHtml = this.content.editor.txt.html().replace(/<font color="([^>]*)>([^(<\/font>)]*)<\/font>/g,'<span style="color:#$1>$2</span>')
        let translationPreViewHtml = this.content.editor.txt.html().replace(/<font>/g,'<span>')
        .replace(/<font color="([^"]*)">/g,'<span style="color:$1">')
        .replace(/<font style="([^"]*)">/g,'<span style="$1">')
        // .replace(/<font color="([^"]*)" style="([\w\W]*)">/g,'<span style="color:$1,$2">')
        .replace(/<font color="([^"]*)" style="([^"]*)">/g,'<span style="color:$1;$2">')
        .replace(/<font style="([^"]*)" color="([^"]*)">/g,'<span style="color:$2;$1">')
        .replace(/<\/font>/g,'</span>')

        //处理 u 标签
        // translationPreViewHtml = translationPreViewHtml.replace(/<u>([^</u>]*)<\/u>/g,'<div style="text-decoration:underline">$1</div>')
        // translationPreViewHtml = translationPreViewHtml.replace(/<u(\s+style=\"\w?\")?>/g,'<span style="text-decoration:underline">')
        translationPreViewHtml = translationPreViewHtml.replace(/<u>/g,'<span style="text-decoration:underline">')
        .replace(/<u style="([^"]*)">/g,'<span style="text-decoration:underline;$1">')
        .replace(/<\/u>/g,'</span>')

        console.log('处理后富文本内容')
        console.log(translationPreViewHtml)
        
        if(!messageTitleValue){
            alert('消息标题为空，不能发布通知');
            return;
        }

        if(!paramPublishTime){
            alert('发布时间为空，不能发布通知');
            return;
        }

        if(paramWxIsChecked){
            if(!wxMessageTitleValue){
                alert('微信消息开头为空，不能发布通知');
                return;
            }
            if(!wxMessageEndValue){
                alert('微信消息结尾为空，不能发布通知');
                return;
            }

            try {
                const tplDetail = cfg.typeInfo[paramWxMessageType] || {}
                const validRst = Object.keys(tplDetail.valid || {})

                const isValidFail = validRst.find(item => {
                    if(!(this.state[`paramKeyValue${item}`] || '').trim()) {
                        alert(tplDetail.valid[item])
                        return true
                    }
                })
                if (isValidFail) {
                    return 
                }
            } catch (e) {
                console.error(`${paramWxMessageType} miss, valid error.`)

                alert('模板类型异常，请确认模板信息填写正确。')
                return
            }

            // if(paramWxMessageType == 1){
            //     if(!paramKeyValue3){
            //         alert('考试时间为空，不能发布通知');
            //         return;
            //     }
            //     if(!paramKeyValue5){
            //         alert('报考说明为空，不能发布通知');
            //         return;
            //     }
            // }else if(paramWxMessageType == 2){
            //     if(!paramKeyValue1){
            //         alert('课程名称为空，不能发布通知');
            //         return;
            //     }
            //     if(!paramKeyValue2){
            //         alert('上课时间为空，不能发布通知');
            //         return;
            //     }
            //     if(!paramKeyValue3){
            //         alert('上课地点为空，不能发布通知');
            //         return;
            //     }
            // }else if(paramWxMessageType == 3){
            //     if(!paramKeyValue2){
            //         alert('原因为空，不能发布通知');
            //         return;
            //     }
            //     if(!paramKeyValue3){
            //         alert('时间为空，不能发布通知');
            //         return;
            //     }
            // }else if(paramWxMessageType == 4){
            //     if(!paramKeyValue3){
            //         alert('时间为空，不能发布通知');
            //         return;
            //     }
            //     if(!paramKeyValue4){
            //         alert('通知内容为空，不能发布通知');
            //         return;
            //     }
            // }else{
            //     if(!paramKeyValue1){
            //         alert('服务名称为空，不能发布通知');
            //         return;
            //     }
            //     if(!paramKeyValue2){
            //         alert('服务进度为空，不能发布通知');
            //         return;
            //     }
            // }
        }
        
        if(goToPageType == 4){
            if(!this.content.editor.txt.text()){
                alert('消息正文为空，不能发布通知');
                return;
            }
        }else if(goToPageType == 2){
            if(!paramSkipName){
                alert('页面跳转位置为空，不能发布通知');
                return;
            }
            if(isShowParamIpt){
                if(!paramAppId){
                    alert('页面跳转参数ID为空，不能发布通知');
                    return;
                }
            }
        }else if(goToPageType == 3){
            if(!paramSkipName){
                alert('页面跳转位置为空，不能发布通知');
                return;
            }
        }else{
            if(!paramMiniProgramUrl){
                alert('页面跳转位置为空，不能发布通知');
                return;
            }
            if(!paramMiniProgramAppId){
                alert('APP ID为空，不能发布通知');
                return;
            }
            if(!paramMiniProgramOriginalId){
                alert('原始ID为空，不能发布通知');
                return;
            }
        }

       
        //校验通过 
        // if (confirm('确认发布消息吗？消息发布后不可撤回！')) {
            service.addGroupBatch({
                "fileId": fileId,
                "sendUserType": sendUserType,
                "succCount": succCount,
                "title": messageTitleValue,
                "content": translationPreViewHtml,
                "messagePublishTime": paramPublishTime+ ':00',
                "ifNeedSendWx": paramWxIsChecked ? // 0 - app  1 - app + wx  2 - wx
                    paramAppIsChecked ? 1 : 2
                    : 0,  
                "messageTypeId": paramMessageType,
                "plainText": this.content.editor.txt.text(),
                "createrName": createrName,
                "creater": creater,
                "previewImageUrl": preViewSrc,
                "skipType": (goToPageType == 2 && isShowParamIpt)?1:goToPageType,
                "skipId": paramAppId,
                "skipName": goToPageType == 2 ? paramSkipName.split('/split/')[0]:paramSkipName,
                "pagePath": paramMiniProgramUrl,
                "appid": paramMiniProgramAppId,
                "originalId": paramMiniProgramOriginalId,
                "templateType": +paramWxMessageType,
                "firstValue": wxMessageTitleValue,
                "firstColor": paramWxMessageEndColor,
                "keyword1Value": paramKeyValue1,
                "keyword2Value": paramKeyValue2,
                "keyword3Value": paramKeyValue3,
                "keyword4Value": paramKeyValue4,
                "keyword5Value": paramKeyValue5,
                "remarkValue": wxMessageEndValue,
                "remarkColor": paramWxMessageEndColor,
                "channelCode": channelCode
            }, (response) => {
                if (response.rs) {
                    alert('发布消息成功！');
                    window.location.hash = '#groupMessage';
                } else {
                    alert(response.rsdesp);
                }
            })
        // }
    }
    
    render() {
        const {
            messageTitleValue,
            wxMessageTitleValue,
            uploadBtnText,
            preViewSrc,
            wxMessageDisplay,
            // isShowNotifications,
            // isShowCourseNotice,
            // isShowLearningNotice,
            // isShowClassNotice,
            // isShowServiceStatusNotice,
            isShowDetail,
            isShowApp,
            isShowH5,
            isShowMiniProgram,
            isShowPreview,
            isShowPreviewBtn,
            paramKeyValue1,
            paramKeyValue2,
            paramKeyValue3,
            paramKeyValue4,
            paramKeyValue5,
            isShowParamIpt,
            //跳转页面  App // 跳转页面 第三方H5
            paramSkipName,
            paramAppId,
            // paramH5Url,
            //跳转页面 小程序
            paramMiniProgramUrl,
            paramMiniProgramAppId,
            paramMiniProgramOriginalId,
            wxMessageEndValue,
            succCount,
            fileName,
            isShowWxChannel,
            isShowMiniProgramType,
            allSkipPage,
            sendUserType,
            paramWxMessageType,
            goToPageType
        } = this.state
        const dafaultRadioValue = sendUserType === 0?5:1
        const radioDisabled = sendUserType === 0

        const sendMadalProps ={
            title: '发布通知',
            visible: true,
            width: 260,
            onOk: () => {
                this.postMessageDetail()

                this.setState({
                    showSendModal: false,
                })
            },
            onCancel: () => {
                this.setState({
                    showSendModal: false,
                })
            }
        }

        const tplSelProps = {
            value: cfg.typeInfo[paramWxMessageType].label,
            // placeholder: '请选择模板',
            style: {
                width: '150px',
            },
            onChange: e => {
                this.wxMessageTypeChage(+e)
            }
        }

        return (
            <div className = 'messageContainer'>
                <div className = 'preView' style = {{display:`${isShowPreview?'block':'none'}`}}>
                    <div className = 'preViewClose'>
                        <img style={{cursor:'pointer'}} onClick = {this.previewClose} src="images/icon/close.png" alt=""/>
                    </div>
                    <div className = 'preViewDetail'>
                        <img src="images/iphone-bg.jpg" alt=""/>
                        <div>
                            <iframe ref = 'preViewRef' src="previewPage/index.html" style={{width: '100%', height: '100%',overflow: 'auto'}} frameborder="0"></iframe>
                        </div>
                    </div>
                </div>
                {/* <div>
                    &ensp;&ensp;&ensp;&ensp;通知对象：{fileName}
                </div>
                <div className = 'marTop20'>
                    &ensp;&ensp;&ensp;&ensp;导入人数：{succCount}
                </div> */}

                <div className = 'marTop20'>
                    &ensp;&ensp;&ensp;<span className = 'redStar'>*</span>消息标题：
                    <input ref = 'messageTitleRef' style = {{width:'400px',borderRadius:'4px'}} onChange = {this.messageTitleChange} value = {messageTitleValue} type="text" placeholder = '20字以内，插入下述通配符不算字数'/>
                    <div style = {{display:'flex',marginLeft:'98px'}}>
                        <div className = 'titleWildcards'>
                            {
                                sendUserType == 0?
                                <div onClick = {this.wildcardsClickTitle('用户姓名')}>用户姓名</div>
                                :
                                wildcardsArr.map((item, index) => {
                                    return <div onClick = {this.wildcardsClickTitle(item)}>{item}</div>
                                })
                            }
                        </div>
                        <div style = {{marginTop:'7px'}}>
                           <img onClick = {this.showWildCardTipModal} style = {{width:'16px',cursor:'pointer'}} src="images/question-mark.png" alt=""/> 
                        </div>
                    </div>
                    
                </div>

                {/* /消息渠道模块 */}
                <div className = 'marTop20'>
                    <div style = {{display:'flex'}}>
                        &ensp;&ensp;&ensp;<span className = 'redStar'>*</span>消息渠道：
                        <div>
                            <div>
                                {/* app消息通知 */}
                                <div style = {{display:'flex'}}>
                                    <input type="checkbox"  onClick = {this.appSelect} style = {{width:'16px',height:'16px',marginTop:'2px',marginRight:'2px'}}/>APP（勾选后，在APP中发送至系统通知/活动通知）
                                </div>
                                
                                <div style = {{background:'#F8F8F8',marginTop:'10px',overflow:'hidden',paddingLeft:'20px',paddingRight:'20px',width:'650px'}}>
                                    <div className = 'marTop20'>
                                        &ensp;&ensp;&ensp;<span className = 'redStar'>*</span>消息类型：
                                        <RadioGroup onChange={this.messageTypeSelect} defaultValue = {3}>
                                            <Radio value={3}>系统通知</Radio>
                                            <Radio value={2}>活动通知</Radio>
                                        </RadioGroup>
                                    </div>
                                    
                                    <div className = 'marTop20'>
                                        列表页缩略图：
                                        <span onClick = {this.uploadPic} style = {{borderRadius:'4px',display:'inline-block',width:'70px',height:'26px',background:'#F26F21',textAlign:'center',lineHeight:'26px',color:'#fff',cursor:'pointer'}}>
                                            {uploadBtnText}
                                        </span>
                                        <br />
                                        <span style = {{color:'red',fontSize:'12px',marginLeft:'98px'}}>图片尺寸长宽比为3:1</span>
                                    </div>

                                    <div className = 'marTop20' style = {{display:'flex',marginBottom:'20px'}}>
                                        &ensp;&ensp;图片预览图：
                                        <div style = {{width:'300px',height:'100px',background:'#D8D8D8'}} >
                                            <img style = {{width:'300px',height:'100px'}} src={preViewSrc} alt=""/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 微信消息通知 */}
                            <div className = 'marTop20' style = {{display:`${isShowWxChannel?'block':'none'}`}}>
                                <div style = {{display:'flex'}}>
                                    <input type="checkbox" onClick = {this.wxSelect} style = {{width:'16px',height:'16px',marginTop:'2px',marginRight:'2px'}}/>
                                    <div>微信（勾选后，可同步发送至尚德机构官网公众号）</div>
                                    <div>
                                        <img onClick = {this.showWxTempleteTipModal} style = {{width:'16px',marginLeft:'2px',marginBottom:'2px',cursor:'pointer'}} src="images/question-mark.png" alt=""/> 
                                    </div>
                                </div>
                                <div style = {{background:'#F8F8F8',marginTop:'10px',overflow:'hidden',paddingLeft:'20px',paddingRight:'20px',width:'650px',display:`${wxMessageDisplay}`}}>
                                    <div className = 'marTop20'>
                                        {/* &ensp;&ensp;&ensp;<span className = 'redStar'>*</span>消息类型：
                                        <RadioGroup onChange={this.wxMessageTypeChage} value = {paramWxMessageType}>
                                            <Radio disabled={sendUserType === 0?true:false} value={1}>报考通知</Radio>
                                            <Radio disabled={sendUserType === 0?true:false} value={2}>上课通知</Radio>
                                            <Radio disabled={sendUserType === 0?true:false} value={3}>学习通知</Radio>
                                            <Radio disabled={sendUserType === 0?true:false} value={4}>班级通知</Radio>
                                            <Radio value={5}>服务状态通知</Radio>
                                        </RadioGroup> */}
                                        &ensp;&ensp;&ensp;<span className = 'redStar'>*</span>模板选择：
                                        <Select {...tplSelProps}>
                                            {
                                                Object.keys(cfg.typeInfo).map(item => {
                                                    let disabled = false
                                                    if ([1, 2, 3, 4, 6].includes(+item)) {
                                                        disabled = +sendUserType === 0
                                                    }

                                                    return (
                                                        <Option
                                                            key={`wxtpl-${item}`} 
                                                            value={item}
                                                            disabled={disabled}
                                                        >{cfg.typeInfo[item].label}</Option>
                                                    )
                                                })
                                            }
                                        </Select>
                                    </div>
                                    <div>
                                        <div className = 'marTop20'>
                                            &ensp;&ensp;&ensp;<span className = 'redStar'>*</span>消息开头：
                                            <input value = { wxMessageTitleValue } ref = 'wxMessageTitleRef' onChange = {this.wxMessageTitleChange} style = {{width:'400px'}} type="text" placeholder = '50字以内，插入下述通配符不算字数'/>
                                        </div>
                                        <div className = 'titleWildcards' style = {{marginLeft:'98px'}}>
                                            {
                                                sendUserType == 0?
                                                <div onClick = {this.wildcardsClickWx('用户姓名')}>用户姓名</div>
                                                :
                                                wildcardsArr.map((item, index) => {
                                                    return <div onClick = {this.wildcardsClickWx(item)}>{item}</div>
                                                })
                                            }
                                        </div>
                                        <div className = 'marTop20' style = {{borderTop:'1px dashed #D8D8D8',paddingTop:'20px'}}>
                                            &ensp;<span className = 'redStar'>*</span>消息关键词：
                                            {/* <input onChange = {this.wxMessageKeyWord} style = {{width:'400px'}} type="text" placeholder = '请输入关键词'/> */}
                                        </div>
                                    </div>
                                    <div>
                                        <Notifications
                                            visible = {paramWxMessageType === 1}
                                            examTime = {this.examTime}
                                            examExplain = {this.examExplain}
                                            paramKeyValue3 = {paramKeyValue3}
                                            paramKeyValue5 = {paramKeyValue5}
                                        />
                                        <CourseNotice 
                                            visible = {paramWxMessageType === 2}
                                            courseName = {this.courseName}
                                            courseTime = {this.courseTime}
                                            coursePlace = {this.coursePlace}
                                            paramKeyValue1 = {paramKeyValue1}
                                            paramKeyValue2 = {paramKeyValue2}
                                            paramKeyValue3 = {paramKeyValue3}
                                        />
                                        <LearningNotice 
                                            visible = {paramWxMessageType === 3}
                                            learningReason = {this.learningReason}
                                            learningTime = {this.learningTime}
                                            paramKeyValue2 = {paramKeyValue2}
                                            paramKeyValue3 = {paramKeyValue3}
                                        />
                                        <ClassNotice 
                                            visible = {paramWxMessageType === 4}
                                            classTime = {this.classTime}
                                            classContent = {this.classContent}
                                            paramKeyValue3 = {paramKeyValue3}
                                            paramKeyValue4 = {paramKeyValue4}
                                        />
                                        <ServiceStatusNotice 
                                            visible = {paramWxMessageType === 5}
                                            serviceName = {this.serviceName}
                                            serviceProgress = {this.serviceProgress}
                                            paramKeyValue1 = {paramKeyValue1}
                                            paramKeyValue2 = {paramKeyValue2}
                                        />
                                        <Weekly
                                            visible = {paramWxMessageType === 6}
                                            setStateParamKeyValue = {this.setStateParamKeyValue}
                                            paramKeyValue3 = {paramKeyValue3}
                                        />
                                        <Reminder
                                            visible = {paramWxMessageType === 7}
                                            setStateParamKeyValue = {this.setStateParamKeyValue}
                                            paramKeyValue1 = {paramKeyValue1}
                                            paramKeyValue2 = {paramKeyValue2}
                                        />
                                        <Appointment
                                            visible = {paramWxMessageType === 8}
                                            setStateParamKeyValue = {this.setStateParamKeyValue}
                                            paramKeyValue1 = {paramKeyValue1}
                                            paramKeyValue2 = {paramKeyValue2}
                                        />
                                        <Mark
                                            visible = {paramWxMessageType === 9}
                                            setStateParamKeyValue = {this.setStateParamKeyValue}
                                            paramKeyValue1 = {paramKeyValue1}
                                            paramKeyValue2 = {paramKeyValue2}
                                            paramKeyValue3 = {paramKeyValue3}
                                        />
                                    </div>
                                    <div className = 'marTop20' style = {{borderTop:'1px dashed #D8D8D8',paddingTop:'20px'}}>
                                        &ensp;&ensp;&ensp;<span className = 'redStar'>*</span>消息结尾：
                                        <input onChange = {this.wxMessageEnd} value = {wxMessageEndValue} style = {{width:'400px'}} type="text" placeholder = '30字以内'/>
                                    </div>
                                    <div style = {{display:'flex',marginBottom:'20px'}} className = 'marTop20'>
                                        开头结尾颜色：
                                        <RadioGroup onChange={this.wxMessageEndColor} defaultValue = {1} style = {{display:'flex'}}>
                                            <div style = {{display:'flex'}}>
                                                <Radio value={1}></Radio>
                                                <div style = {{width:'32px',height:'20px',background:'#E25B00 100%',marginRight:'24px',borderRadius:'2px'}}></div>
                                            </div>
                                            <div style = {{display:'flex'}}>
                                                <Radio value={2}></Radio>
                                                <div style = {{width:'32px',height:'20px',background:'#C228B4 100%',marginRight:'24px',borderRadius:'2px'}}></div>
                                            </div>
                                            <div style = {{display:'flex'}}>
                                                <Radio value={3}></Radio>
                                                <div style = {{width:'32px',height:'20px',background:'#EA4141 100%',marginRight:'24px',borderRadius:'2px'}}></div>
                                            </div>
                                            <div style = {{display:'flex'}}>
                                                <Radio value={4}></Radio>
                                                <div style = {{width:'32px',height:'20px',background:'#299D47 100%',marginRight:'24px',borderRadius:'2px'}}></div>
                                            </div>
                                            <div style = {{display:'flex'}}>
                                                <Radio value={5}></Radio>
                                                <div style = {{width:'32px',height:'20px',background:'#333333 100%',borderRadius:'2px'}}></div>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className = 'marTop20'>
                    &ensp;&ensp;&ensp;<span className = 'redStar'>*</span>跳转页面：
                    {/* <RadioGroup onChange={this.goToPageTypeChange} defaultValue = {4}> */}
                    <RadioGroup onChange={this.goToPageTypeChange} value = {goToPageType}>
                        <Radio value={4}>详情页</Radio>
                        <Radio style = {{display:`${wxMessageDisplay === 'block'?'none':'inline'}`}} value={2}>APP页面</Radio>
                        <Radio value={3}>第三方H5</Radio>
                        <Radio style = {{display:`${isShowMiniProgramType?'inline':'none'}`}} value={5}>小程序页</Radio>
                    </RadioGroup>
                </div>
                <div style = {{display:`${isShowDetail?'block':'none'}`}}>
                    <div className = 'marTop20' style = {{display:'flex'}}>
                        &ensp;&ensp;&ensp;&ensp;消息正文：
                        <div id = 'editorContainer'>
                        
                            <Editor 
                                height={380}
                                content={''}
                                ref={e => {
                                    this.content = e
                                    return null
                                }} 
                                onChange={this.onContentChange}
                            />
                            <div style = {{display:'flex'}}>
                                <div className = 'editorWildcards'>
                                    {
                                        sendUserType == 0?
                                        <div onClick = {this.wildcardsClickEditor('用户姓名')}>用户姓名</div>
                                        :
                                        wildcardsArr.map((item, index) => {
                                            return <div onClick = {this.wildcardsClickEditor(item)}>{item}</div>
                                        })
                                    }
                                </div>
                                <div style = {{marginTop:'7px'}}>
                                    <img onClick = {this.showWildCardTipModal} style = {{width:'16px',cursor:'pointer'}} src="images/question-mark.png" alt=""/> 
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
                <div style = {{display:`${isShowApp?'block':'none'}`}}>
                    <div className = 'marTop20'>
                        跳转页面位置：
                        <select name="" id="" onChange = { this.goToApp } value = {paramSkipName}>
                            <option value="">请选择跳转位置</option>
                            {
                                allSkipPage.map((item,index) => {
                                    if(item.isMassagePage === 1){
                                        return (
                                            <option value={`${item.pageKey}/split/${item.isHaveParam == 1?true:false}`}>{item.pageDescription}</option>
                                        )
                                    }
                                   
                                })
                            }
                            {/* <option value="page1/split/true">页面1</option>
                            <option value="page2/split/false">页面2</option> */}
                        </select>
                        <input value = {paramAppId} onChange = {this.goToAppId} style = {{width:'100px',marginLeft:'10px',display:`${isShowParamIpt?'inline':'none'}`}} type="text" placeholder = '请输入参数ID'/>
                    </div>
                </div>
                <div style = {{display:`${isShowH5?'block':'none'}`}}>
                    <div className = 'marTop20'>
                        跳转页面位置：
                        <input value = {paramSkipName} onChange = {this.goToH5Url} style = {{width:'400px'}} type="text" placeholder = '请输入完整url（以http/https/ftp开头）'/>
                    </div>
                </div>
                <div style = {{display:`${isShowMiniProgram?'block':'none'}`}}>
                    <div className = 'marTop20'>
                        <div>
                            跳转页面位置：
                            <input value = {paramMiniProgramUrl} onChange = {this.miniProgramUrl} style = {{width:'400px'}} type="text" placeholder = '请输入小程序路径，例如：page/index'/>
                        </div>
                        <div className = 'marTop20'>
                            &ensp;&ensp;&ensp;&ensp;&ensp;APP&ensp;ID：
                            <input value = {paramMiniProgramAppId} onChange = {this.miniProgramAppId} style = {{width:'400px'}} type="text" placeholder = '请输入APP ID'/>
                        </div>
                        <div className = 'marTop20'>
                            &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;原始ID：
                            <input value = {paramMiniProgramOriginalId} onChange = {this.miniProgramOriginalId} style = {{width:'400px'}} type="text" placeholder = '请输入原始ID'/>
                        </div>
                        <div onClick = {this.showMiniProgressModal} style = {{fontSize:'12px',color:'#1890FF',cursor:'pointer',marginLeft:'98px'}}>
                            小程序推送必读
                        </div>
                    </div>
                </div>
                <div className = 'marTop20'>
                    &ensp;&ensp;&ensp;<span className = 'redStar'>*</span>发布时间：
                    <DatePicker
                        style = {{width:'400px'}}
                        locale={locale}
                        showTime={{
                            format: 'HH:mm',
                            minuteStep: 5,
                        }}
                        format="YYYY-MM-DD HH:mm"
                        placeholder="YYYY-MM-DD HH:mm"
                        onChange={this.pushlishMessageTime}
                        // onOk={this.pushlishMessageTimeOnOk}
                    />
                </div>
                <div className = 'btnContainer marTop20'>
                    <div onClick = { this.showSendModalHanlder }>发送</div>
                    <div style = {{display:isShowPreviewBtn?'block':'none'}}  onClick = { this.preViewFunc }>预览</div>
                </div>
                <WxPushModal 
                    miniProgressModalClose={this.miniProgressModalClose}
                    visible={this.state.miniProgressModal}
                /> 
                <WildCardTipModal 
                    wildCardTipModalClose={this.wildCardTipModalClose}
                    visible={this.state.wildCardTipModal}
                    sendUserType = {sendUserType}
                />
                <WxTempleteTipModal
                    wxTempleteTipModalClose={this.wxTempleteTipModalClose}
                    visible={this.state.wxTempleteTipModal}
                />
                {
                    this.state.showSendModal && <Modal {...sendMadalProps}>
                        <p style={{
                            textAlign: 'center',
                            margin: '5px 0',
                            fontSize: '16px',
                        }}>确定要发送给下方对象吗？</p>
                        <p>通知对象：{fileName}</p>
                        <p>通知人数：{succCount}</p>
                    </Modal>
                }
            </div>
        )
    }
}


export default Message

