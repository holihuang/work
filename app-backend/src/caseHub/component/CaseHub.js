/*
* @file: component
* @author: huanghaolei
* @date: 2018-09-13
* */
import React from 'react'
import { Tabs, Modal } from 'antd'
import { Filters, List } from 'tpl2'

import filtersCfg from '../cfg/filtersCfg'
import listCfg from '../cfg/listCfg'
import logList from '../cfg/logListCfg'
import globalStyle from '../style/global.less'

const { TabPane } = Tabs

const tableList = ['社区贴']

class CaseHub extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    generateTabList = list => list.map((item, index) => <TabPane tab={item} key={index} />)

    closeLogModal = () => {
        const { dispatch } = this.props
        dispatch('onClickLog', { closeLogModal: true })
    }

    handleLogOk = () => {
        this.closeLogModal()
    }

    handleLogCancel = () => {
        this.closeLogModal()
    }

    render() {
        const { log: { showLog = false } } = this.props
        const filtersProps = filtersCfg(this)
        const listProps = listCfg(this)
        const logListProps = logList(this)

        const tabProps = {
            onChange: e => {},
        }

        const logModalProps = {
            title: '操作日志',
            visible: true,
            onOk: () => {
                this.handleLogOk()
            },
            onCancel: () => {
                this.handleLogCancel()
            },
        }
        return (
            <div style={{ width: '100%' }}>
                <Tabs {...tabProps}>
                    { this.generateTabList(tableList)}
                </Tabs>
                <Filters {...filtersProps} />
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

export default CaseHub
