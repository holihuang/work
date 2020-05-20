/*
*  @file: 下拉框组件
*  @author: huanghaolei
*  @date: 2018-01-18
*
* */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Select } from 'antd'
const Option = Select.Option

class SelectComponent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    handleSltChange = e => {
        const { dispatch, name } = this.props
        dispatch('courseSourceSelectChange', { choseValue: e, name })
    }

    renderChildOption() {
        const { children } = this.props
        return children.map((item, index) => <Option key={`opt_${index}`} value={item}>{item}</Option>)
    }

    render() {
        const { children, choseValue, defaultValue } = this.props

        const selectProps = {
            defaultValue,
            value: choseValue || defaultValue,
            style: {
                width: '200px',
            },
            onChange: this.handleSltChange
        }
        return (
            <div>
                <Select {...selectProps}>
                  {this.renderChildOption()}
                </Select>
            </div>
        )
    }
}

SelectComponent.propTypes = {
    dispatch: PropTypes.func.isRequired,
    choseValue: PropTypes.string,
    defaultValue: PropTypes.string.isRequired,
    name: PropTypes.string,
    children: PropTypes.array.isRequired,
}

export default SelectComponent
