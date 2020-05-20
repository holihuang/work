/**
 * @file h5 落地页模板
 * 
 * @author gushouchuang
 * @date 2018-10-30
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import { Toast } from 'antd-mobile'
import util from '../../common/util'

// 认定
const MATCH_APP_VERSION = '3.3.2'

// 跳转到详情页的配置
const PAGE_INFO = {
	exercises: {
		command: 'questionRecommendation',
		// 两个空参数
		params1: '{}',
		params2: '{}',
	}
}

class Landing extends React.Component {
	constructor(props) {
		super(props)

		// props.page （页面类型）
		this._pageType = props.params.page
		this.state = {
			isError: false,
		}
	}

	// 跳转到对应的详情页面
	landingDetail() {
		// 仅支持在App内查看
		if (typeof JSBridge === 'undefined') {
			Toast.info('请到APP内查看。')
			this.setState({
				isError: true
			})
			return
		}

		if (this._pageType) {
			const pageInfo = PAGE_INFO[this._pageType]
			if (pageInfo) {
				const deviceInfo =  JSON.parse(JSBridge.getData('deviceInfo') || '{}')

				const { appVersion = '' } = deviceInfo

				if (!util.matchNewAppVersion(appVersion, MATCH_APP_VERSION)) {
					Toast.info('请升级到最新版本~')
					this.setState({
						isError: true
					})
					return
				}

				JSBridge.doAction(pageInfo.command, pageInfo.params1, pageInfo.params1)
			} else {
				Toast.info('页面打开错误，请退出重试。')
				this.setState({
					isError: true
				})
			}
		}
	}

	componentDidMount(){
		this.landingDetail()
	}

	render() {

		return (
			<div style={{
				// display: 'flex'
			}}>
				{
					this.state.isError === false && <p style={{
						position: 'absolute',
						top: '50%',		
						left: '50%',		
					}}>跳转中...</p>
				}
			</div>
		);
	}
}

const getLanding = (state) => {
	return state.landing;
}
const selectors = createSelector(
	[getLanding],
	(landing) => {
		return {...landing};
	}
)

export default connect(selectors)(Landing);
