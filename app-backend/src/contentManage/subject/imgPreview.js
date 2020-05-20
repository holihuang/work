/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:17 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-09-11 11:29:44
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Table, Button } from 'antd'

const OPERATE_TYPE = {
    'insert': '创建',
    'update': '更新',
    'offline': '下线',
}
const columns = [{
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    render: (value, row, index) => {
        return index + 1
    }
}, {
    title: '操作时间',
    dataIndex: 'createTime',
    key: 'createTime',
}, {
    title: '操作人',
    dataIndex: 'operationAccount',
    key: 'operationAccount',
}, {
    title: '操作内容',
    dataIndex: 'operationDesc',
    key: 'operationDesc',
    render: (value, row, index) => {
        return OPERATE_TYPE[value]
    }
}];
class ImgPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    handleCancel = _ => {
        const { handleCancel } = this.props
        typeof handleCancel === 'function' && handleCancel()
    }

    render() {
        const { visible, previewImgUrl } = this.props
        return (
            <Modal visible={visible} footer={null} onCancel={this.handleCancel}>
                <img style={{ width: '100%' }} src={previewImgUrl} />
            </Modal>
        );
    }
}

export default ImgPreview;

