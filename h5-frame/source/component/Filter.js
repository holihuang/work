import React from 'react'
import PropTypes from 'prop-types'
import { Tabs } from 'antd-mobile'
import 'antd-mobile/lib/tabs/style/index.css'

class Filter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    handleChange = e => {
        const { onChange } = this.props
        onChange(e)
    }
    render() {
        const { tabs } = this.props
        const tabsProps = {
            tabs,
            onChange: this.handleChange,
        }
        return (
            <Tabs {...tabsProps} />
        )
    }
}

Filter.propTypes = {
    tabs: PropTypes.array,
    onChange: PropTypes.func,
}

Filter.defaultProps = {
    tabs: [],
    onChange: () => {}
}

export default Filter