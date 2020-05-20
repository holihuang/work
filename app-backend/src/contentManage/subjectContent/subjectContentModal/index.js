/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:24 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-02-28 14:29:24
 */
import React from 'react'
import { Modal, Button, Form, Icon, Input, Checkbox, Upload, Select, Radio, DatePicker, Row, Col, } from 'antd'
import isArray from 'lodash/isArray'
import cloneDeep from 'lodash/cloneDeep'

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
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
                const { subjectId } = this.props
                let { postIdList } = values
                const listLength = postIdList.length
                postIdList = postIdList.replace(/，/g, ',')
                postIdList = postIdList.lastIndexOf(',') === listLength - 1 ? postIdList.substr(0, listLength - 1) : postIdList
                const params = {
                    postIdList,
                    subjectId,
                }
                this.props.dispatch('adminAddSubjectContent',params)
            }
        })
    }

    handleOk = _ => {
        this.props.form.submit(this.handleSubmit)
    }

    handleCancel = _ => {
        this.props.form.resetFields()
        const { handleCancel } = this.props
        typeof handleCancel === 'function' && handleCancel()
    }

    validatePostids = (rule, value, callback) => {
        const postIdArray = value.split(',')
        if(postIdArray.length > 50) {
            callback('每次添加的帖子数量不得超过50，请分次添加！')
        }
        callback()
    }

    render() {
        const { modalTitle, addVisible, form: { getFieldDecorator } } = this.props

        return (
                <Modal
                    title={modalTitle}
                    visible={true}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    width={500}
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
                            label="专题内容"
                        >
                            {getFieldDecorator('type', {
                                initialValue: '1',
                                rules: [{ required: true, message: '请输入专题名称！' }],
                            })(
                                <Select>
                                    <Option value="1">帖子</Option>
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            className='label-hidden'
                            {...formItemLayout}
                            label=" "
                        >
                            {getFieldDecorator('postIdList', {
                                initialValue: '',
                                rules: [{ required: true, message: '请输入专题内容！' },{
                                    validator: this.validatePostids
                                }],
                                
                            })(
                                <TextArea placeholder="请输入帖子id，多个id用英文逗号“,”隔开，每次添加的帖子数不超过50”" autosize={{ minRows: 2, maxRows: 6 }} />
                                )}
                        </FormItem>
                    </Form>
                </Modal>
        )
    }
}
const WrappedSubjectModal = Form.create()(SubjectModal)
export default WrappedSubjectModal
