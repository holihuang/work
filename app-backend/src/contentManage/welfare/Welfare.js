/*
* @file: component
* @author: gushouchuang
* @date: 2019-12-09
* */
import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import { Title, List } from 'tpl2'

import listCfg from './cfg/listCfg'
import logList from './cfg/logListCfg'
import titleCfg from './cfg/title'

class Welfare extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    closeLogModal = () => {
        this.props.dispatch('closeLogModal')
    }

    render() {
        const { props } = this
        const { showLog } = props

        const titleProps = titleCfg(props)
        const listProps = listCfg(this)
        const logListProps = logList(this)

        const logModalProps = {
            title: '操作日志',
            visible: true,
            onOk: () => {
                this.closeLogModal()
            },
            onCancel: () => {
                this.closeLogModal()
            },
        }
        return (
            <div style={{ width: '100%' }}>
                <Title {...titleProps} />
                <div style={{ padding: '10px 30px' }}>
                    <List {...listProps} />
                </div>
                {
                    showLog ? (
                        <Modal {...logModalProps}>
                            <div>
                                <List {...logListProps} />
                            </div>
                        </Modal>
                    ) : null
                }
            </div>
        )
    }
}


Welfare.propTypes = {
    showLog: PropTypes.bool,
}

Welfare.defaultProps = {
    showLog: false,
}

export default Welfare
