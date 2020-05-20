
/**
 * @file im 留言分配
 *
 * @auth gushouchuang
 * @date 2018-5-23
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Switch, Modal, Button, message } from 'antd'
import service from './service'
import { common } from 'common/common'

class SetImDis extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            loading: true,
            id: -1,
            teacherAccount: '',
            list: [],
        }
    }

    createTeacherList() {
        const list = this.state.list
        const dom = []

        if (this.state.loading) {
            return <p style={{
                textAlign: 'center',
                lineHeight: '60px',
            }}>数据加载中</p>
        }

        if (list.length === 0) {
            return <p style={{
                textAlign: 'center',
                lineHeight: '60px',
            }}>暂无数据</p>
        }

        list.forEach(item => {
            const imgProps = {
                key: item.id,
                src: item.id === this.state.id ? 'images/icon/raido-checked.png' : 'images/icon/raido-check.png',
                style: {
                    cursor: 'pointer',
                    height: '12px',
                    padding: '0 5px',
                },
                onClick: () => {
                    if (item.id === this.state.id) {
                        return
                    }

                    this.setState({
                        id: item.id,
                        teacherAccount: item.teacherAccount
                    })
                }
            }

            dom.push(
                <div style={{
                    padding: '8px 0'
                }}>
                    <span style={{
                        display: 'inline-block',
                        width: '130px',
                    }}>{item.teacherName}</span>
                    <span style={{
                        display: 'inline-block',
                        width: '200px',
                        paddingLeft: '5px',
                    }}>{item.teacherAccount}</span>
                    <span style={{
                        display: 'inline-block',
                        width: '140px',
                        paddingLeft: '5px',
                    }}>
                        <img {...imgProps} />
                        设置为留言接线人
                    </span>
                </div>
            )
        })

        return dom
    }

    submit() {
        const { userAccount } = common.getUserInfo()

        const params = {
            userAccount,
            id: this.state.id,
            teacherAccount: this.state.teacherAccount,
        }

        service.adminSetMsgOperator(params).then(rst => {
            message.info('修改成功')
            this.props.close()
        }, rst => {
            message.error('设置留言接线人失败，请确认本运营小组成员的绑定关系后，再重试。')
        })
    }

    componentDidMount() {
        const { userAccount } = common.getUserInfo()

        const params = {
            type: this.props.type,
            userAccount,
        }

        service.adminGetMsgOperator(params).then(rst => {

            const checkedItem = rst.find(item => item.isMsgOperator) || {}
            let id = checkedItem.id
            if (!id && id !== 0) {
                id = -1
            }
            const teacherAccount = checkedItem.teacherAccount || ''

            this.setState({
                list: rst,
                id,
                teacherAccount,
                loading: false,
            })
        }, rst => {
            Modal.error({
                title: rst
            })
        })
    }

    render() {
        const _that = this
        const modalProps = {
            title: `设置留言接线人`,
            visible: true,
            footer: null,
            onCancel: () => {
                _that.props.close()
            }
        }
        
        const submitProps = {
            type: 'primary',
            disabled: this.state.id === -1, // 未选中不让提交（包含数据为空）
            style: {
                width: '120px',
                height: '30px',
            },
            onClick: () => {
                this.submit()
            }
        } 

        return (
            <div style={{
                display: 'inline-block',
                margin: '0 10px',
                paddingRight: '7px',
                borderRight: '1px solid #fff',
            }}
            >
                <Modal {...modalProps}>
                    <div style={{
                        paddingBottom: '8px',
                        fontWeight: 'bold',
                    }}>     
                        <span style={{
                            display: 'inline-block',
                            width: '130px',
                        }}>姓名</span>
                        <span style={{
                            display: 'inline-block',
                            width: '200px',
                            paddingLeft: '5px',
                        }}>邮箱</span>
                        <span style={{
                            display: 'inline-block',
                            width: '140px',
                            paddingLeft: '5px',
                        }}>
                            操作
                        </span>
                    </div>
                    {this.createTeacherList()}
                    <p style={{
                        padding: '5px 0',
                        color: '#F61717',
                    }}>
                        友情提示：留言接线人默认为班主任，各运营小组根据实际IM接线情况，可以随时更换留言接线人
                    </p>
                    <div style={{
                        textAlign: 'center',
                        paddingTop: '10px',
                    }}>
                        <Button {...submitProps}>提交</Button>
                    </div>
                </Modal>
            </div>
        )
    }
}

SetImDis.defaultProps = {
    type: -1,
    colse: () => {},
}



SetImDis.propTypes = {
    type: PropTypes.number,
}

export default SetImDis
