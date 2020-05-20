/*
** @file: Tab
** @author: huanghaolei
** @ date: 2019-07-29
*/
import React from 'react'
import { Tabs, Modal } from 'antd-mobile'
const { TabPane } = Tabs

const fields = 'defaultTabKey'
class TopTab extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleChange = key => {
        const { onChange } = this.props
        onChange(key)
    }

    renderTabPane = _ => {
        const { list } = this.props
        return list.map(item => { 
            const { title, key } = item
            return <TabPane tab={title} key={key} />
        })
    }

    render() {
        const { list, defaultTabKey } =  this.props
        let tabProps = {
            onChange: this.handleChange,
        }
        if (fields in this.props) {
            tabProps = {
                ...tabProps,
                activeKey: defaultTabKey,
            }
        }
        return (
            <Tabs {...tabProps}>
                { this.renderTabPane() }
            </Tabs>
        )
    }
}

TopTab.defaultProps = {
    onChange: () => {},
}

export default TopTab
