/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:24 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-03-06 17:44:03
 */
import React from 'react'
import { Modal, Button, Form, Icon, Input, Checkbox, Upload, Select, Radio, DatePicker, Row, Col, } from 'antd'
import isArray from 'lodash/isArray'
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'

import UserType from './userType'
import ImgUpload from '../../../common/imgUpload/imgUpload'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const { Option, OptGroup } = Select
const CheckboxGroup = Checkbox.Group
const RangePicker = DatePicker.RangePicker
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
}
const URL_REG = /((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&ampx:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/

class AddAct extends React.Component {
    constructor(props) {
        super(props)
    }

    handleSubmit = _ => {
        const { modalType, hotActivityId = '' } = this.props
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log(values)
                const { dateTime, userType, contentType, skipNameAct = '' } = values
                const { checkedCorps, coprsCheckedAll } = this.userTypeEle.getData()
                const params = {
                    ...values,
                    startTime: dateTime[0].format('YYYY-MM-DD HH:mm:ss'),
                    endTime: dateTime[1].format('YYYY-MM-DD HH:mm:ss'),
                }
                if(+userType === 3) {
                    params.corps = coprsCheckedAll ? '全部' : checkedCorps.join(',')
                }
                if(+contentType === 3) {
                    //活动与话题公用skipname字段，但是antd的form如果两个getFieldDecorator的title一样的话，切换的时候不会校验
                    params.skipName = skipNameAct
                    delete params.skipNameAct
                }
                if(modalType === 'view'){
                    this.props.dispatch('modalChange',{visible:false})
                    return 
                } else if(modalType === 'update') {
                     /***为了给后端清空数据加的  恶 */
                    if(!params.college) {
                        params.college = '-1'
                    }
                    if(!params.family) {
                        params.family = '-1'
                    }
                    if(!params.roundIds) {
                        params.roundIds = '-1'
                    }
                    if(!params.corps) {
                        params.corps = '-1'
                    }
                }
                params.hotActivityId = hotActivityId
                this.props.dispatch('addHotActivity', params)
            }
        })
    }

    handleOk = _ => {
        this.props.form.submit(this.handleSubmit)
    }

    handleContentTypeChange = contentType => {
        this.props.dispatch('changeContentType', {
            contentType
        })

    }

    validatePostids = (rule, value, callback) => {
        const postIdArray = value.split(',')
        if(postIdArray.length > 50) {
            callback('每次添加的帖子数量不得超过50，请分次添加！')
        }
        callback()
    }

    renderJumpEle = _ => {
        const { modalType = '', form: { getFieldDecorator }, contentType, actInfo: { content, skipName, skipId } } = this.props
        const isView = modalType === 'view'
        let jumpPageEle = null
        switch (contentType) {
            case 1:
                jumpPageEle = getFieldDecorator('skipId', { 
                    initialValue: skipId,
                    rules: [{ required: true, message: '帖子／话题／活动不能为空！' }],
                 })(
                    <Input readOnly={isView} key="postId" type="number" style={{ }} onChange={this.onIdInputChange} placeholder="请输入帖子id" />
                )
                break
            case 2:
                jumpPageEle = getFieldDecorator('skipName', { 
                    initialValue: content,
                    rules: [{ required: true, message: '帖子／话题／活动不能为空！' }],
                 })(
                    <Input readOnly={isView} key="topicName" style={{}} placeholder="请输入话题名称" />
                )
                break
            case 3:
                //活动与话题公用skipName字段，但是antd的form如果两个getFieldDecorator的title一样的话，切换的时候不会校验
                //先使用skipNameAct操作，提交的时候再修改到skipName
                jumpPageEle = getFieldDecorator('skipNameAct', { 
                    initialValue: skipName,
                    rules: [
                        { required: true, message: '帖子／话题／活动不能为空！' },
                        { pattern: URL_REG, message: '请输入合法的跳转链接！' }
                    ],
                 })(
                    <Input readOnly={isView} key="actUrl" style={{ }} placeholder="请输入完整url(以http/https/ftp开头)" />
                )
                break
            default:
                break
        }
        return jumpPageEle
    }

    handleCancel = _ => {
        this.props.form.resetFields()
        const { handleCancel } = this.props
        typeof handleCancel === 'function' && handleCancel()
    }
    getImgUrlFromEvent = (e) => {
        return e.linkUrl
    }

    handleImgUploadChange = file => {
        const { linkUrl, width, height } = file
        if (width * 360 != height * 710) {
            Modal.error({
                title: '图片尺寸不符合要求，请提供710*360的图片'
            })
            return false
        }
    }
    render() {
        const {
            modalTitle, modalType = '', addVisible, handleOk, form, form: { getFieldDecorator },
            actInfo: { title = '', startTime, endTime, imageUrl = '', roundIds }, contentType,
            collegeSelectedList, famlilySelectedList, userType, checkedCorps
        } = this.props
        const isView = modalType === 'view'
        const userTypeProps = {
            formItemLayout,
            form,
            addVisible,
            roundIds,
            collegeSelectedList,
            famlilySelectedList,
            checkedCorps,
            userType,
            readOnly: modalType === 'view',
        }
        const imgUploadProps = {
            imageUrl,
            maxSize: 60,
            onUpload: this.handleImgUploadChange,
            desc: '(710*360，不超过60k)',
        }
        return (
            <Modal
                title={modalTitle}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={800}
                maskClosable={false}
                footer={[
                    <Button key="submit" type="primary" size="large" onClick={this.handleOk}>
                        确定
                    </Button>,
                ]}
            >
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem
                        {...formItemLayout}
                        label="活动标题"
                    >
                        {getFieldDecorator('title', {
                            initialValue: title,
                            rules: [
                                { required: true, message: '请输入活动标题！' },
                                { max: 20, message: '活动标题过长！' }
                        ],
                        })(
                            <Input readOnly={isView} placeholder="请输入活动标题，不超过20个字符" />
                            )}
                    </FormItem>
                    {
                        isView ?
                            <FormItem
                                {...formItemLayout}
                                label="上传图片"
                            >
                                <img style={{ width: '100px' }} src={imageUrl} />
                            </FormItem> :
                            <FormItem
                                {...formItemLayout}
                                label="上传图片"
                            >
                                {getFieldDecorator('imageUrl', {
                                    initialValue: imageUrl,
                                    //valuePropName: 'linkUrl',
                                    getValueFromEvent: this.getImgUrlFromEvent,
                                    rules: [{ required: true, message: '请上传图片！' }],
                                })(
                                    <ImgUpload { ...imgUploadProps } />)}
                            </FormItem>
                    }

                    <FormItem
                        {...formItemLayout}
                        label="跳转页面"
                    >
                        {getFieldDecorator('contentType', {
                            initialValue: contentType,
                            rules: [
                                { required: true, message: '请选择跳转页面！' }
                        ]
                        })(
                            <Select disabled={isView} style={{ width: '30%', marginRight: '3%' }} onChange={this.handleContentTypeChange}>
                                <Option value={1}>帖子详情页</Option>
                                <Option value={2}>话题详情页</Option>
                                <Option value={3}>活动页面</Option>
                            </Select>
                            )}
                            <FormItem 
                            style={{display: 'inline-block', width: '60%'}}
                            labelCol={{ span: 0 }}
                            wrapperCol={{ span: 24 }}>
                                {this.renderJumpEle()}
                            </FormItem>
                        
                    </FormItem>
                    <UserType {...userTypeProps} ref={ele => { this.userTypeEle = ele }} />
                    <FormItem
                        {...formItemLayout}
                        label="活动时间"
                    >
                        {getFieldDecorator('dateTime', {
                            rules: [{ type: 'array', required: true, message: '请输入活动时间！!' }],
                            initialValue: startTime ? [moment(startTime), moment(endTime)] : []
                        })(
                            <RangePicker disabled={isView} showTime format="YYYY-MM-DD HH:mm" />
                            )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
const WrappedAddACt = Form.create()(AddAct)
export default WrappedAddACt
