/*
** @file: pullListView.js
** @author: huanghaolei
** @date: 2019-08-05
*/

import React from 'react'
import { RefreshControl, ListView, Toast } from 'antd-mobile'
import style from '../../styles/less/readRecord.less'
import cfg from './cfg'
import util from '../../common/util'
import global from '../../common/global'

const { slog } = util

const nickNameMaxLength = 10
class PullListView extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			refreshing: false
		}
	}

	componentDidMount() {
		const { parent } = this.props
		parent.pullListView = { scrollToTop: this.scrollToTop }
	}

	slogParams = _ => {
        const { platformInfo: { envName, detailInfo: { account } } } = global
        return {
            login263: account,
            source: envName,
        }
    }

	scrollToTop = _ => {
		this.refs.lv.refs.listview.scrollTo(0, 0)
	}

	getInitData = _ => {
		const dataSource = new ListView.DataSource({
			rowHasChanged: (row1, row2) => row1 !== row2
		})

		const { dataSource: list } = this.props
		return dataSource.cloneWithRows(list)
	}

	onRefresh = _ => {
		const { getList } = this.props
		getList({ withPromise: true, isRefresh: true }).then(() => {
			this.setState({ refreshing: false })
		}).catch(e => {
			Toast.fail(e)
			this.setState({ refreshing: false })
		})
		this.setState({ refreshing: true })
	}

	onScroll = (e) => {
		const { getList } = this.props
		const { indicatorsPos: { y: current }, clientSize: { y: clientHeight } } = e
		// listView 窗口高度
		// tip: 200(顶部tabBar + 底部tab + margin)
		const scrollWindowHeight = clientHeight - 200
		if (current > scrollWindowHeight * 1 / 2) {
			setTimeout(() => {
				getList({ withPromise: true, isOnScroll: true }).then(() => {

				}).catch(e => {
					Toast.fail(e)
				})
			}, 500)
		}
	}

	selectTxt = (textbox, startIndex, stopIndex) => {
		if (textbox.createTextRange) {
			//ie
			var range = textbox.createTextRange()
			range.collapse(true)
			range.moveStart('character', startIndex) //起始光标
			range.moveEnd('character', stopIndex - startIndex) //结束光标
			range.select() //不兼容苹果
		} else {
			//firefox/chrome
			textbox.setSelectionRange(startIndex, stopIndex)
			textbox.focus()
		}
	}

	handleCopy = (index, e) => {
		const ipt = document.getElementById(`ipt${index}`)
		if (!document.execCommand) {
			Toast.fail('copy unsupported');
			return
		}
		this.selectTxt(ipt, 0, ipt.value.length)
		const result = document.execCommand('copy')
		if (result) {
			Toast.success('拷贝成功！')
		} else {
			Toast.fail('拷贝失败！')
		}
		// 复制点击操作打点
		this.slogCopyClick(ipt.dataset.id)
	}

	slogCopyClick = id => {
		slog('readRecord_nickname_copy', { ...this.slogParams, id })
	}

	render() {
		const { dataSource: list, refs } = this.props
		const separator = (sectionID, rowID) => (
			<div
				key={`${sectionID}-${rowID}`}
				style={{
					backgroundColor: '#E5E5E5',
					height: 1
				}}
			/>
		)
		const row = (rowData, sectionID, rowID) => {
			const { weiXinImage, weiXinNickName = '', title, id, source, createTime, remark, eventType } = rowData
			const rowProps = {
				key: rowID,
				className: style.rowWrapper
			}
			const showedWxNickName = (weiXinNickName.length > nickNameMaxLength) ? `${weiXinNickName.substr(0, nickNameMaxLength)}...` : weiXinNickName
			return (
				<div {...rowProps}>
					<div className={style.rowHeader}>
						<img className={style.rowAvatar} src={weiXinImage} />
						<div className={style.rowNameWrapper}>
							<div className={style.rowName}>{showedWxNickName}</div>
							<div className={style.rowSource}>{cfg.sourceSet[source]}</div>
						</div>
						<div className={style.rowCopy} onClick={this.handleCopy.bind(this, rowID)}>
							复制昵称
						</div>
						<input
							readOnly="true"
							id={`ipt${rowID}`}
							data-id={id}
							className={style.nickNameIpt}
							value={weiXinNickName}
						/>
					</div>
					<div className={style.rowBody}>
						<div>
							<span>记录事件：</span>
							<span>{cfg.events[eventType]}</span>
						</div>
						<div className={style.userStory}>
							<span>学员故事: </span>
							<span>{title}</span>
						</div>
						<div>
							<span>记录时间：</span>
							<span>{createTime}</span>
						</div>
						<div>
							<span>备注信息：</span>
							<span>{remark}</span>
						</div>
					</div>
				</div>
			)
		}
		const listViewProps = {
			ref: 'lv',
			dataSource: this.getInitData(),
			renderRow: row,
			renderSeparator: separator,
			initialListSize: 10,
			pageSize: 5,
			scrollRenderAheadDistance: 200,
			scrollEventThrottle: 20,
			onScroll: this.onScroll,
			style: {
				// height: 'calc(100% - 1.3rem)',
				height: '100%',
				overflow: 'auto',
				border: '1px solid #ddd',
				margin: '0.1rem 0',
			},
			scrollerOptions: { scrollbars: true },
			refreshControl: <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
		}
		return <ListView {...listViewProps} />
	}
}

export default PullListView;
