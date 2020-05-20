/**
 * @file h5 落地静态展示页
 *
 * @author gushouchuang
 * @date 2018-12-4
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { url, ua } from '@sunl-fe/util'

import FixedTop from '../../components/fixedTop/Index'

import { Toast } from 'antd-mobile'

import appPng from '../../images/static-app.png'
import wxPng from '../../images/static-wx.png'

const isWX = ua.isWX()

// 跳转到详情页的配置
const PAGE_INFO = {
    exercises: {
        key: 'img',
        app: appPng,
        wx: wxPng,
    }
}

class Static extends React.Component {
    constructor(props) {
        super(props)

        // props.page （页面类型）..
        this._paperId = url.getParams().paperId
        this._pageType = props.params.page
        this.state = {
            isError: false,
            tips: '',
            img: '',
        }
    }

    pullContent() {
        if (this._pageType) {
            const pageInfo = PAGE_INFO[this._pageType]
            if (pageInfo) {
                const content = typeof JSBridge === 'undefined' ? pageInfo.wx : pageInfo.app
                const stateKey = pageInfo.key || 'tips'
                this.setState({
                    [stateKey]: content,
                })
            } else {
                Toast.info('页面打开错误，请退出重试。')
                this.setState({
                    isError: true
                })
            }
        }
    }

    componentDidMount(){
        this.pullContent()
    }

    render() {
        return (
            <div style={{
                // display: 'flex'
            }}>
                {
                    isWX
                    ? <FixedTop pagedetail='studyanalysis' param={this._paperId} />
                    : null
                }
                {
                    this.state.isError === false && <p>
                        {this.state.tips}
                        {
                            this.state.img
                            ? <img src={this.state.img} width="100%" />
                            : null
                        }
                    </p>
                }
            </div>
        );
    }
}

const getLanding = (state) => {
    return state.static
}
const selectors = createSelector(
    [getLanding],
    (staticState) => {
        return {...staticState}
    }
)

export default connect(selectors)(Static)
