/*
*  @file:新增|更新 提交按钮按钮组件
*  @author: huanghaolei
*  @date: 2018-01-19
*
* */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'

class SubmitBtn extends React.Component {

    constructor(props) {
        super(props)
        this.state = {}
    }

    handleCancel = e => {
        window.location.hash = '#publicLesson'
    }
    handleSubmit = e => {
        //新增|更新提交
        const { dispatch } = this.props
        dispatch('questSubmit', {})
    }

    render() {
        const cancelBtnProps = {
            style: {
               marginRight: '20px'
            },
            onClick: this.handleCancel,
        }
        const submitProps = {
            type: 'primary',
            onClick: this.handleSubmit,
        }
        return (
            <div style={{marginBottom: '80px',width:'50%'}}>
                <div style={{margin: '0 auto', width:'160px'}}>
                    <Button {...cancelBtnProps}>取消</Button>
                    <Button {...submitProps}>提交</Button>
                </div>
            </div>
        )
    }

}

SubmitBtn.propTypes = {
    dispatch: PropTypes.func.isRequired,
}

export default SubmitBtn
