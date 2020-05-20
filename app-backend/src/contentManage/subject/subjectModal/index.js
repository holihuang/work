/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:24 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-03-07 18:24:27
 */
import React from 'react'
import { Modal, Button, Form, Icon, Input, Checkbox, Upload, Select, Radio, DatePicker, Row, Col, } from 'antd'
import isArray from 'lodash/isArray'
import cloneDeep from 'lodash/cloneDeep'

import ImgUpload from '../../../common/imgUpload/imgUpload'
import UserType from '../../hotActivity/addAct/userType'
import { url } from '../../../common/url'

const FormItem = Form.Item
const { Option, OptGroup } = Select
const { TextArea } = Input;
const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
}

class SubjectModal extends React.Component {
    constructor(props) {
        super(props)
    }

    handleSubmit = _ => {
        const { modalType, subjectId = '' } = this.props
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
                const { dateTime, userType } = values
                const { checkedCorps, coprsCheckedAll } = this.userTypeEle.getData()
                const params = {
                    ...values,
                }
                if(+userType === 3) {
                    params.corps = coprsCheckedAll ? '全部' : checkedCorps.join(',')
                } 
                if(modalType === 'update') {
                    params.subjectId = subjectId
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
                    this.props.dispatch('adminUpdateSubject', params)
                    return
                } else if(modalType === 'view'){
                    this.props.dispatch('modalChange',{visible:false})
                    return 
                }
                this.props.dispatch('adminAddSubject',params)
                
            }
        })
    }

    handleOk = _ => {
        this.props.form.submit(this.handleSubmit)
    }

    handleUploadChange = (info) => {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList)
        }
        if (info.file.status === 'done') {
            info.fileList[0] = '12312313132'
        } else if (info.file.status === 'error') {
        }
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
        if (width * 359 != height * 750) {
            Modal.error({
                title: '图片尺寸不符合要求，请提供750*359的图片'
            })
            return false
        }
    }

    render() {
        const { 
            modalTitle, modalType = '', addVisible, handleOk, form, form: { getFieldDecorator }, 
            subjectInfo: { subjectName = '', subjectAbstract = '', subjectWeight, roundIds, subjectImageUrl = '' },
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
            imageUrl: subjectImageUrl,
            maxSize: 60,
            onUpload: this.handleImgUploadChange,
            desc: '(750*359，不超过60k)',
        }
        return (
            <div>
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
                            label="专题名称"
                        >
                            {getFieldDecorator('subjectName', {
                                initialValue: subjectName,
                                rules: [{ required: true, message: '请输入专题名称！' },{ max: 30, message: '专题名称过长！'}],
                            })(
                                <Input readOnly={isView} placeholder="不超过30个字符，该名称不可重复" />
                                )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="专题简介"
                        >
                            {getFieldDecorator('subjectAbstract', {
                                initialValue: subjectAbstract,
                                rules: [{ required: true, message: '请输入专题简介！' },{ max: 100, message: '专题简介过长！'}],
                            })(
                                <TextArea readOnly={isView} placeholder="不超过100个字符" autosize={{ minRows: 2, maxRows: 6 }} />
                                )}
                        </FormItem>
                        
                        {
                            isView ?
                            <FormItem
                                {...formItemLayout}
                                label="上传图片"
                            >
                                <img style={{width: '100px'}} src={subjectImageUrl}/>
                            </FormItem> : 
                            <FormItem
                                {...formItemLayout}
                                label="上传图片"
                            >
                                {getFieldDecorator('subjectImageUrl', {
                                        initialValue: subjectImageUrl,
                                        getValueFromEvent: this.getImgUrlFromEvent,
                                        rules: [{ required: true, message: '请上传图片！' }],
                                    })(
                                        <ImgUpload { ...imgUploadProps } />)}
                            </FormItem>
                        }
                        <FormItem
                            {...formItemLayout}
                            label="专题权重"
                        >
                            {getFieldDecorator('subjectWeight', {
                                initialValue: subjectWeight,
                                rules: [{ required: true, message: '请输入专题权重！' }],
                            })(
                                <Input type="number" readOnly={isView} placeholder="请输入0-100以内的数字;数字越小，排序越靠前" />
                                )}
                        </FormItem>
                        <UserType {...userTypeProps} ref={ele => {this.userTypeEle = ele}} />
                    </Form>
                </Modal>
            </div>
        )
    }
}
const WrappedSubjectModal = Form.create()(SubjectModal)
export default WrappedSubjectModal
