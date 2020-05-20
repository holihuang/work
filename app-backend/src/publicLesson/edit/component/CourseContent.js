/*
*  @file: 课程内容组件
*  @author: huanghaolei
*  @date: 2018-01-22
*
* */

import React from 'react'
import PropTypes from 'prop-types'
import { Input } from 'antd'

import DateInput from './DateInput'
import RadioList from './RadioList'

class CourseContent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        const { list, dispatch, } = this.props
        const courseProps = {
            list,
            dispatch,
        }
        return (
            <div style={{padding: '50px 50px 0', width: '80%'}}>
                <b style={{marginBottom:'10px'}}>课程内容</b>
                <Course {...courseProps} />
            </div>
        )
    }
}

CourseContent.propTypes = {
    list: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
}

export default CourseContent


class Course extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    renderDOM() {
        const { dispatch, list } = this.props
        const  baseLabelTextStyle = {
            width: '120px',
            height: '20px',
            lineHeight: '20px',
            float: 'left',
        }
        return list.map((item, index) => {
            let { label, type, radioTxtArr, required=false, radioGroupVal = '', choseProviderVal, choseValue, placeholder = '' } = item
            const isShowAsterisk = required ? 'visible': 'hidden'
            switch(type) {
                case 'dateInput':
                    const dateProps = {
                        dispatch,
                        type: 'default',
                        name: label,
                        choseValue: choseValue,
                    }
                    return (
                        <div style={{marginBottom: '10px'}}>
                            <div style={{...baseLabelTextStyle, height:'28px', lineHeight:'28px'}}>
                                <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                <span>{label}</span>
                            </div>
                            <div style={{display: 'inline-block'}}>
                                <DateInput {...dateProps} />
                            </div>
                        </div>
                    )
                case 'dateTimeRange':
                    const dateTimeRangeProps = {
                        dispatch,
                        type: 'dateRange',
                        name: label,
                        choseValue,
                    }
                    return (
                        <div style={{marginBottom: '10px'}}>
                            <div style={{...baseLabelTextStyle, height:'30px',lineHeight:'30px'}}>
                                <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                <span>{label}</span>
                            </div>
                            <div style={{display: 'inline-block'}}>
                                <DateInput {...dateTimeRangeProps} />
                            </div>
                        </div>
                    )
                case 'radio2':
                    const radioListProps = {
                        dispatch,
                        radioTxtArr,
                        name: label,
                        choseValue: +choseValue,
                        radioGroupVal,
                    }
                    return (
                        <div style={{marginBottom: '10px'}}>
                            <div style={{...baseLabelTextStyle, height:'21px',lineHeight:'21px'}}>
                                <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                <span>{label}</span>
                            </div>
                            <div style={{display: 'inline-block'}}>
                                <RadioList {...radioListProps} />
                            </div>
                        </div>
                    )
                case 'numberInput':
                    placeholder = choseProviderVal === 2 ? '展视互动直播间ID': '欢拓填主播ID'
                    const inputProps = {
                        dispatch,
                        placeholder,
                        name: label,
                        choseValue,
                    }
                    return (
                        <div style={{marginBottom: '10px'}} key={item.key}>
                            <div style={{...baseLabelTextStyle, height:'30px',lineHeight:'30px'}}>
                                <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                <span>{label}</span>
                            </div>
                            <div style={{display: 'inline-block'}}>
                                <NumberInput {...inputProps} />
                          </div>
                        </div>
                    )
                default:
                   return null
            }
        })
    }

    render() {
        return (
            <div>
                {this.renderDOM()}
            </div>
        )
    }
}

class NumberInput extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleIptChange = e => {
        const { dispatch, name } = this.props
        //const reg = /^\d*$/
        const value = e.target.value
        //if(reg.test(value)) {
        //    dispatch('changeCourseLiveId', { value, name })
        //}
        dispatch('changeCourseLiveId', { value, name })
    }

    render() {
        const { dispatch, placeholder, choseValue, } = this.props
        const props = {
            placeholder,
            value: choseValue,
            onChange: this.handleIptChange,
        }
        return (
            <div>
                <Input {...props} />
            </div>
        )
    }
}

NumberInput.propTypes = {
    dispatch: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    choseValue: PropTypes.string.isRequired,
}
