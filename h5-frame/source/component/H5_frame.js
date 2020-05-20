import React from 'react'

import global from '../common/global'
import Page from './Page'
import BottomNav from './BottomNav'

class H5Frame extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedTabBarIndex: 0
        }
    }

    handleBottomPress = e => {
        const { index } = e
        this.setState({
            selectedTabBarIndex: index
        })
        global.selectedTabBarIndex = index
    }
    
    render() {
        const {
            useTabBar = true,
            tabBarList = [],
            pageList = [],
            page,
        } = this.props
        
        const rootStyle = {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        }

        const { selectedTabBarIndex } = this.state
        const pageProps = page ? { ...page, selectedTabBarIndex } : {
            ...pageList[selectedTabBarIndex],
            selectedTabBarIndex,
        }
        const bottomNavProps = {
            tabBarList,
            onBottomPress: this.handleBottomPress, 
            style: {
                width: '100%',
            }
        }
        return (
            <div style={rootStyle}>
                <Page {...pageProps} />
                {
                    !page && useTabBar && tabBarList.length ? (
                        <BottomNav {...bottomNavProps} />
                    ) : null
                }
            </div>
        )
    }
}

export default H5Frame
