/*
** @file: BottomTabBar-底部tabBar组件
** @author: huanghaolei
** @date: 2019-07-26
*/

import React from 'react'
import { TabBar } from 'antd-mobile'
const { Item: TabBarItem } = TabBar

class BottomTabBar extends React.Component {
    constructor(props) {
        super(props)
        const { selectedTab = '' } = props
        this.state = {
            selectedTab: selectedTab || 'storySet',
        }
    }

    renderItems = (list, onSelected) => {
        const { selectedTab } = this.state
        return list.map(item => {
            const { key, label, icon, activeIcon } = item
            const itemProps = {
                title: label,
                key: label,
                icon,
                selectedIcon: activeIcon,
                selected: selectedTab === key,
                onPress: () => {
                    this.setState({ selectedTab: key })
                    onSelected(key)
                },
            }
            return <TabBarItem {...itemProps}></TabBarItem>
        })
    }

    render() {
        const { list, onSelected } = this.props
        return (
            <div>
                <TabBar>
                    { this.renderItems(list, onSelected) }
                </TabBar>
            </div>
        )
    }
}

export default BottomTabBar