import React from 'react'
import ReactDom from 'react-dom'
import { DatePicker, Button, message  } from 'antd'
import locale from 'antd/lib/date-picker/locale/zh_CN'

import { service } from '../common/service'
import ajax from './service'
import { common } from '../common/common'
import { Dialog } from '../components/dialog/index'
import { Select } from '../components/select/index'

import { Items } from './items/index'
import { Pager } from '../components/pager/index'
import { Add } from './dialog/add/add'

const { RangePicker } = DatePicker

const template = require('./tpl.html')

const Model = Backbone.Model.extend({
    topicClassifyList: [],
})

const filter_key_in_react = ['startTime', 'endTime']
const OPER_BTL_LIST = [{ label: '批量隐藏', show: 0 }, { label: '批量显示', show: 1 }]
const PAGE_SIZE = 50
let that

const SelectedTopics = Backbone.View.extend({
    initialize(options) {
        that = this
        const userInfo = common.getUserInfo()
        const { userRole } = userInfo
        // userRole = 'SCH_BM'学院-版主
        this.model = new Model({ userRole })

        this.render()
        this.listenTo(this.model, 'change:resultList', this.renderTableList)
        this.listenTo(this.model, 'change:pageNo', this.renderPager)
        this.listenTo(this.model, 'change:pageCount', this.renderPager)
        this.listenTo(this.model, 'change:topicClassifyList', this.renderClassifySelect)
        this.queryTableLists()
        this.getTopicClassify()
    },

    events: {
        'click #querySelectedTopics': 'queryTableLists', // 获取查询数据
        'click #addSelectedTopics': 'addSelectedTopics', // 新增话题
        'click .triangle-box': 'sortOrder', // 升降序
        'click #download': 'download', // 导出
        'click #tableSelectAll': 'selectAll',
    },

    getParams() {
        const model = this.model.toJSON()
        const params = common.getFormData({ formId: 'selectedTopicsSearchForm' })
        const paramsInReactCom = {}
        filter_key_in_react.forEach(item => {
            if (model[item]) {
                paramsInReactCom[item] = model[item]
            }
        })
        return {
            ...params,
            ...paramsInReactCom,
        }
    },

    queryTableLists(pageNo = 1) {
        const searchParams = this.getParams()
        const { sortName, sortType } = this.model.toJSON()
        if (typeof sortName !== 'undefined') {
            Object.assign(searchParams, { sortName })
        }
        if (typeof sortType !== 'undefined') {
            Object.assign(searchParams, { sortType })
        }

        this.model.set({
            searchParams,
        })

        const { pageSize = PAGE_SIZE } = this.model.toJSON()

        this.getSelectedTopicsListData({
            pageSize,
            pageNo: 1,
        })
    },

    getSelectedTopicsListData(options = { pageSize: PAGE_SIZE }) {
        const { pageSize, pageNo } = options

        const { searchParams } = this.model.toJSON()

        // 话题类型入参
        const classifyIdList = this.formatTopicClassify(
            this.$el.find('#topicClassify input[name="selectedItemsValue"]').val(),
            this.$el.find('#topicClassify input[name="selectedItemsText"]').val(),
        )

        const params = {
            pageSize,
            pageNo,
            classifyIdList,
            userAccount: window.userInfo.userAccount,
            ...searchParams,
        }
        // 用户类型为"请选择"时，不传userType字段
        const userType = this.$el.find('#userType option:selected').val()
        if (+userType === 3) {
            delete params.userType
        }
        const minConcernedCount = this.$el.find('#minConcernedCount').val()
        const maxConcernedCount = this.$el.find('#maxConcernedCount').val()
        if (minConcernedCount && !maxConcernedCount) {
            alert('请您输入被关注数查询范围~')
            return false
        } else if (!minConcernedCount && maxConcernedCount) {
            alert('请您输入被关注数查询范围~')
            return false
        }

        common.loading() // loading加载动画

        service.selectedTopicsListData(params, response => {
            if (response.rs) {
                const {
                    resultList, totalCount, pageCount, countPerPage, pageIndex,
                } = response.resultMessage
                this.model.set({
                    pageSize: countPerPage,
                    pageNo: pageIndex,
                    resultList,
                    totalCount,
                    pageCount,
                })
                // 初始化全选checkbox
                this.initSelectAllCheckbox()
            }
        })
    },

    initSelectAllCheckbox() {
        const selectAllCheckbox = this.$el.find('#tableSelectAll')[0]
        if (selectAllCheckbox.checked) {
            selectAllCheckbox.checked = false
        }
    },

    formatTopicClassify(str, strText) {
        let arr = []
        if (str) {
            arr = str.indexOf('0') !== -1 ? [0] : str.split(',')
        }
        let resultArr = []
        arr.forEach((item, index) => {
            resultArr.push(+item)
        })

        // checkbox取消时，resultArr查"全部"
        if (!strText) {
            resultArr = [0]
        }
        return resultArr
    },

    getTopicClassify() {
        const params = {
            userAccount: window.userInfo.userAccount,
        }
        service.getTopicClassify(params, response => {
            if (response.rs) {
                const resultList = response.resultMessage || []
                this.model.set({
                    topicClassifyList: resultList,
                })
            } else {
                alert(response.rsdesp)
            }
        })
        this.renderTableList()
    },

    addSelectedTopics() {
        // this.add && this.add.undelegateEvents();
        this.add = new Add({
            onSuccess: this.getSelectedTopicsListData.bind(this),
        })
    },

    download() {
        const searchParams = this.getParams()
        const classifyIdList = this.formatTopicClassify(
            this.$el.find('#topicClassify input[name="selectedItemsValue"]').val(),
            this.$el.find('#topicClassify input[name="selectedItemsText"]').val(),
        )
        const params = {
            userAccount: window.userInfo.userAccount,
            ...searchParams,
            classifyIdList,
        }
        // 用户类型为"请选择"时，不传userType字段
        const userType = this.$el.find('#userType option:selected').val()
        if (+userType === 3) {
            delete params.userType
        }
        service.adminExportTopicList(params)
    },

    sortOrder(e) {
        const $tar = $(e.currentTarget)
        const params = $tar.attr('data-params')
        let sortName
        let sortType

        /*
			sortName=0*************创建时间
			sortName=1*************最后一次更新时间
		*/
        if (params === 'create_time') {
            sortName = 0
        } else {
            sortName = 1
        }
        $tar.parent().siblings().find('.triangle-box').removeClass('up')
            .removeClass('down')
        if ($tar.is('.up')) {
            $tar.removeClass('up').addClass('down')
            sortType = 0
        } else if ($tar.is('.down')) {
            $tar.removeClass('down').addClass('up')
            sortType = 1
        } else {
            $tar.removeClass('down').addClass('up')
            sortType = 1
        }

        const finalParams = Object.assign({}, { sortName }, { sortType })
        this.model.set(finalParams)
        this.queryTableLists()
    },

    convertClassifyListToSelectList(list) {
        const arr = []
        list.forEach((item, index) => {
            arr.push({
                value: item.classifyId,
                text: item.classifyName,
            })
        })
        return arr
    },

    renderClassifySelect() {
        const { topicClassifyList } = this.model.toJSON()
        const list = this.convertClassifyListToSelectList(topicClassifyList)
        this.classifySelect = new Select({
            el: this.$el.find('#topicClassify')[0],
            itemList: list,
            name: 'topicClassifyList',
            selectedItemsText: '请选择话题分类',
        })
    },

    selectAll(e) {
        const ele = e ? e.target : this.$el.find('#tableSelectAll')[0]
        const $checkbox = this.$el.find('.tableCheckbox')
        const checkedArr = [...$checkbox]
        checkedArr.forEach(item => {
            item.checked = ele.checked
        })
    },

    renderTableList() {
        const {
            resultList, topicClassifyList, pageSize, pageNo, userRole,
        } = this.model.toJSON()

        let isSCHBM = false
        if (userRole === 'SCH_BM') {
            isSCHBM = true
        }
        if (this.items) {
            this.items.undelegateEvents()
        }
        this.items = new Items({
            el: this.$el.find('tbody')[0],
            onSuccess: this.getSelectedTopicsListData.bind(this),
            parent: this,
            resultList,
            topicClassifyList,
            pageSize,
            pageNo,
            isSCHBM,
        })
    },

    renderPager() {
        const { pageNo, pageSize, pageCount } = this.model.toJSON()
        if (this.pager) {
            this.pager.undelegateEvents()
        }
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer')[0],
            onChange: this.getSelectedTopicsListData.bind(this),
            pageNo,
            pageSize,
            pageCount,
            optionsList: [
                {
                    value: 50,
                    optionsChecked: '',
                    valueText: '50',
                },
                {
                    value: 100,
                    optionsChecked: '',
                    valueText: '100',
                },
                {
                    value: 200,
                    optionsChecked: '',
                    valueText: '200',
                },
            ],
        })
    },

    getCheckedCheckbox() {
        const $checkbox = this.$el.find('.tableCheckbox')
        const checkedArr = [...$checkbox]
        return checkedArr.filter(item => item.checked).map(item => item.getAttribute('topicid'))
    },

    handleClkMultiOper(opt) {
        const { isShow, clickedIndex } = opt
        // get checked checkbox
        const topicIds = this.getCheckedCheckbox()

        // 验空
        if (!topicIds.length) {
            message.warning('当前没有选中的记录')
            return
        }

        const params = {
            topicIds,
            isShow,
            teacherAccount: window.userInfo.userNickname,
        }
        const txt = OPER_BTL_LIST[clickedIndex].label
        ajax.adminBatchUpdate(params).then(response => {
            message.success(`${txt}成功`)
            this.queryTableLists()
        }).catch(e => {
            message.error(e)
        })
    },

    MultiOperComponent(props) {
        const { dispatch } = props
        const wrapperStyle = {
            margin: '30px 30px -20px 30px',
        }
        return (
            <div style={wrapperStyle}>
                {
                    OPER_BTL_LIST.map((item, idx) => {
                        const { label, show } = item
                        const btnProps = {
                            type: 'primary',
                            style: {
                                marginRight: 10,
                            },
                            'data-index': idx,
                            onClick: e => {
                                const { index } = e.target.dataset
                                dispatch('handleClkMultiOper', { clickedIndex: index, multiOperList: OPER_BTL_LIST, isShow: show })
                            },
                        }
                        return <Button {...btnProps}>{label}</Button>
                    })
                }
            </div>
        )
    },

    handleRangePickerChange(opt) {
        const { rangeTime } = opt
        const [startTime, endTime] = rangeTime
        this.model.set({
            startTime,
            endTime,
        })
    },

    StartUpTimeComponent(...args) {
        const [{ dispatch }] = args
        const props = {
            locale,
            onChange: (...rst) => {
                const [, rangeTime] = rst
                dispatch('handleRangePickerChange', { rangeTime })
            },
        }
        return (
            <div>
                <RangePicker {...props} />
            </div>
        )
    },

    dispatch(...args) {
        const [key, params = {}] = args
        if (!key) {
            console.error('缺少要dispatch的函数名')
            return
        }
        if (!that[key]) {
            console.error('backbone组件缺少要dispatch的函数')
            return
        }
        that[key](params)
    },

    renderReactComponent() {
        const idNodeList = [{ id: 'startUpTime', component: this.StartUpTimeComponent }, {
            id: 'multiOper',
            component: this.MultiOperComponent,
        }]
        idNodeList.forEach(item => {
            const { id, component: Component } = item
            const [root] = this.$el.find(`#${id}`)
            const { dispatch } = this
            const props = {
                dispatch,
            }
            ReactDom.render(
                <Component {...props} />,
                root,
            )
        })
    },

    format(data) {
        // userRole == 'SCH_BM'----新增不显示
        const { userRole } = data
        let isSCHBM = false
        if (userRole === 'SCH_BM') {
            isSCHBM = true
        }
        const result = Object.assign({}, { data }, { isSCHBM })

        return result
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(template(data))
        // 嫁接react组价
        this.renderReactComponent()
    },

})

export { SelectedTopics }
