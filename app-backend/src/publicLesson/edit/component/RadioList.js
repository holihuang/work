/*
*  @flie: radio组件
*  @author: huanghaolei
*  @date: 2018-01-19
*
* */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Radio } from 'antd';
const RadioGroup = Radio.Group;

class RadioList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentWillReceiveProps(nextProps) {
        const { choseValue, dispatch, name } = nextProps
        if(choseValue !== 1) {
            dispatch('toggleCourseDetailDesRadio', { choseValue, name })
        }
    }

    onChange = e => {
        const { dispatch, name } = this.props
        dispatch('toggleCourseDetailDesRadio', { choseValue: e.target.value, name })
    }

    renderOptList() {
        const { radioTxtArr } = this.props
        return  radioTxtArr.map((item, index) => <Radio key={index} value={index + 1}>{item}</Radio> )
    }

    render() {
        const { radioTxtArr, choseValue } = this.props

        const radioGropProps = {
            value: choseValue,
            onChange: this.onChange,
        }
        return (
            <RadioGroup {...radioGropProps}>
                {this.renderOptList()}
            </RadioGroup>
        )
    }
}

RadioList.propTypes = {
    radioTxtArr: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    choseValue: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired,
}

export default RadioList

