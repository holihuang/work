/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:17 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-03-01 19:31:43
 */
import React from 'react';
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
    className: 'table-colum',
    render: (value, row, index) => {
        return index + 1
    }
}, {
    title: '操作时间',
    dataIndex: 'createTime',
    key: 'createTime',
    className: 'table-colum',
}, {
    title: '操作人',
    dataIndex: 'operationAccount',
    key: 'operationAccount',
    className: 'table-colum',
}, {
    title: '操作内容',
    dataIndex: 'operationDesc',
    key: 'operationDesc',
    className: 'table-colum',
    render: (value, row, index) => {
        return OPERATE_TYPE[value]
    }
}];
class OperateLog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    handleOk = _ => {
        const { handleOk } = this.props
        typeof handleOk === 'function' && handleOk()
    }

    render() {
        const { visible, dataSource } = this.props
        return (
            <Modal
                title={'操作日志'}
                visible={visible}
                onOk={this.handleOk}
                onCancel={this.handleOk}
                cancelText={''}
                width={800}
                maskClosable={false}    
                footer={[
                    <Button key="submit" type="primary" size="large" onClick={this.handleOk}>
                        确定
                    </Button>,
                ]}
            >
                <Table {...{ dataSource, columns, pagination: false }}></Table>
            </Modal>
        );
    }
}

export default OperateLog;
