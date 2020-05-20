/*
** @file: ReadRecord
** @author: huanghaolei
** @date: 2019-07-29
*/
import React from 'react'

import PullListView from '../pullListView/Index'
import style from '../../styles/less/readRecord.less'

import util from '../../common/util'
import global from '../../common/global'
import toTop from '../../images/toTop.png'
import Constants from '../../constants/readRecord'
import TopTab from '../common/TopTab'

const { slog } = util

// 阅读记录页面顶部tabList配置项
const readRecordTabList = [
    { title: '全部', key: 0 },
    { title: '今日', key: 1 },
    { title: '三天内', key: 2 },
    { title: '一周内', key: 3 },
]

class ReadRecord extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tabType: 0
        }
    }
    componentDidMount() {
        this.getRecordList()
        // pvUv
        this.staticPvUv()
    }

    slogParams = _ => {
        const { platformInfo: { envName, detailInfo: { account } } } = global
        return {
            login263: account,
            source: envName,
        }
    }

    staticPvUv = _ => {
        setTimeout(() => {
            slog('readRecord_page_entry', this.slogParams())
        }, 500)
    }

    getRecordList = opt => {
        const { withPromise = false, changeTab = false, isRefresh = false, isOnScroll = false } = opt || {}
        let { dispatch, pageIndex, countPerPage, email263 } = this.props
        const { tabType } = this.state
        const type = Constants.GET_WEIXIN_RECORD_LIST_REQUESTED
        const params = {
            tabType,
            // onScrll翻页加载，onFresh，changeTab重新查询
            pageNo: isOnScroll ? ++pageIndex : 1,
            pageSize: countPerPage,
            employ263: email263, // 员工263
        }
        const otherParams = {
            changeTab,
            isRefresh,
        }
        if (withPromise) {
            return new Promise((resolve, reject) => {
                dispatch({
                    type,
                    payload: {
                        params,
                        otherParams,
                        successCb: () => {
                            resolve()
                        },
                        failCb: () => {
                            reject()
                        }
                    },
                })
            })
        }
        dispatch({
            type,
            payload: {
                params,
                otherParams,
                cb: () => {
                },
            },
        })
    }

    handleChange = key => {
        this.setState({
            tabType: key
        }, () => {
            this.getRecordList({ changeTab: true })
        })
    }

    clearRecordList = _ => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.ON_CLEAR_RECORD_LIST,
            payload: {},
        })
    }

    scrollToTop = _ => {
        // 调用PullListView组件中的方法: 滚动顶部
        this.pullListView.scrollToTop()
    }

    render() {
        const { resultList } = this.props
        const tabProps = {
            list: readRecordTabList,
            onChange: this.handleChange,
        }
        const listViewProps = {
            dataSource: resultList,
            getList: this.getRecordList,
            parent: this,
        }
        return (
            <div style={{ height: '100%' }}>
                {/* <TopTab {...tabProps} /> */}
                <PullListView {...listViewProps} />
                <div className={style.toTopWrapper} onClick={this.scrollToTop}>
                    <img className={style.toTop} src={toTop} />
                </div>
            </div>
        )
    }
}



  

export default ReadRecord
