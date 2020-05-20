/*
** @file: CaseHubOper.js 案例展示页
** @author: huanghaolei
** @date: 2019-06-27
*/

import { ComponentGenerator } from 'common/ReactBackbone'
import { global } from 'common/global'
import component from './component/CaseHubOper'
import service from './service'
import cfg from './cfg/optionCfg'

const DEAFULT_PAGE_NO = 1
const DEFAULT_PAGE_SIZE = 50

const DEFAULT_TAB_INDEX = 0

const componentProps = {
    defaults: {
        showPostion: DEFAULT_TAB_INDEX,
        id: '',
        title: '',
        startTime: '',
        endTime: '',
        postSource: '',
        contentLabel: '',
        showStatus: -1,
        iconType: -1,
        pageNo: DEAFULT_PAGE_NO,
        pageSize: DEFAULT_PAGE_SIZE,
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        hash: 'caseHubOper',
        load() {
            return []
        },
        initBehavior() {
            return this.onQuery({ ...this.model.toJSON(), isDidMount: true })
        },

        onSaveTabIndex(opt = {}) {
            this.model.set({ ...opt })
            this.onQuery({ ...this.model.toJSON(), isDidMount: true })
        },

        onPagerChange(opt = {}) {
            this.model.set({
                ...opt,
            })
            this.onQuery({ ...this.model.toJSON(), isDidMount: true })
        },

        onChangeId(opt = {}) {
            this.model.set({
                ...opt,
            })
        },

        onChangeRangeTime(opt = {}) {
            this.model.set({ ...opt })
        },

        onChangeTitle(opt = {}) {
            this.model.set({ ...opt })
        },

        onChangeContentLabel(opt = {}) {
            this.model.set({ ...opt })
        },

        onChangePostSource(opt = {}) {
            this.model.set({ ...opt })
        },

        onChangeIconType(opt = {}) {
            this.model.set(opt)
        },

        onChangeShowStatus(opt = {}) {
            this.model.set({ ...opt })
        },

        onUpdateIcon(opt = {}) {
            return service.updateIcon(opt).then(response => {
                alert('角标设置成功')
                this.onQuery({ ...this.model.toJSON(), isDidMount: true })
            }).catch(e => {
                alert(e)
            })
        },

        onShowOrHide(opt = {}) {
            const params = {
                ...opt,
            }
            return service.updateShowStatus(params).then(response => {
                alert('展示状态变更成功')
                this.onQuery({ ...this.model.toJSON(), isDidMount: true })
            }).catch(e => {
                alert(e)
            })
        },

        updateWeightBatch(opt = {}) {
            return service.updateWeightBatch(opt).then(response => {
                alert('操作成功')
                this.onQuery({ ...this.model.toJSON(), isDidMount: true })
            }).catch(e => {
                alert(e)
            })
        },

        updateShowStatusBatch(opt = {}) {
            return service.updateShowStatusBatch(opt).then(response => {
                alert('操作成功')
                this.onQuery({ ...this.model.toJSON(), isDidMount: true })
            }).catch(e => {
                alert(e)
            })
        },

        onUpdateWeight(opt) {
            const params = {
                ...opt,
            }
            return service.updateWeight(params).then(response => {
                alert('权重更新成功')
                this.onQuery({ ...this.model.toJSON(), isDidMount: true })
            }).catch(e => {
                alert(e)
            })
        },

        onGetLogList(opt = {}) {
            const params = {
                ...opt,
            }
            return service.showCaseOperationLog(params).then(response => {
                this.model.set({
                    logList: response,
                })
            }).catch(e => {
                alert(e)
            })
        },

        getParams(opt = {}) {
            const params = {}
            const { filterOptions } = cfg
            const { isDidMount = false } = opt
            filterOptions.forEach(item => {
                const {
                    key, type = '', defaults = '',
                } = item
                if (type === 'number') {
                    // 只对未输入的Number做处理，0不做处理
                    params[key] = opt[key] === '' ? defaults : opt[key]
                } else {
                    params[key] = opt[key]
                }
            })
            let { pageNo, pageSize, showPostion } = this.model.toJSON()
            if (!isDidMount) {
                // 非didMount下单独处理下rangePicker
                const [min, max] = opt.postRangePicker
                params.startTime = min
                params.endTime = max
                pageNo = DEAFULT_PAGE_NO
                pageSize = DEFAULT_PAGE_SIZE
                params.showPostion = showPostion
            }
            return { ...params, pageNo, pageSize }
        },

        onQuery(opt = {}) {
            const { cb = () => {} } = opt
            const params = this.getParams(opt)
            return service.showGoodPostList(params).then(response => {
                this.model.set({
                    ...response,
                })
                cb({ isPatch: false })
            }).catch(e => {
                alert(e)
            })
        },
    },
}

const CaseHubOper = ComponentGenerator(componentProps)
export { CaseHubOper }
