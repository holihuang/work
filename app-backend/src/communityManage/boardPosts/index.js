import moment from 'moment'
import { service } from '../../common/service'
import { common } from '../../common/common'
import { SearchPanel } from './searchPanel/index'

import { OperatePanel } from './operatePanel/index'

import { Pager } from '../../components/pager/index'
import { Items } from './items/index'
import { PostSlaveItems } from './postSlaveItems/index'

const template = require('./tpl.html')

const Model = Backbone.Model.extend({
    defaults: {
        normalPostsClass: '',
        unnormalPostsClass: '',
        postSlaveClass: '',
        unnormalPostSlaveClass: '',
        minPraiseCount: '',
    },
})

const PAGE_SIZE = 100
let isCheckedAll = false

const BoardPosts = Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        const { postType } = options
        if (postType == '1') {
            // 正常帖
            this.model.set({ normalPostsClass: 'active' })
            this.model.set({
                isHide: 0, deleteFlag: 0, showPostPurpose: false, showThumbupCommentsNumber: true,
            })
        } else if (postType == '0') {
            this.model.set({ unnormalPostsClass: 'active' })
            this.model.set({
                isHide: 1, deleteFlag: 1, showPostPurpose: true, showThumbupCommentsNumber: false,
            }) // 删除帖和屏蔽帖
        } else if (postType == '2') {
            // 回帖
            this.model.set({ postSlaveClass: 'active', isHide: 0, deleteFlag: 0 })
        } else if (postType == '3') {
            // 删除屏蔽回帖
            this.model.set({ unnormalPostSlaveClass: 'active' })
            this.model.set({
                isDelOrShieldReply: true, isHide: 1, deleteFlag: 1, showPostPurpose: true, showThumbupCommentsNumber: false,
            })
        }
        this.model.set({ postType })
        this.render()
        this.listenTo(this.model, 'change:resultList', this.renderTableList)
        this.listenTo(this.model, 'change:pageNo', this.renderPager)
        this.listenTo(this.model, 'change:pageCount', this.renderPager)
        this.listenTo(this.model, 'change:totalCount', this.renderPager)
    },

    events: {
        'click #retrievePostList': 'retrievePostList',
        'click #downloadBtn': 'download',
        'click #innerBtn': 'checkAllOrNot', // 全选/反选
        'change .check-item-ipt': 'checkBoxChange',
        'click .triangle-box': 'clickSortOrder',
        'click .topic-switch-btn': 'setTopic', // 设置是否为话题贴筛选项
    },

    retrievePostList(el, reqTime, pageNo = 1) {
        if ($('#nicknameList').html()) {
            alert('请选择发帖人昵称！')
            return
        }

        const searchParams = common.getFormData({ formId: 'searchForm' })

        const {
            praiseCountOrder, replyCountOrder, createTimeOrder, operateTimeOrder, postType,
        } = this.model.toJSON()
        if (praiseCountOrder) {
            Object.assign(searchParams, { praiseCountOrder })
        }
        if (replyCountOrder) {
            Object.assign(searchParams, { replyCountOrder })
        }

        if (createTimeOrder) {
            Object.assign(searchParams, { createTimeOrder })
        }
        if (operateTimeOrder) {
            Object.assign(searchParams, { operateTimeOrder })
        }

        // 先校验select是否选中手机选项 || 校验电话号码是否少于9位
        const typeName = this.$el.find('#type option:selected').text()
        const iptMobile = this.$el.find('#iptMobile').val()
        if (typeName == '手机号' && iptMobile && iptMobile.length < 9) {
            let phoneText
            if (postType == '0' || postType == '1') {
                phoneText = '发帖人'
            } else if (postType == '2' || postType == '3') {
                phoneText = '回帖人'
            }
            alert(`电话号码最少录入9位，请确认${phoneText}的电话!`)
            return false
        }

        this.model.set({
            reqTime: moment().format('YYYY-MM-DD hh:mm:ss'),
            ...searchParams,
        })

        const { pageSize = PAGE_SIZE } = this.model.toJSON()

        this.getPostListData({
            pageSize,
            pageNo: 1,
        })
    },


    setTopic(e) {
        const isTopic = $(e.currentTarget).attr('istopic')
        this.model.set({ isTopic })
        this.$('#topicTabSwitch').find('.active').removeClass('active')
        $(e.currentTarget).addClass('active')
        this.retrievePostList()
    },

    // 全选/反选
    checkAllOrNot() {
        if (isCheckedAll) {
            this.$el.find('.check-item-ipt').each(function () {
                this.checked = false
            })
            isCheckedAll = false
            this.countCheckedNumber()
        } else {
            this.$el.find('.check-item-ipt').each(function () {
                this.checked = true
            })
            isCheckedAll = true
            this.countCheckedNumber()
        }
    },

    checkBoxChange() {
        this.countCheckedNumber()
    },
    // 统计选中的checkbox的数量
    countCheckedNumber() {
        let checkedNumber = 0
        this.$el.find('.check-item-ipt').each(function () {
            if (this.checked == true) {
                checkedNumber++
            }
        })

        // this.model.set({checkedNumber});
        this.items && this.items.changeCheckedStatus(checkedNumber)
        this.postSlaveItems && this.postSlaveItems.changeCheckedStatus(checkedNumber)

        return checkedNumber
    },

    getDefaultParams() {
        // 获取参数
        let {
            postType, albumParentId, albumChildId, reqTime, showPostPurpose,
            // 以下为新增搜索条件
            postMasterId, postReplysId, postState, startTime, endTime, sensitiveWord, firstReason, isReply,
            // 新增选中复选框数
            checkedNumber, minPraiseCount, maxPraiseCount, minReplyCount, maxReplyCount,
        } = this.model.toJSON()

        // 取新增的“操作开始时间”，“操作结束时间”字段
        const operateStartTime = this.$el.find('#operateStartTime').val()
        const operateEndTime = this.$el.find('#operateEndTime').val()

        const userId = this.$el.find('#searchForm #userId').val()
        const nickname = this.$el.find('#searchForm #nickname').val()
        const mobile = this.$el.find('#searchForm #iptMobile').val()

        if (postType == 1 || postType == 0) {
            // 主帖
            const {
                postSubject, isHide, deleteFlag, isTopic,
            } = this.model.toJSON()

            if (postType == 1) {
                const topicName = this.$el.find('#topicName').val()
                const content = this.$el.find('#topicContent').val()
                const riskFlag = +this.$el.find('#riskFlag option:selected').val() ? '1' : null
                // 主贴-帖子状态-格式[val]
                postState = postState.split(' ')
                const intPostState = []
                intPostState.push(+postState[0])
                postState = intPostState

                return {
                    albumParentId,
                    albumChildId,
                    postSubject,
                    isHide,
                    deleteFlag,
                    reqTime,
                    showPostPurpose,
                    // 以下为新增搜搜条件
                    postMasterId,
                    startTime,
                    endTime,
                    userId,
                    nickname,
                    mobile,
                    sensitiveWord,
                    firstReason,
                    minPraiseCount,
                    maxPraiseCount,
                    minReplyCount,
                    maxReplyCount,
                    // 新增选中复选框数
                    checkedNumber,
                    // 是否是话题贴
                    isTopic,
                    topicName,
                    content,
                    postState,
                    operateStartTime,
                    operateEndTime,
                    riskFlag,
                }
            } else if (postType == 0) {
                const postState = this.checkedCheckBox(this.$el.find('#masterPostState').find(':checkbox:checked'), 1)
                const sensitiveWord = this.checkedCheckBox(this.$el.find('#masterSensitiveWord').find(':checkbox:checked'), 0)
                return {
                    albumParentId,
                    albumChildId,
                    postSubject,
                    isHide,
                    deleteFlag,
                    reqTime,
                    showPostPurpose,
                    // 以下为新增搜搜条件
                    postMasterId,
                    startTime,
                    endTime,
                    userId,
                    nickname,
                    mobile,
                    sensitiveWord,
                    firstReason,
                    // 新增选中复选框数
                    checkedNumber,
                    postState,
                    sensitiveWord,
                    operateStartTime,
                    operateEndTime,
                }
            }
        } else if (postType == 2) { // 回帖
            const { content, isHide, deleteFlag } = this.model.toJSON()
            return {
                albumParentId,
                albumChildId,
                content,
                reqTime,
                // 以下为新增搜索条件
                startTime,
                endTime,
                nickname,
                mobile,
                userId,
                postState,
                isReply,
                // 新增选中复选框数
                checkedNumber,
                // 敏感词
                sensitiveWord,
                postReplysId,
                isHide,
                deleteFlag,
            }
        } else if (postType == 3) {
            // 删除屏蔽回帖
            const {
                isDelOrShieldReply, postSubject, isHide, deleteFlag, isTopic,
            } = this.model.toJSON()
            const postReplysId = this.$el.find('#postReplysId').val()
            const content = this.$el.find("[name='content']").val()
            const postState = this.checkedCheckBox(this.$el.find('#replyPostState').find(':checkbox:checked'), 1)
            const sensitiveWord = this.checkedCheckBox(this.$el.find('#replySensitiveWord').find(':checkbox:checked'), 0)
            return {
                isDelOrShieldReply,
                albumParentId,
                albumChildId,
                postSubject,
                isHide,
                isReply,
                deleteFlag,
                reqTime,
                showPostPurpose,
                // 以下为新增搜搜条件
                content,
                postReplysId,
                startTime,
                endTime,
                userId,
                nickname,
                mobile,
                sensitiveWord,
                firstReason,
                // 新增选中复选框数
                checkedNumber,
                isHide,
                deleteFlag,
                postState,
                sensitiveWord,
                operateStartTime,
                operateEndTime,
            }
        }
    },

    // 检测checkbox选中的值
    checkedCheckBox(list, flag) {
        /*
        ** flag = 1 *** 取value
        ** flag = 0 *** 取text
        */
        const arr_value = []
        const arr_text = []

        for (const val of list) {
            if (val.value) {
                arr_value.push(+val.value)
            }
            if (val.attributes.text.nodeValue) {
                arr_text.push(val.attributes.text.nodeValue)
            }
        }

        if (flag) {
            return arr_value
        }
        return arr_text
    },

    getPostListData(options = { pageSize: PAGE_SIZE, pageNo: 1 }) {
        common.loading() // loading动画
        const bsParams = this.getDefaultParams()

        const selector = this.$el.find('#type option:selected').val()

        // 有nickname时, 过滤掉入参中无效的userId, mobile
        if (selector == 'nickname') {
            bsParams.mobile = ''
        }

        // 有userId时, 过滤掉入参中无效的nickname, mobile
        if (selector == 'userId') {
            bsParams.nickname = ''
            bsParams.mobile = ''
        }

        // 有mobile时, 过滤掉入参中无效的userId, nickname
        if (selector == 'phoneNumber') {
            bsParams.userId = ''
            bsParams.nickname = ''
        }


        const { postType } = this.model.toJSON()
        const {
            praiseCountOrder, replyCountOrder, createTimeOrder, operateTimeOrder,
        } = this.model.toJSON()
        if (praiseCountOrder || replyCountOrder || createTimeOrder || operateTimeOrder) {
            Object.assign(bsParams, {
                praiseCountOrder, replyCountOrder, createTimeOrder, operateTimeOrder,
            })
        }

        const { pageSize, pageNo } = options

        // sensitiveWord 中“100%通过”字段URI编码
        const { sensitiveWord } = bsParams
        sensitiveWord && sensitiveWord.forEach((item, index) => {
            if (item == '100%通过') {
                item = encodeURI(item)
                sensitiveWord.splice(index, 1, item)
            }
        })

        Object.assign(bsParams, { sensitiveWord })
        const params = {
            pageSize,
            pageNo,
            ...bsParams,
        }
        let postMethod
        if (postType == 0 || postType == 1) {
            postMethod = 'retrievePostList'
        } else if (postType == 2) {
            // 回帖
            const { isReply, postReplysId } = bsParams
            if (+isReply) {
                // 二级回帖
                postMethod = 'retrievePostReplyList'
                params.replyId = postReplysId
            } else {
                postMethod = 'retrieveSlavePostList'
                params.postSlaveId = postReplysId
            }
        } else if (postType == 3) {
            // 删除/屏蔽回帖
            const { isReply, postReplysId } = bsParams
            if (+isReply) {
                // 二级回帖
                postMethod = 'retrievePostReplyList'
                params.replyId = postReplysId
            } else {
                postMethod = 'retrieveSlavePostList'
                params.postSlaveId = postReplysId
            }
        }

        service[postMethod](params, response => {
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
                    bsParams,
                })

                // 每次刷新列表将全选状态置为false
                isCheckedAll = false
            }
        })
    },

    download() {
        const {
            pageSize = PAGE_SIZE, pageNo = 1, totalCount, postType,
        } = this.model.toJSON()
        let downloadMethod
        const bsParams = this.getDefaultParams()

        const params = {
            pageSize,
            pageNo,
            ...bsParams,
        }
        const { isReply, postReplysId } = bsParams
        switch (postType) {
        case '1':
            downloadMethod = 'normalPostDownload'
            break
        case '0':
            downloadMethod = 'dhPostDownload'
            break
        case '2':
            if (+isReply) { // 二级回帖
                downloadMethod = 'replyPostDownload'
                params.replyId = postReplysId
            } else {
                downloadMethod = 'slavePostDownload'
                params.postSlaveId = postReplysId
            }
            break
        case '3':
            if (+isReply) {
                // 二级回帖
                downloadMethod = 'dhPostReplyDownload'
                params.replyId = postReplysId
            } else {
                downloadMethod = 'dhPostSlaveDownload'
                params.postSlaveId = postReplysId
            }
            break
        default:
            break
        }

        if (totalCount > 3000) {
            alert('目前仅支持最大导出数据为3000条，请您重新选择导出条件~')
        } else {
            service[downloadMethod](params)
        }
    },

    renderTableList() {
        const bsParams = this.getDefaultParams()
        const {
            resultList, pageSize, pageNo, postType, checkedNumber, showThumbupCommentsNumber, topicName, content,
        } = this.model.toJSON()
        if (postType == 1 || postType == 0) {
            // 主帖
            this.items && this.items.undelegateEvents()
            this.items = new Items({
                el: this.$el.find('tbody')[0],
                resultList,
                pageSize,
                pageNo,
                showThumbupCommentsNumber,
                postType,
                topicName,
                content,
                ...bsParams,
            })
        } else if (postType == 2 || postType == 3) {
            // 主帖
            this.postSlaveItems && this.postSlaveItems.undelegateEvents()
            this.postSlaveItems = new PostSlaveItems({
                el: this.$el.find('tbody')[0],
                resultList,
                pageSize,
                pageNo,
                postType,
                ...bsParams,
            })
        }

        // 页面滚动到顶部
        $('body').scrollTop(0)
    },

    renderPager() {
        const {
            pageNo, pageSize, pageCount, reqTime, totalCount,
        } = this.model.toJSON()
        const showCountTip = true
        this.pager && this.pager.undelegateEvents()
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer')[0],
            onChange: this.getPostListData.bind(this),
            pageNo,
            pageSize,
            pageCount,
            reqTime,
            totalCount,
            showCountTip,
            optionsList: [
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
                {
                    value: 300,
                    optionsChecked: '',
                    valueText: '300',
                },
            ],
        })
    },

    clickSortOrder(e) {
        // var $tar = $(e.currentTarget).parent();
        const $tar = $(e.currentTarget)
        const parms = $tar.attr('data-parms')
        let count = 0 // 向上传1 向下传2

        $tar.parent().siblings().find('.triangle-box').removeClass('up')
            .removeClass('down')
        if ($tar.is('.up')) {
            // 点击向下
            $tar.removeClass('up').addClass('down')
            count = 2
        } else {
            // 点击向上
            $tar.removeClass('down').addClass('up')
            count = 1
        }

        let praiseCountOrder = '',
            replyCountOrder = '',
            createTimeOrder = '',
            operateTimeOrder = '',
            obj = {
                [parms]: count,
            },
            finalParm = Object.assign({}, { praiseCountOrder }, { replyCountOrder }, { createTimeOrder }, { operateTimeOrder }, obj)

        this.model.set(finalParm)
        this.retrievePostList()
    },

    format(data) {
        const {
            postType, showPostPurpose, flag_isCheckBoxTitleShow, showThumbupCommentsNumber,
        } = data
        let tableTitleList,
            isCheckboxShow
        if (postType == 1 || postType == 0 || postType == 3) {
            // 主帖
            let replyTime = '发帖时间'
            if (postType == 3) {
                replyTime = '回帖时间'
            }
            const postName = postType == 3 ? '回帖人ID' : '发帖人ID'
            tableTitleList = [
                '帖子ID',
                '帖子标题',
                '一级版块名称',
                '二级版块名称',
                `<span>${replyTime}</span>
                 <div class="triangle-box postTime" data-parms="createTimeOrder">
                    <div class="triangle-up normal-border-bottom"></div>
                    <div class="triangle-down normal-border-top"></div>
                 </div>
                `,
                '发帖人昵称',
                // 隐藏手机号
                // '发帖人手机号',
                `${postName}`,
                '<span>' + '操作时间' + '</span>' +
                '<div class="triangle-box operateTime" data-parms="operateTimeOrder"> ' +
                '<div class="triangle-up normal-border-bottom">' + '</div>' +
                '<div class="triangle-down normal-border-top">' + '</div>' +
                '</div>',
                // '最后一次操作人',
                '操作日志',
                '帖子状态',
                '操作',
            ]

            var checkAllBtn = '<' + 'a id="innerBtn" class="btn btn-default"' + '>' + '全选' + '</' + 'a>'
            tableTitleList.unshift(checkAllBtn)
            isCheckboxShow = true
            this.model.set({ isCheckboxShow })

            if (showPostPurpose) {
                // 说明是屏蔽帖
                tableTitleList.splice(9, 0, '包含敏感词')
            }

            // 主贴-点赞数-评论数
            if (showThumbupCommentsNumber) {
                const minPraiseCount = '<span>' + '点赞数' + '</span>' +
                '<div class="triangle-box thumbUpSortOrder" data-parms="praiseCountOrder">' +
                '<div class="triangle-up normal-border-bottom">' + '</div>' +
                '<div class="triangle-down normal-border-top">' + '</div>' +
                '</div>'
                const replyCountOrder = '<span>' + '评论数' + '</span>' +
                '<div class="triangle-box commentsSortOrder" data-parms="replyCountOrder">' +
                '<div class="triangle-up normal-border-bottom">' + '</div>' +
                '<div class="triangle-down normal-border-top">' + '</div>' +
                '</div>'

                tableTitleList.splice(2, 0, minPraiseCount, replyCountOrder)
                tableTitleList.splice(5, 0, '帖子话题')
            }

            if (postType == 3) {
                tableTitleList.splice(6, 1, '回帖人昵称')
                // 隐藏手机号
                // tableTitleList.splice(7, 1, '回帖人手机号');
                // tableTitleList.splice(5, 1, '回帖时间');
                tableTitleList.splice(2, 1, '回帖内容', '回帖图片')
            }

            // 二期-新增的“帖子内容”
            if (postType == 1) {
                tableTitleList.splice(5, 0, '帖子内容')
            }
        } else if (postType == 2) {
            // 回帖
            tableTitleList = [
                '回帖ID',
                '回帖内容',
                '一级版块名称',
                '二级版块名称',
                '<span>' + '回帖时间' + '</span>' +
                '<div class="triangle-box postTime" data-parms="createTimeOrder"> ' +
                '<div class="triangle-up normal-border-bottom">' + '</div>' +
                '<div class="triangle-down normal-border-top">' + '</div>' +
                '</div>',
                '回帖人昵称',
                // '回帖人手机号',
                '回帖人ID',
                '<span>' + '操作时间' + '</span>' +
                '<div class="triangle-box operateTime" data-parms="operateTimeOrder">' +
                '<div class="triangle-up normal-border-bottom">' + '</div>' +
                '<div class="triangle-down normal-border-top">' + '</div>' +
                '</div>',
                // '操作人',
                '回复类型',
                '操作日志',
                '回帖状态',
                '操作',
            ]

            var checkAllBtn = '<' + 'a id="innerBtn" class="btn btn-default"' + '>' + '全选' + '</' + 'a>'
            tableTitleList.unshift(checkAllBtn)
            isCheckboxShow = true
            this.model.set({ isCheckboxShow })
        }

        // 主贴页加上话题与非话题切换
        data.showTopicSwitchTab = postType == 1

        return { tableTitleList, ...data }
    },

    // 选中的复选框所对应的PostMasterId
    /*= ===flag_id=1-----PostMasterId=====
      ====flag_id=0-----PostSlaveId======
      ====flag_id=2-----checked_index======
    */
    checkedInvertToPostIds: (flag_id, options) => {
        const postmasterIds = []
        const postslaveIds = []
        let Array_id

        const resultList = options.model.toJSON().resultList
        const checked_index = []
        $('.check-item-ipt').each(function () {
            if (this.checked == true) {
                const index = $(this).val()
                checked_index.push(index)
            }
        })
        const l = checked_index.length
        if (flag_id == 1) {
            for (var i = 0; i < l; i++) {
                const postMasterId = resultList[checked_index[i]].postMasterId
                postmasterIds.push(postMasterId)
            }
            Array_id = postmasterIds
            return { Array_id, checked_index }
        } else if (flag_id == 0) {
            for (var i = 0; i < l; i++) {
                const postSlaveId = resultList[checked_index[i]].postSlaveId
                postslaveIds.push(postSlaveId)
            }
            Array_id = postslaveIds
            return { Array_id, checked_index }
        } else if (flag_id == 2) {
            return { checked_index }
        }
    },

    /*= ===========================判断是否可以回调checkAllOrNot=============================== */
    canCallbackCheckedAllOrNot(checkedItemNumber) {
        const l = this.$el.find('.check-item-ipt').length
        if (checkedItemNumber == l) {
            return true
        }
        return false
    },
    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(template(data))
        const { postType, postState } = data
        new SearchPanel({
            el: this.$el.find('#searchPanel')[0],
            postType,
        })
        this.operatePanel = new OperatePanel({
            el: this.$el.find('#batchOperateList')[0],
            postType,
            postState,
            // 批量加精主贴
            onEnlighten: () => {
                if (this.countCheckedNumber()) {
                    const thatItems = this.items
                    const postmasterIds = this.checkedInvertToPostIds(1, thatItems).Array_id

                    this.items && this.items.batchStar(postmasterIds, 1) // flag = 1==对应==operateFlag=1;
                    const countCheckedNumber = this.countCheckedNumber()
                    if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                        this.checkAllOrNot()
                    }
                } else {
                    alert('请选择要批量加精的帖子！')
                }
            },
            // 批量屏蔽主贴
            onShieldHostPosts: () => {
                if (this.countCheckedNumber()) {
                    const thatItems = this.items
                    const postmasterIds = this.checkedInvertToPostIds(1, thatItems).Array_id
                    this.items && this.items.hidePostDialog(postmasterIds, 1) // flag = 1==对应==operateFlag=1;
                    const countCheckedNumber = this.countCheckedNumber()
                    if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                        this.checkAllOrNot()
                    }
                } else {
                    alert('请选择要批量屏蔽的帖子！')
                }
            },

            // 批量删除主贴
            onDeleteHostPosts: () => {
                if (this.countCheckedNumber()) {
                    const thatItems = this.items
                    const postmasterIds = this.checkedInvertToPostIds(1, thatItems).Array_id
                    this.items && this.items.deletePostDialog(postmasterIds, 1) // flag = 1==对应==operateFlag=1;
                    const countCheckedNumber = this.countCheckedNumber()
                    if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                        this.checkAllOrNot()
                    }
                } else {
                    alert('请选择要批量删除的帖子！')
                }
            },

            // 批量迁移主贴
            onMigrate: () => {
                if (this.countCheckedNumber()) {
                    const thatItems = this.items
                    const checkedIndexArray = this.checkedInvertToPostIds(2, thatItems).checked_index
                    this.items && this.items.batchTransferPost(checkedIndexArray, 1) // flag = 1==对应==operateFlag=1;
                    const countCheckedNumber = this.countCheckedNumber()
                    if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                        this.checkAllOrNot()
                    }
                } else {
                    alert('请选择要批量迁移的帖子！')
                }
            },

            // 删除/屏蔽主贴-恢复删除主贴
            onRecoverHostPosts: () => {
                if (this.countCheckedNumber()) {
                    const thatItems = this.items
                    const postmasterIds = this.checkedInvertToPostIds(1, thatItems).Array_id
                    const checked_index = this.checkedInvertToPostIds(1, thatItems).checked_index
                    if (this.items && this.items.canBatchOperate(checked_index, 1)) { // flag=1===对应===恢复删除主贴
                        alert('帖子已屏蔽，已删除或批量操作存在多种状态，请重新选择！')
                    } else {
                        this.items && this.items.batchCancelDeletePost(postmasterIds, 1) // flag = 1==对应==operateFlag=1;
                        const countCheckedNumber = this.countCheckedNumber()
                        if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                            this.checkAllOrNot()
                        }
                    }
                } else {
                    alert('请选择要批量恢复删除的帖子！')
                }
            },

            // 删除/屏蔽主贴-恢复屏蔽主贴
            onRecoverShieldPosts: () => {
                if (this.countCheckedNumber()) { 
                    const thatItems = this.items
                    const postmasterIds = this.checkedInvertToPostIds(1, thatItems).Array_id
                    const checked_index = this.checkedInvertToPostIds(1, thatItems).checked_index
                    if (this.items && this.items.canBatchOperate(checked_index, 2)) { // flag=2===对应===恢复屏蔽主贴
                        alert('帖子已屏蔽，已删除或批量操作存在多种状态，请重新选择！')
                    } else {
                        this.items && this.items.batchCancelHidePost(postmasterIds, 1) // flag = 1==对应==operateFlag=1;
                        const countCheckedNumber = this.countCheckedNumber()
                        if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                            this.checkAllOrNot()
                        }
                    }
                } else {
                    alert('请选择要批量恢复屏蔽的帖子！')
                }
            },
            // 删除/屏蔽主贴-批量屏蔽主帖
            onRefusePosts: () => {
                if (this.countCheckedNumber()) {
                    const thatItems = this.items
                    const postmasterIds = this.checkedInvertToPostIds(1, thatItems).Array_id
                    const checked_index = this.checkedInvertToPostIds(1, thatItems).checked_index
                    if (this.items && this.items.canBatchOperate(checked_index, 2)) { // flag=2===对应===恢复屏蔽主贴
                        alert('帖子已屏蔽，已删除或批量操作存在多种状态，请重新选择！')
                    } else {
                        this.items && this.items.batchRefusePosts(postmasterIds, 1) // flag = 1==对应==operateFlag=1;
                        const countCheckedNumber = this.countCheckedNumber()
                        if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                            this.checkAllOrNot()
                        }
                    }
                } else {
                    alert('请选择要批量屏蔽的帖子！')
                }
            },

            // 删除/屏蔽主贴-批量通过主帖
            onAgreePosts: () => {
                if (this.countCheckedNumber()) {
                    const thatItems = this.items
                    const postmasterIds = this.checkedInvertToPostIds(1, thatItems).Array_id
                    const checked_index = this.checkedInvertToPostIds(1, thatItems).checked_index
                    if (this.items && this.items.canBatchOperate(checked_index, 2)) { // flag=2===对应===恢复屏蔽主贴
                        alert('帖子已屏蔽，已删除或批量操作存在多种状态，请重新选择！')
                    } else {
                        this.items && this.items.batchAgreePosts(postmasterIds, 1) // flag = 1==对应==operateFlag=1;
                        const countCheckedNumber = this.countCheckedNumber()
                        if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                            this.checkAllOrNot()
                        }
                    }
                } else {
                    alert('请选择要批量通过的帖子！')
                }
            },
            // 主贴设置和删除话题
            batchSetTopic: () => {
                this.items && this.items.batchSetTopic()
            },

            batchDelTopic: () => {
                this.items && this.items.batchDelTopic()
            },

            // 回帖-批量屏蔽回帖
            onShieldReplyPosts: () => {
                if (this.countCheckedNumber()) {
                    this.postSlaveItems && this.postSlaveItems.batchHideItems()
                    const countCheckedNumber = this.countCheckedNumber()
                    if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                        this.checkAllOrNot()
                    }
                } else {
                    alert('请选择要批量屏蔽的回帖！')
                }
            },

            // 回帖-批量删除回帖
            onDeleteReplyPosts: () => {
                if (this.countCheckedNumber()) {
                    this.postSlaveItems && this.postSlaveItems.batchDeleteItems()
                    const countCheckedNumber = this.countCheckedNumber()
                    if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                        this.checkAllOrNot()
                    }
                } else {
                    alert('请选择要批量删除的回帖！')
                }
            },

            // 回帖-批量恢复屏蔽回帖
            onRecoveryShieldReplyPosts: () => {
                if (this.countCheckedNumber()) {
                    this.postSlaveItems && this.postSlaveItems.batchRecoverHideItems()
                    const countCheckedNumber = this.countCheckedNumber()
                    if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                        this.checkAllOrNot()
                    }
                } else {
                    alert('请选择要批量恢复屏蔽的回帖！')
                }
            },
            // 回帖-批量恢复删除回帖
            onRecoveryDeleteReplyPosts: () => {
                if (this.countCheckedNumber()) {
                    this.postSlaveItems && this.postSlaveItems.batchRecoverDeleteItems()
                    const countCheckedNumber = this.countCheckedNumber()
                    if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                        this.checkAllOrNot()
                    }
                } else {
                    alert('请选择要批量恢复删除的回帖！')
                }
            },
            // 回帖-批量屏蔽回帖
            onRefuseReplyPosts: () => {
                if (this.countCheckedNumber()) {
                    this.postSlaveItems && this.postSlaveItems.batchRefuseReplyPosts()
                    const countCheckedNumber = this.countCheckedNumber()
                    if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                        this.checkAllOrNot()
                    }
                } else {
                    alert('请选择要批量屏蔽的回帖！')
                }
            },
            // 回帖-批量通过审核回帖
            onAgreeReplyPosts: () => {
                if (this.countCheckedNumber()) {
                    this.postSlaveItems && this.postSlaveItems.batchAgreeReplyPosts()
                    const countCheckedNumber = this.countCheckedNumber()
                    if (this.canCallbackCheckedAllOrNot(countCheckedNumber)) {
                        this.checkAllOrNot()
                    }
                } else {
                    alert('请选择要批量通过的回帖！')
                }
            },
            onBatchOperateFlag: flag_isCheckBoxTitleShow => {
                this.model.set({ flag_isCheckBoxTitleShow })
            },
        })
    },
})

export { BoardPosts }
