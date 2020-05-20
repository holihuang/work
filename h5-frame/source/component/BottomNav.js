import React from 'react'
import { TabBar } from 'antd-mobile'
import 'antd-mobile/lib/tab-bar/style/index.css'

import '../styles/bottomNav.css'

const { Item } = TabBar || {}

class BottomNav extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedKey: props.tabBarList[0].key
        }
    }
    
    renderIconDom = iconPic => {
        const style = {
            background: `url(${iconPic}) no-repeat`,
            backgroundSize: '100% 100%',
        }
        return (
            <div className="frame-nav_icon" style={style} />
        )
    }

    handlePress = pressedKey => {
        this.setState({
            selectedKey: pressedKey
        })
    }

    render() {
        const { tabBarList, style, onBottomPress } = this.props
        const { selectedKey } = this.state
        return (
            <div style={style}>
                <TabBar>
                    {
                        tabBarList.map((item, index) => {
                            const { key = '', title = '', icon = '', selectedIcon = '' } = item
                            const itemProps = {
                                key,
                                title,
                                icon: this.renderIconDom(icon),
                                selectedIcon: this.renderIconDom(selectedIcon),
                                selected: selectedKey === key,
                                onPress: () => {
                                    this.handlePress(key)
                                    onBottomPress({ key, index })
                                },
                            }
                            return (
                                <Item {...itemProps} />
                            )
                        })
                    }
                </TabBar>
            </div>
        )
    }
}

export default BottomNav