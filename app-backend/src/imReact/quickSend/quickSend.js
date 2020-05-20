
/**
 * @file 快捷回复 modal
 *
 * @author gushouchuang
 * @date 2020-03-05
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Select, Input } from 'antd'
import { List } from 'tpl2'
import listCfg from './cfg/listCfg'
import service from './service'

const { Option } = Select

class QuickSend extends React.Component {
    constructor(props) {
        super(props)

        this._blockSendFlag = false

        this.state = {
            keyword: '',
            orderId: '',
            orderIdList: [],
            // 快捷回复列表
            quickList: [], // eslint-disable-line
        }
    }

    componentDidMount() {
        const { stuId, orderDetailId } = this.props
        // 获取子订单信息
        service.getStuOrderList({
            stuId, // 子订单id
            orderDetailId, // 子订单id
        }).then(res => {
            const { curOrderDetailId, itemList } = res
            this.setState({
                orderId: curOrderDetailId,
                orderIdList: itemList || [],
            })
        }, err => {
            Modal.error({ title: err })
        })

        this.query()
    }

    createOrderOptions() {
        const dom = []
        const { orderIdList } = this.state

        orderIdList.forEach(item => {
            dom.push(
                <Option key={item.orderDetailId} value={item.orderDetailId}>{item.itemName}</Option>,
            )
        })

        return dom
    }

    query() {
        const { keyword } = this.state

        service.getAdjectiveLinkList({
            queryContent: keyword.trim(), // 关键词
        }).then(res => {
            this.setState({
                quickList: res || [], // eslint-disable-line
            })
        }, err => {
            Modal.error({ title: err })
        })
    }

    // 发送
    send(data) {
        const { orderId } = this.state
        const { dispatch, stuId } = this.props
        // 上一次请求还没回来
        if (this._blockSendFlag) {
            return
        }

        service.getLinkChatContent({
            stuId,
            orderDetailId: orderId,
            linkType: data.linkType,
        }).then(res => {
            if (res) {
                // 1.发送ws
                // 2.回填聊天框
                dispatch('triggerQuickSend', res)

                this._blockSendFlag = false
                // alert('发送成功')
            }
        }, err => {
            this._blockSendFlag = false

            Modal.error({ title: err })
        })
    }

    render() {
        const { dispatch } = this.props
        const { orderId, keyword } = this.state

        const listProps = listCfg(this)

        const modalProps = {
            title: '发送APP内部跳转链接',
            visible: true,
            width: 800,
            footer: null,
            onCancel: () => {
                // 关闭modal
                dispatch('closeQuickSendModal')
            },
        }

        // 子订单
        const orderNoSelectProps = {
            value: orderId,
            style: {
                width: 300,
            },
            onChange: e => {
                this.setState({
                    orderId: e,
                })
            },
        }

        const inputProps = {
            value: keyword,
            placeholder: '请输入关键字搜索',
            type: 'text',
            style: {
                margin: '0 20px',
                width: 310,
                height: '32px',
                lineHeight: '30px',
            },
            onChange: e => {
                this.setState({
                    keyword: e.target.value,
                })
            },
        }

        const queryProps = {
            type: 'primary',
            style: {
                textAlign: 'center',
            },
            onClick: () => {
                this.query()
            },
        }

        return (
            <div>
                <Modal {...modalProps} >
                    <div style={{
                        paddingTop: '10px',
                    }}
                    >
                        <Select {...orderNoSelectProps}>
                            {this.createOrderOptions()}
                        </Select>
                        <Input {...inputProps} />
                        <Button {...queryProps}>搜索</Button>
                    </div>
                    <div style={{ padding: '15px 0' }}>
                        <List {...listProps} />
                    </div>
                </Modal>
            </div>
        )
    }
}

export default QuickSend

QuickSend.propTypes = {
    stuId: PropTypes.number,
    orderDetailId: PropTypes.number,
}

QuickSend.defaultProps = {
    stuId: 0,
    orderDetailId: 0,
}

