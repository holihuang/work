import React from 'react'
import PropTypes from 'prop-types'
import Filter from './Filter'
import Body from './Body'

import '../styles/page.css'
import platform from '../util/platform'
import appUtils from '../util/appUtils'

class Page extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            updatePlatformFlag: false,
        }
    }

    componentDidMount() {
        this.insertEnvInfo()
    }

    insertEnvInfo = _ => {
        this.platform = platform()
        const { updatePlatformFlag } = this.state
        this.setState({
            updatePlatformFlag: !updatePlatformFlag,
        })
    }

    insertPlatformToBodyProps = _ => {
        const { body = {} } = this.props
        const { bodyProps = {} } = body
        return {
            ...body,
            bodyProps: {
                ...bodyProps,
                platform: this.platform,
                appUtils,
            }
        }
    }

    renderFilter = _ => {
        const { useDefaultFilter, filter } = this.props
        const { tabs = [], component: Component, filterProps = {} } = filter
        const filterWrapperStyle = {
            display: 'flex',
        }
        const defaultFilterProps = {...filter, platform: this.platform, appUtils }
        const diyFilterProps = {...filterProps, platform: this.platform, appUtils}
        return (
            useDefaultFilter ? (
                tabs.length ? (
                    <div style={filterWrapperStyle}>
                        <Filter {...defaultFilterProps} />
                    </div>
                ) : null
            ) : (
                    Component && <Component {...diyFilterProps} />
                )
        )
    }

    render() {
        const { selectedTabBarIndex, } = this.props
        const pageWrapperStyle = {
            display: 'flex',
            flexDirection: 'column',
        }
        const bodyProps = {
            body: this.insertPlatformToBodyProps(),
            selectedTabBarIndex,
        }
        return (
            <div className="frame-page_root" style={pageWrapperStyle}>
                {
                    this.renderFilter()
                }
                <div className="frame-page_body">
                    <Body {...bodyProps} />
                </div>
            </div>
        )
    }
}

Page.propTypes = {
    useDefaultFilter: PropTypes.bool,
    filter: PropTypes.object,
    body: PropTypes.object,
    selectedTabBarIndex: PropTypes.object,
}

Page.defaultProps = {
    useDefaultFilter: true,
    filter: {},
    body: {},
    selectedTabBarIndex: 0
}


export default Page
