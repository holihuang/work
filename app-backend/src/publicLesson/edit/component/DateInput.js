/*
*  @file: dateInput
*  @author: huanghaolei
*  @date: 2018-01-22
*
* */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DatePicker  } from 'antd'
import { TimePicker } from 'antd'
import moment from 'moment'
const { RangePicker } = DatePicker;

class DateInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleDateChange = (time, timeStr) => {
        const { dispatch, name } = this.props
        dispatch('changeCourseDate', { timeStr, name })
    }

    handleTimeFirstChange = (time, timeStr) => {
        const { dispatch, name } = this.props
        dispatch('changeCourseTime', { timeStr, name, idx: 0 })
    }

    handleTimeSecondChange = (time, timeStr) => {
        const { dispatch, name } = this.props
        dispatch('changeCourseTime', {timeStr, name, idx: 1})
    }

    render() {
        const { dispatch, type = 'default', choseValue } = this.props
        const format = type == 'default' ? 'YYYY-MM-DD' : 'HH:mm'
        let dateProps
        if(type === 'default') {
            const dateValue = choseValue.length ? moment(choseValue, 'YYYY-MM-DD') : ''
            dateProps = {
                format,
                value: dateValue,
                onChange: this.handleDateChange,
                disabledDate: current => {
                    return current && current.valueOf() < Date.now() - 24 * 60 * 60 * 1000
                },
            }
        }

        let timeFirstProps, timeSecondProps
        if(choseValue instanceof Array) {
            const firstValue = choseValue[0] ? moment(choseValue[0], 'HH:mm') : ''
            const secondValue = choseValue[1] ? moment(choseValue[1], 'HH:mm') : ''
            timeFirstProps = {
                format,
                value: firstValue,
                onChange: this.handleTimeFirstChange,
            }
            timeSecondProps = {
                format,
                value: secondValue,
                onChange: this.handleTimeSecondChange,
            }
        }
        switch(type) {
            case 'default':
                return (
                    <DatePicker {...dateProps} />
                )
            case 'dateRange':
                  return (
                      <div>
                          <TimePicker {...timeFirstProps} />
                          <span style={{display:'inline-block',margin:'0 10px'}}>至</span>
                          <TimePicker {...timeSecondProps} />
                      </div>

                  )
        }
    }
}

DateInput.propTypes = {
    dispatch: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    choseValue: PropTypes.array.isRequired,
}

export default DateInput
