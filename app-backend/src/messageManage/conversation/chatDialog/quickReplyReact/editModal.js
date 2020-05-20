
import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Input, Row, Col, Select } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'

import ImgUpload from 'common/imgUpload/imgUpload'

const { Option } = Select
const rowStyle = {
    type: 'flex',
    justify: 'space-around',
    align: 'middle',
    style: {
        marginTop: '10px',
    },
}

class EditModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    handleOk = _ => {
        const { dispatch } = this.props
        dispatch('toggleEditModal')
    }

    handleChange = value => {
        const { editModalContent } = this.props
        const editModalContentClone = cloneDeep(editModalContent)
        editModalContentClone.labelId = value
        this.updateEditModalContent(editModalContentClone)
    }

    handleImgUploadChange = file => {
        const { linkUrl } = file
        const { editModalContent } = this.props
        const editModalContentClone = cloneDeep(editModalContent)
        editModalContentClone.quickReplyContent = linkUrl
        editModalContentClone.type = 2
        this.updateEditModalContent(editModalContentClone)
    }

    handleInputChange = e => {
        const { editModalContent } = this.props
        const value = e.target.value.trim()
        const editModalContentClone = cloneDeep(editModalContent)
        editModalContentClone.quickReplyContent = value
        editModalContentClone.type = value !== '' ? 1 : -1
        this.updateEditModalContent(editModalContentClone)
    }

    updateEditModalContent = obj => {
        const { dispatch } = this.props
        dispatch('updateEditModalContent', obj)
    }

    handleSave = _ => {
        // debugger
        const { dispatch, successCallback } = this.props
        dispatch('saveUpdate')
        successCallback()
    }

    render() {
        const {
            showEditModal,
            editModalTitle,
            quickReplyLabels,
            editModalContent: {
                quickReplyContent = '',
                type = -1,
                id = -1,
                labelId = -1,
            },
        } = this.props
        const lengthError = type !== 2 && quickReplyContent.length > 200
        const imgUploadProps = {
            imageUrl: type === 2 ? quickReplyContent : '',
            maxSize: 1024,
            onUpload: _ => true,
            onChange: this.handleImgUploadChange,
            desc: ' ',
        }
        const selectProps = {
            style: { width: 220 },
            placeholder: '请选择话术标签',
            onChange: this.handleChange,
        }
        if (labelId !== -1) {
            selectProps.defaultValue = labelId
        }
        return (
            showEditModal ?
                <Modal
                    title={editModalTitle}
                    visible={showEditModal}
                    onOk={this.handleOk}
                    onCancel={this.handleOk}
                    cancelText=""
                    width={600}
                    maskClosable={false}
                    footer={[
                        <Button key="submit" type="primary" size="large" onClick={this.handleOk}>
                            取消
                        </Button>,
                        <Button key="save" type="primary" size="large" onClick={this.handleSave}>
                            保存并返回
                        </Button>,
                    ]}
                >
                    <Row {...rowStyle}>
                        <Col span={4} style={{ textAlign: 'right' }}>话术标签</Col>
                        <Col span={18} offset={2}>
                            {
                                quickReplyLabels && quickReplyLabels.length ?
                                    <Select {...selectProps}>
                                        {
                                            quickReplyLabels.map(item => <Option value={item.id}>{item.labelName}</Option>)
                                        }
                                    </Select> : null
                            }
                        </Col>
                    </Row>
                    <Row {...rowStyle}>
                        <Col span={4} style={{ textAlign: 'right' }}>话术内容</Col>
                        <Col span={18} offset={2} className={lengthError ? 'has-error' : ''}>
                            <Input
                                disabled={type === 2}
                                // maxLength={200}
                                onChange={this.handleInputChange}
                                defaultValue={type === 1 ? quickReplyContent : ''}
                                type="textarea"
                                rows={4}
                                placeholder="输入快捷回复用语，不超过200字"
                            />
                            <span style={{ color: lengthError ? '#f04134' : '#bfbfbf', float: 'right' }}>最多不超过200个字</span>
                        </Col>
                    </Row>
                    {
                        type !== 1 ?
                            <Row {...rowStyle}>
                                <Col span={4} style={{ textAlign: 'right' }}>添加图片</Col>
                                <Col span={18} offset={2}>
                                    <ImgUpload {...imgUploadProps} />
                                </Col>
                            </Row> : null
                    }

                </Modal> : null
        )
    }
}

EditModal.defaultProps = {
    showEditModal: false,
    editModalTitle: '',
    quickReplyLabels: [],
    editModalContent: {},
}

EditModal.propTypes = {
    showEditModal: PropTypes.bool,
    editModalTitle: PropTypes.string,
    quickReplyLabels: PropTypes.array,
    editModalContent: PropTypes.object,
}

export default EditModal
