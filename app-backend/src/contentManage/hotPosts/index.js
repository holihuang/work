/*
** "推荐热帖" 替换为 "热门推荐"
*/
import { service } from '../../common/service'
import { common } from '../../common/common'
import { Dialog } from '../../components/dialog/index'
import { validate } from '../../common/validate'
import { Pager } from '../../components/pager/index'
import { PostsListItm } from './itemlists/index'
import { UnPayedItems } from './itemlists/unPayedItems'
import { InnerSearch } from './innerSearch/innerSearch'
import { AddRec } from './dialogTpl/addRecommendation/addRecommendation'
import { AddShield } from './dialogTpl/addShield/addShield'
import { AddHotPost } from './dialogTpl/addHotPost/index'
import { PatchAdd } from './dialogTpl/patchAdd/index'
import { DeleteDialog } from './dialogTpl/deleteDialog/index'
import { RecommendFollow } from './recommendFollow/index'


const datepickerCfg = {
    format: 'yyyy-mm-dd hh:ii:00',
    autoclose: true,
    todayBtn: true,
    minView: 'hour',
}

const PAGE_SIZE = 25

const tpl = require('./hotPosts.html')

const Model = Backbone.Model.extend({
    defaults: {
        addRecommendationHead: '新增首页热门推荐',
        addShieldHead: '新增首页取消推荐',
        isShowTopicName: false,
        userAccount: window.userInfo.userAccount,
        pageSize: 25,
        pageNo: 1,
        typeNum: 0,
        pageCount: 0,
        resultList: [], // 推荐列表数据
        shieldList: [], // 屏蔽列表数据
        unpayedList: [], // 非付费学员推荐
        typeOfRecommend: 1, // 推荐类型默认是“帖子”
        topicNameList: [],
    },
})

const HotPosts = Backbone.View.extend({
    initialize() {
        this.model = new Model()
        const {
            pageSize, pageNo, typeNum, pageCount,
        } = this.model.toJSON()
        const type = 1
        const params = {
            pageSize,
            pageNo,
            typeNum,
            type,
            pageCount,
        }

        // 初始化后，getRecommendData获得的pageCount
        this.getRecommendData(params)
        this.initTopicNameList()
        this.listenTo(this.model, 'change:pageCount', this.renderPager)
        this.listenTo(this.model, 'change:pageNo', this.renderPager)
        this.listenTo(this.model, 'change:pageSize', this.renderPager)
        this.listenTo(this.model, 'change:unpayedList', this.renderUnpayedItems)
        this.render()
        this.renderInnerSearch()
    },

    renderPager() {
        const {
            pageSize, pageNo, pageCount, typeNum,
        } = this.model.toJSON()
        this.pager && this.pager.undelegateEvents()

        if (+typeNum === 0) {
            this.pager = new Pager({
                pageSize, pageNo, pageCount, onChange: this.getRecommendData.bind(this),
            })
        } else if (+typeNum === 1) {
            this.pager = new Pager({
                pageSize, pageNo, pageCount, onChange: this.getShieldData.bind(this),
            })
        } else if (+typeNum === 2) {
            this.pager = new Pager({
                pageSize, pageNo, pageCount, onChange: this.getUnpayedListData.bind(this),
            })
        }
        this.$el.find('#postsPagerContainer').html(this.pager.render().el)
    },

    events: {
        'click .home-li': 'switchTab',
        'click #addPostsPic': 'addPostsPic',
        'click #addShield': 'addShield',
        'change #recommendedPosition': 'changeRecomPosition',
        'click #queryUnpayedList': 'getUnpayedListData',
        'click #addHotPost': 'addHotPost',
        'click #patchAdd': 'patchAdd',
        'click #deleteUnpayedPosts': 'deleteUnpayedPosts',
        'click #createTimeStart': 'showDateTimePicker',
        'click #createTimeEnd': 'showDateTimePicker',
        'click #addTimeStart': 'showDateTimePicker',
        'click #addTimeEnd': 'showDateTimePicker',
        'change #recommendTypeSelect': 'changeRecommendType',
        'click .unpayed-checkbox-select-all': 'clickCheckboxAll',
    },

    initDatepicker() {
        this.$el.find('#createTimeStart').datetimepicker(datepickerCfg)
        this.$el.find('#createTimeEnd').datetimepicker(datepickerCfg)
        this.$el.find('#addTimeStart').datetimepicker(datepickerCfg)
        this.$el.find('#addTimeEnd').datetimepicker(datepickerCfg)
    },

    clickCheckboxAll(e) {
        const isCheckAll = e.target.checked
        const unpayedCheckbox = this.$el.find('.unpayed-checkbox')
        const checkedArr = [...unpayedCheckbox]
        checkedArr.forEach(item => {
            item.checked = isCheckAll
        })
    },

    showDateTimePicker(e) {
        $(e.currentTarget).datetimepicker('show')
    },

    deleteUnpayedPosts() {
        const { unpayedList, typeOfRecommend } = this.model.toJSON()
        const checkBoxArr = this.$el.find('.itm-checkbox')
        const delList = []
        const postSubjectArr = []
        let checkedNumber = 0
        checkBoxArr.each(function () {
            if (this.checked == true) {
                checkedNumber++
                delList.push(+this.attributes.contentId.value)
                postSubjectArr.push(this.attributes.postSubject.value)
            }
        })
        const multiDelDialogTitle = typeOfRecommend == 1 ? '取消推荐热帖' : '删除热门内容'
        // 获取用户263账号
        const { userAccount } = common.getUserInfo()
        if (!checkedNumber) {
            alert('请选择要批量删除的列表项')
        } else {
            const params = { delList, type: typeOfRecommend, userAccount }
            this.deleteDialog = new DeleteDialog({
                el: this.$el.find('#multiDelDialog')[0],
                checkedNumber,
                postSubjectArr,
                typeOfRecommend,
                isSingleClick: false,
            })
            const that = this
            const d = new Dialog({
                title: multiDelDialogTitle,
                content: this.deleteDialog.el,
                type: 4,
                ok() {
                    service.deleteNewUnpayedHotMasterPosts(params, $.proxy(function (response) {
                        if (response.rs) {
                            alert('删除成功！')
                            this.closeDialog()
                            this.$el.find('#multiDelDialog').empty()
                            that.getUnpayedListData()
                        } else {
                            alert(response.rsdesp)
                        }
                    }, this))
                },
            })
        }
    },

    patchAdd() {
        const { typeNum, typeOfRecommend } = this.model.toJSON()
        this.patchAdd = new PatchAdd({
            el: this.$el.find('#patchAddDialog')[0],
        })
        const patchAddDialogTitle = typeOfRecommend == 1 ? '批量添加推荐热帖' : '批量添加推荐内容'

        const that = this
        const d = new Dialog({
            title: patchAddDialogTitle,
            content: this.patchAdd.el,
            type: 4,
            ok() {
                const position = that.$el.find('#recommendedPosition option:selected').val()
                const type = +this.$el.find('input:radio:checked').val()
                const { sucList } = that.patchAdd.model.toJSON()
                const params = { sucList, type, position }
                if (typeNum == 2) {
                    service.addNewUnpayedPosts(params, $.proxy(function (response) {
                        if (response.rs) {
                            alert('新增成功！')
                            this.closeDialog()
                            this.$el.find('#patchAddDialog').empty()
                            that.getUnpayedListData()
                        } else {
                            alert(response.rsdesp)
                        }
                    }, this))
                }
            },
        })
    },

    getMiniProgramParams(onlyValue = false) {
        const iptList = [...this.addHotPost.$el.find('.miniProgramIpt')]
        const obj = {}
        iptList.forEach(item => {
            const { id, value, dataset: { txt } } = item
            obj[id] = {
                value,
                label: txt,
            }
        })
        return onlyValue ? Object.keys(obj).map(item => ({ [item]: obj[item].value })).reduce((res, item) => Object.assign(res, item), {}) : obj
    },

    checkMiniProgramIpt() {
        const obj = this.getMiniProgramParams()
        const arr = Object.keys(obj)
        for (let i = 0; i < arr.length; i++) {
            const { value, label } = obj[arr[i]]
            if (!value) {
                alert(`${label}不能为空！`)
                return false
            }
        }

        const uploadPic = this.addHotPost.$el.find('#contentPic').val() || ''
        if (!uploadPic.length) {
            alert('上传图片不能为空！')
            return false
        }
        return true
    },

    addHotPost() {
        const { typeNum, typeOfRecommend } = this.model.toJSON()
        const position = this.$el.find('#recommendedPosition option:selected').val()
        // this.$el.find("#postsPagerContainer").append(`<div id="addHotPostDialog"></div>`);
        this.addHotPost = new AddHotPost({
            // el: this.$el.find('#addHotPostDialog')[0],
            position,
        })
        const that = this
        const d = new Dialog({
            title: '添加内容',
            content: this.addHotPost.el,
            type: 4,
            ok() {
                const arr = []
                const type = this.$el.find('#contentType option:selected').val()
                const contentDetail = this.$el.find('.contentDetail').val()
                arr.push({ inputVal: contentDetail, name: '帖子/问答/活动/小程序' })
                const ischecked = +this.$el.find('#recConfig').prop('checked')
                const skipTitle = this.$el.find('#pageTitle').val()
                const contentPic = this.$el.find('#contentPic').val()
                const suggestedStatus = ischecked
                const beginTime = this.$el.find('#beginTime').val()
                arr.push({ inputVal: beginTime, name: '开始时间' })
                const endTime = this.$el.find('#endTime').val()
                arr.push({ inputVal: endTime, name: '结束时间' })
                const pageNo = +this.$el.find('#pageNo').val()
                arr.push({ inputVal: pageNo, name: '页码' })
                const ranking = +this.$el.find('#ranking').val()
                arr.push({ inputVal: ranking, name: '排位' })
                let params = {}

                // 推荐内容验空
                if (!(+type)) {
                    alert('请选择推荐内容！')
                    return false
                }
                if (+type === 1) {
                    params = {
                        postMasterId: contentDetail, suggestedStatus, type, skipType: 1,
                    }
                    if (ischecked) {
                        params = {
                            postMasterId: contentDetail, beginTime, endTime, pageNumber: pageNo, ranking, suggestedStatus, type, skipType: 1,
                        }
                    }
                } else if (+type === 2) {
                    params = {
                        questionId: contentDetail, suggestedStatus, type, skipType: 1,
                    }
                    if (ischecked) {
                        params = {
                            questionId: contentDetail, beginTime, endTime, pageNumber: pageNo, ranking, suggestedStatus, type, skipType: 1,
                        }
                    }
                } else if (+type == 3) {
                    // 后端要求传的字段(活动（url链接）跳转)
                    const skipType = 3
                    // 页面标题验空
                    if (!skipTitle.length) {
                        alert('页面标题不能为空！')
                        return false
                    }
                    if (skipTitle.length > 20) {
                        alert('页面标题长度过长！')
                        return false
                    }

                    // 广告图验空
                    if (!contentPic.length) {
                        alert('请上传广告图！')
                        return false
                    }
                    params = {
                        skipName: encodeURIComponent(contentDetail), postMasterId: 0, skipType, beginTime, endTime, pageNumber: pageNo, ranking, suggestedStatus, type, skipTitle, contentPic,
                    }
                } else if (+type === 4) {
                    params = {
                        beginTime,
                        endTime,
                        type,
                        skipTitle: contentDetail,
                        ...that.getMiniProgramParams(true),
                        skipType: 5,
                        skipName: 'smallprogram',
                        suggestedStatus,
                        pageNumber: pageNo,
                        ranking,
                        contentPic,
                    }
                }

                Object.assign(params, { position })
                if (typeNum == 2) {
                    if (that.validateAddPostsDialog(type, arr, ischecked, beginTime, endTime, pageNo, ranking)) {
                        // that.validateAddEmpty(arr, ischecked) && that.validateTimeBeforeAfter(beginTime, endTime, 1, '') && that.validateInputNumber(pageNo, ranking, ischecked)
                        service.addNewUnpayed(params, $.proxy(function (response) {
                            if (response.rs) {
                                alert('新增成功！')
                                this.closeDialog()
                                this.$el.find('#addHotPostDialog').empty()
                                that.getUnpayedListData()
                            } else {
                                alert(response.rsdesp)
                            }
                        }, this))
                    }
                }
            },
        })
    },

    validateAddPostsDialog(contextType, arr, ischecked, beginTime, endTime, pageNo, ranking) {
        const validateAddEmptyReturn = this.validateAddEmpty(arr, ischecked)
        let miniProgramIptEmpty = true
        if (+contextType === 4) {
            miniProgramIptEmpty = this.checkMiniProgramIpt()
        }
        const validateTimeBeforeAfterReturn = this.validateTimeBeforeAfter(beginTime, endTime, 1, '')
        const validateInputNumberReturn = this.validateInputNumber(pageNo, ranking, ischecked)
        return validateAddEmptyReturn && miniProgramIptEmpty && validateTimeBeforeAfterReturn && validateInputNumberReturn
    },

    validateInputNumber(pageNumber, ranking, ischecked) {
        if (ischecked) {
            if (pageNumber) {
                if (pageNumber > 5 || pageNumber < 1) {
                    alert('页码需限制在1和5之间！')
                    return false
                }
            }
            if (ranking) {
                if (ranking > 9 || ranking < 1) {
                    alert('位数需限制在1和9之间！')
                    return false
                }
            }
            return true
        }
        return true
    },

    validateAddEmpty(arr, ischecked) {
        const l = ischecked ? arr.length : 1
        for (let i = 0; i < l; i++) {
            if (!(arr[i].inputVal)) {
                alert(`${arr[i].name}不能为空！`)
                return false
            }
        }
        return true
    },
    validateTimeBeforeAfter(beginTime, endTime, flag, text) {
        // @params: flag = 1 *** 添加热帖-推荐设置弹窗时间校验
        // @params: flag = 2 *** 查询form时间校验
        if (flag === 1) {
            const begin = new Date(beginTime).getTime()
            const end = new Date(endTime).getTime()
            if (begin > end) {
                alert('开始时间不能大于结束时间!')
                return false
            }
            return true
        } else if (flag === 2) {
            if (beginTime && endTime) {
                const begin = new Date(beginTime).getTime()
                const end = new Date(endTime).getTime()
                if (begin > end) {
                    alert(`${text}:开始时间不能大于结束时间!`)
                    return false
                }
                return true
            }
            return true
        }
    },

    initTopicNameList() {
        const isPage = 0
        const params = { isPage }
        let { topicNameList } = this.model.toJSON()
        service.getTopicNameList(params, response => {
            if (response.rs) {
                topicNameList = response.resultMessage.resultList
                this.model.set({
                    topicNameList,
                })
            } else {
                alert('获取话题名称下拉列表选项失败，请刷新重试！')
            }
        })
    },

    formatRecContent(str, contentType) {
        const { topicNameList } = this.model.toJSON()
        if (contentType === 2) {
            for (let i = 0; i < topicNameList.length; i++) {
                if (topicNameList[i].topicTitle == str) {
                    return topicNameList[i].topicId
                }
            }
            return ''
        }
        return str
    },

    getRecommendData(options) {
        // options: pageSize,pageNo,typeNum
        let {
            pageSize, pageNo, type, topicIdList = [],
        } = options
        const { userAccount, typeNum, isShowTopicName } = this.model.toJSON()
        const It = this
        if (isShowTopicName) {
            topicIdList = this.getInnerSearchVal()
            if (!topicIdList) {
                topicIdList = 0
            }
        }
        const recommendedPositionVal = +this.$el.find('#recommendedPosition option:selected').val()
        const contentType = +this.$el.find('#vipTabRecContent option:selected').val()
        const skipId = this.formatRecContent(this.$el.find("input[name='recContentInput']").val(), contentType)
        let skipName
        if (contentType == 2) {
            skipName = this.$el.find("input[name='recContentInput']").val()
        }

        const state = +this.$el.find('#showState option:selected').val()
        const tempType = this.$el.find('#recommendedPosition option:selected').val()
        !type && (type = tempType)
        const params = {
            userAccount,
            pageSize,
            pageNo,
            typeNum,
            type,
            topicIdList,
        }
        if (recommendedPositionVal == 1) {
            if (contentType) {
                Object.assign(params, {
                    contentType, skipId, state, skipName,
                })
            } else {
                Object.assign(params, { contentType, state })
            }
        }
        service.getHotPostsRecommendationData(params, response => {
            common.loading()
            if (response.rs) {
                common.removeLoading()
                const resultList = response.resultMessage.resultList || []

                const pageCount = response.resultMessage.pageCount
                this.postsListItm && this.postsListItm.undelegateEvents()
                this.postsListItm = new PostsListItm({
                    el: this.$el.find('#suggestedBody')[0],
                    ...options,
                    typeNum,
                    type,
                    contentType,
                    resultList,
                    isShowTopicName,
                    It,
                    onCallBackQueryRec: this.getRecommendData.bind(this),
                })
                this.model.set({
                    resultList, pageCount, pageSize, pageNo,
                })
            }
        })
    },

    // 屏蔽选项卡-数据(取消推荐)
    getShieldData(options) {
        let {
            pageSize, pageNo, type, topicIdList,
        } = options
        let {
            userAccount, typeNum, isShowTopicName, shieldList,
        } = this.model.toJSON()
        const It = this
        if (isShowTopicName) {
            topicIdList = this.getInnerSearchVal()
            if (!topicIdList) {
                topicIdList = 0
            }
        }
        // 默认传帖子详情页的值
        const contentType = +this.$el.find('#vipTabRecContent option:selected').val() || 1
        const tempType = this.$el.find('#recommendedPosition option:selected').val()
        !type && (type = tempType)
        const params = {
            userAccount,
            pageSize,
            pageNo,
            typeNum,
            type,
            topicIdList,
            contentType,
        }
        service.getHotPostsShieldData(params, response => {
            common.loading()
            if (response.rs) {
                common.removeLoading()
                shieldList = response.resultMessage.resultList
                const pageCount = response.resultMessage.pageCount
                this.postsListItm && this.postsListItm.undelegateEvents()
                this.postsListItm = new PostsListItm({
                    el: this.$el.find('#blockedBody')[0],
                    ...options,
                    shieldList,
                    typeNum,
                    isShowTopicName,
                    It,
                    type,
                    onCallBackQueryShield: this.getShieldData.bind(this),
                })
                this.model.set({
                    shieldList, pageCount, pageSize, pageNo,
                })
            }
        })
    },

    statusParamsFun(arr) {
        let number = 0
        let isPost = true
        const status = []
        for (let i = 0; i < arr.length; i++) {
            if (!arr[i].checked) {
                number++
            } else {
                status.push(+arr[i].value)
            }
        }
        if (number === arr.length) {
            isPost = false
        }
        return { isPost, status }
    },

    getUnpayedListData(options = {}) {
        const PAGE_SIZE = 25
        const PAGE_NO = 1
        const position = this.$el.find('#recommendedPosition option:selected').val()
        const type = +this.$el.find('#recommendTypeSelect option:selected').val() || 1
        const postMasterId = +this.$el.find('#unpayedPostMasterId').val()
        let postSubject = this.$el.find('#postSubject').val()
        const createTimeStart = this.$el.find('#createTimeStart').val()
        const createTimeEnd = this.$el.find('#createTimeEnd').val()
        const addTimeStart = this.$el.find('#addTimeStart').val()
        const addTimeEnd = this.$el.find('#addTimeEnd').val()
        const { isPost, status } = this.statusParamsFun(this.$el.find('#recommendStatus :checkbox'))
        let { pageSize, pageNo } = options
        pageSize = pageSize || PAGE_SIZE
        pageNo = pageNo || PAGE_NO
        const params = {
            pageSize,
            pageNo,
        }

        if (postSubject) {
            postSubject = this.filterChar(postSubject)
            // type=2时，即问答状态下更改postSubject字段为content字段
            type === 2 ? Object.assign(params, { content: postSubject }) : Object.assign(params, { postSubject })
        }

        createTimeStart && Object.assign(params, { createTimeStart })
        createTimeEnd && Object.assign(params, { createTimeEnd })
        addTimeStart && Object.assign(params, { addTimeStart })
        addTimeEnd && Object.assign(params, { addTimeEnd })
        isPost && Object.assign(params, { status })
        // type=2时，即问答状态下更改postMasterId字段为questionId字段
        postMasterId && (type === 2 ? Object.assign(params, { questionId: postMasterId }) : Object.assign(params, { postMasterId }))
        // type字段，帖子||问答
        Object.assign(params, { type, position })

        // 帖子
        if (type === 1) {
            params.addType = +this.$el.find('#addTypeSelect').val()
            params.showScope = +this.$el.find('#showScopeSelect').val()
        }

        if (this.validateTimeBeforeAfter(createTimeStart, createTimeEnd, 2, '发帖') && this.validateTimeBeforeAfter(addTimeStart, addTimeEnd, 2, '添加')) {
            service.getUnpayedList(params, response => {
                if (+response.rs === 1) {
                    const {
                        resultList, countPerPage, pageCount, pageIndex,
                    } = response.resultMessage
                    this.model.set({
                        unpayedList: resultList,
                        pageSize: countPerPage,
                        pageCount,
                        pageNo: pageIndex,
                    })

                    // 初始化全选checkbox
                    this.initSelectAllCheckbox()
                }
            })
        }
    },

    initSelectAllCheckbox() {
        const selectAllCheckbox = this.$el.find('#tableHead .unpayed-checkbox-select-all')[0]
        if (selectAllCheckbox.checked) {
            selectAllCheckbox.checked = false
        }
    },

    // 过滤帖子标题中的'%','&'和"'"
    filterChar(str) {
        const l = str.length
        const arr = str.split('')
        let arr_result = ''
        for (let i = 0; i < l; i++) {
            if (arr[i] != '%' && arr[i] != '&' && arr[i] != "'") {
                arr_result += `${arr[i]}`
            }
        }
        return arr_result
    },

    // 获取innerSearch input中的值
    getInnerSearchVal() {
        const iptObj = this.$el.find("#topicNameSelect input[type='checkbox']:checked")
        const valArr = []
        const params = {}
        for (const item of iptObj) {
            const topicId = item.value
            valArr.push(topicId)
        }
        const topicIdList = valArr.toString()
        return topicIdList
    },

    // "推荐内容类型"切换select
    changeRecommendType() {
        const recTypeVal = +this.$el.find('#recommendTypeSelect option:selected').val()
        // 状态切换时，表单重置
        this.$el.find('#form')[0].reset()
        this.$el.find('.form-inner-search-ipt').removeClass('hide')
        this.$el.find('.label-unRecommend').removeClass('hide')
        const unpayedCheckBox = '<input class="unpayed-checkbox-select-all" type="checkbox">'
        this.$el.find('#unpayedTable #tableHead').empty().append(`
        <th>${unpayedCheckBox}</th>
        <th>ID</th>
        <th>类型</th>
        <th>内容</th>
        <th>发布时间</th>
        <th>添加时间</th>
        <th>推荐状态</th>
        <th>展示规则</th>
        <th>导入来源</th>
        <th>操作</th>`)
        if (recTypeVal === 1) {
            this.$el.find('#recommendStatus').show()
            this.$el.find('.unpayedLabelId').text('帖子ID:')
            this.$el.find('.unpayedLabelSubject').text('帖子标题:')
            this.$el.find('.unpayedLabelStartTime').text('发帖时间:')
            this.$el.find('#unpayedTable th:eq(3)').text('内容').css('max-width', '300px')
            this.$el.find('#unpayedTable th:eq(4)').text('发布时间')
            $('<th>开始展示时间</th><th>结束展示时间</th><th>展示页码</th><th>展示位置</th>').insertAfter(this.$el.find('#unpayedTable th:eq(5)'))
            this.$el.find('#recommendTypeSelect').val('1')
        } else if (recTypeVal === 2) {
            this.$el.find('#recommendStatus').hide()
            this.$el.find('.unpayedLabelId').text('问题ID:')
            this.$el.find('.unpayedLabelSubject').text('问题内容:')
            this.$el.find('.unpayedLabelStartTime').text('提问时间:')
            // this.$el.find('#unpayedTable th:eq(3)').text('问题')
            // this.$el.find('#unpayedTable th:eq(4)').text('提问时间')
            this.$el.find('#unpayedTable #tableHead').empty().append(`
            <th>${unpayedCheckBox}</th>
            <th>ID</th>
            <th>类型</th>
            <th>问题</th>
            <th>提问时间</th>
            <th>添加时间</th>
            <th>推荐状态</th>
            <th>操作</th>`)
            this.$el.find('#recommendTypeSelect').val('2')
        } else if (recTypeVal === 3 || recTypeVal === 4) {
            this.$el.find('#recommendStatus').show()
            this.$el.find('.form-inner-search-ipt').addClass('hide')
            this.$el.find('.label-unRecommend').addClass('hide')
            this.$el.find('#recommendTypeSelect').val(`${recTypeVal}`)

            // this.$el.find('#unpayedTable th:gt(0):lt(6)');
            this.$el.find('#unpayedTable #tableHead').empty().append(`
            <th>${unpayedCheckBox}</th>
            <th>广告图</th>
            <th>推荐内容</th>
            <th>开始时间</th>
            <th>结束时间</th>
            <th>页码</th>
            <th>排位</th>
            <th>状态</th>
            <th>操作</th>`)
        }
        this.model.set({
            typeOfRecommend: recTypeVal,
        })
        // 类型切换完成自动调查询API
        this.getUnpayedListData()
    },

    toggleUnpayedRecOptionClass(flag, num) {
        const optionList = [...this.$el.find('#recommendTypeSelect option')]
        optionList.forEach(item => {
            const { value } = item
            if (+value !== +num) {
                if (flag) {
                    this.$el.find(`#recommendTypeSelect option[value='${value}']`).addClass('hide')
                } else {
                    this.$el.find(`#recommendTypeSelect option[value='${value}']`).removeClass('hide')
                }
            }
        })
    },

    changeRecomPosition() {
        let {
            addRecommendationHead, addShieldHead, isShowTopicName, typeNum, pageSize, pageNo,
        } = this.model.toJSON()
        const recommendedPositionVal = this.$el.find('#recommendedPosition').find('option:checked').val()
        this.recommendFollow && this.recommendFollow.undelegateEvents() && this.recommendFollow.remove()
        this.$el.find('.content-wrap').removeClass('hide')
        if (+recommendedPositionVal === 1) {
            // isShowTopicName = true;
            // this.model.set({
            //   isShowTopicName
            // });


            // to do
            // 话题详情页-取消新需求前端权限（广告图， 推荐内容 ，用户归属）
            this.$el.find('#suggestedTable th:lt(2)').removeClass('hide')
            this.$el.find('#suggestedTable th:eq(2)').text('用户归属')

            this.model.set({ isShowTopicName: false })
            if (!typeNum) {
                addRecommendationHead = '新增首页热门推荐'
                this.$el.find('#innerSearch').removeClass('hide')
                this.getRecommendData({ pageSize, pageNo })
            } else if (+typeNum === 1) {
                addShieldHead = '新增首页取消推荐'
                this.$el.find('#innerSearch').removeClass('hide')
                this.getShieldData({ pageSize, pageNo })
            }

            if (+typeNum === 2) {
                this.$el.find('#innerSearch').removeClass('hide')
                this.toggleUnpayedRecOptionClass(false, 2)
                this.$el.find('#recommendTypeSelect').val('1')
                this.changeRecommendType()
            }
        } else if (+recommendedPositionVal === 2) {
            // to do
            // 话题详情页-取消新需求前端权限（广告图， 推荐内容 ，用户归属）
            this.$el.find('#suggestedTable th:lt(2)').addClass('hide')
            this.$el.find('#suggestedTable th:eq(2)').text('帖子ID')

            this.model.set({ isShowTopicName: true })
            if (+typeNum === 0) {
                addRecommendationHead = '新增话题热帖推荐'
                this.$el.find('#innerSearch').removeClass('hide')
                this.getRecommendData({ pageSize, pageNo })
            } else if (+typeNum === 1) {
                addShieldHead = '新增话题页取消推荐'
                this.getShieldData({ pageSize, pageNo })
            }
        } else if (+recommendedPositionVal === 3) {
            if (+typeNum === 0) {
                addRecommendationHead = '新增问答列表页热门推荐'
                this.$el.find('#innerSearch').addClass('hide')
                this.$el.find('#suggestedTable th:lt(2)').addClass('hide')
                this.$el.find('#suggestedTable th:eq(2)').text('问题ID')
                this.getRecommendData({ pageSize, pageNo })
            }

            if (+typeNum === 2) {
                this.toggleUnpayedRecOptionClass(true, 2)
                this.$el.find('#recommendTypeSelect').val('2')
                this.changeRecommendType()
            }
        } else if (+recommendedPositionVal === 4) {
            this.recommendFollow = new RecommendFollow({
                el: this.createNewMenuPageWrap(),
            })
        }
        this.model.set({
            addRecommendationHead,
            addShieldHead,
        })
        if (typeNum !== 2) {
            this.renderInnerSearch()
        } else {
            this.$el.find('#innerSearch .recOrShieldInnerSearch').empty()
        }
    },

    createNewMenuPageWrap() {
        const newWrapper = $('<div></div>')
        this.$el.find('.content-wrap').addClass('hide').after(newWrapper)
        return newWrapper
    },

    renderInnerSearch() {
        const { typeNum, pageSize, pageNo } = this.model.toJSON()
        const It = this
        const recommendedPositionVal = this.$el.find('#recommendedPosition option:selected').val()
        const isShowTopicName = +recommendedPositionVal === 2
        const isVipTab = +typeNum === 0
        this.innerSearch && this.innerSearch.undelegateEvents()
        this.innerSearch = new InnerSearch({
            el: this.$el.find('#innerSearch .recOrShieldInnerSearch')[0],
            It,
            isShowTopicName,
            isVipTab,
            typeNum,
            type: recommendedPositionVal,
            recommendedPositionVal,
            pageSize,
            pageNo,
            onQueryRecommendData: this.getRecommendData.bind(this),
            onQueryShieldData: this.getShieldData.bind(this),
        })
    },

    // 新增-推荐
    addPostsPic(e) {
        const type = this.$el.find('#recommendedPosition option:selected').val()
        const {
            addRecommendationHead, isShowTopicName, pageSize, typeNum, userAccount, pageNo,
        } = this.model.toJSON()
        const pageIndex = pageNo
        const that = this
        this.AddRec = new AddRec({
            isShowTopicName,
            type,
        })
        const d = new Dialog({
            title: addRecommendationHead,
            content: this.AddRec.el,
            type: 4,
            ok() {
                const beginTime = this.$el.find('#beginTime').val()
                const endTime = this.$el.find('#endTime').val()
                const pageNo = this.$el.find('#pageNoDialog').val()
                const ranking = this.$el.find('#ranking').val()
                // //素材跳转页面类型
                // const skipType = this.$el.find("#skipType").val();
                // 推荐内容
                const contentType = +this.$el.find('#skipTo option:selected').val()
                const params = {
                    beginTime, endTime, pageNo, ranking, contentType,
                }
                // 推荐内容 input框-验空
                const skipToInput = this.$el.find(".content-detail input[name='contentDetail']").val()
                // 页面标题
                const skipTitle = this.$el.find('#pageTitle').val()
                if (contentType && !skipToInput) {
                    alert('帖子/话题/个人主页/活动/问答/小程序不能为空！')
                    return false
                }

                // 小程序相关字段验空
                if (+contentType === 7) {
                    const appid = this.$el.find('#appid').val()
                    const originalId = this.$el.find('#originalId').val()
                    const pagePath = this.$el.find('#pagePath').val()

                    if (!appid) {
                        alert('APPID不能为空！')
                        return false
                    }
                    if (!originalId) {
                        alert('原始ID不能为空！')
                        return false
                    }

                    if (!pagePath) {
                        alert('跳转页面不能为空！')
                        return false
                    }
                    Object.assign(params, {
                        skipTitle: skipToInput,
                        appid,
                        originalId,
                        pagePath,
                        skipId: 0,
                        skipType: 5,
                    })
                }

                // 帖子Id，用户userId || 话题名称
                let skipId,
                    skipName
                if (contentType === 1 || contentType === 3 || contentType === 5) {
                    skipId = +this.$el.find('.contentDetail').val()
                    if (`${skipId}`.length > 9) {
                        alert('帖子Id或用户userId位数需限制在10位以内!')
                        return false
                    }
                    Object.assign(params, { skipId })
                } else if (contentType === 2 || contentType === 4) {
                    skipName = this.$el.find('.contentDetail').val()
                    Object.assign(params, { skipName, skipId: 0 })
                    if (contentType === 4) {
                        Object.assign(params, { skipName: encodeURIComponent(skipName) })
                    }
                }

                // 页面标题验空 || 长度 <= 20校验
                if (contentType === 4) {
                    if (!skipTitle.length) {
                        alert('页面标题不能为空！')
                        return false
                    }
                    if (skipTitle.length > 20) {
                        alert('页面标题长度过长！')
                        return false
                    }
                }

                const iptObj = this.$el.find('#dialogTopicName').find("input[type='checkbox']:checked")
                const valArr = []
                for (const item of iptObj) {
                    const topicId = item.value
                    valArr.push(topicId)
                }
                let topicIdList = valArr.toString()

                // 话题名称-验空
                if (isShowTopicName && contentType === 1) {
                    const dialogTopicName = this.$el.find("#dialogTopicName input[name='selectedItemsText']").val()
                    if (!dialogTopicName) {
                        alert('话题名称不能为空！')
                        return false
                    }
                }

                // 广告图
                const contentPic = this.$el.find('#contentPic').val()

                // 活动页面广告图验空
                if (contentType === 4 || +contentType === 7) {
                    if (!contentPic.length) {
                        alert('请上传广告图！')
                        return false
                    }
                }

                // 页码和排位不能小于0；
                // let {pageNo, ranking} = params;
                if (pageNo < 1) {
                    alert('页码必须大于0')
                    return
                }
                if (ranking < 1) {
                    alert('排位必须大于0')
                    return
                }

                // 推荐至话题
                const recToTopicList = this.$el.find("#dialogRecTopicName input[name='selectedItemsText']").val()
                const recToTopicListValue = this.$el.find("#dialogRecTopicName input[name='selectedItemsValue']").val()
                if (recToTopicListValue) {
                    if (isShowTopicName) {
                        topicIdList += ','
                    }
                    topicIdList += recToTopicListValue
                }
                // 学院
                const collegeList = this.$el.find("#collegeWrapper input[name='selectedItemsText']").val()
                // 家族
                const familyList = this.$el.find("#familyWrapper input[name='selectedItemsText']").val()
                // //推荐至话题-验空
                // if(!recToTopicList) {
                //     alert("推荐至话题不能为空！");
                //     return false;
                // }

                // 校验帖子位置第一页第三位
                if (type == '1' && !isShowTopicName && pageNo == 1 && ranking == 3) {
                    alert('推荐位置第一页第三位为优惠券固定排位，请换一个推荐位置哟~')
                    return false
                }

                // 用户归属-验空
                if (type == '1' && contentType !== 5 && !collegeList) {
                    alert('归属学院不能为空！')
                    return false
                }
                if (type == '1' && contentType !== 5 && !familyList) {
                    alert('归属家族不能为空！')
                    return false
                }
                // @params: skipType {Number}
                // 1: App页面, 3: 活动页面
                // family 入参
                const family = that.formatFamilyList(collegeList, familyList)
                Object.assign(params, {
                    topicIdList, pageSize, isShowTopicName, type, family, skipType: 1,
                })
                contentType !== 5 && Object.assign(params, { contentPic })
                contentType === 4 && Object.assign(params, { skipTitle, skipType: 3 })
                // 校验结束时间是否小于开始时间
                if (that.validateTime(beginTime, endTime)) {
                    service.addPostsPic(params, $.proxy(function (response) {
                        if (response.rs) {
                            // 新增成功
                            alert('新增成功！')
                            this.closeDialog()
                            this.$el.find('#addRec').empty()
                            that.getRecommendData({ pageSize, pageNo: 1 })
                        } else {
                            alert(response.rsdesp)
                        }
                    }, this))
                }
            },
        })
    },

    formatFamilyList(collegeList, familyList) {
        let family
        if (collegeList == '全部') {
            if (familyList == '全部') {
                family = { ALL: 'ALL' }
            }
        } else {
            // 只选一个学院
            family = {}
            if (collegeList.indexOf(',') === -1) {
                if (familyList == '全部') {
                    family[collegeList] = ['ALL']
                } else {
                    const collegeArr = collegeList
                    const familyArr = familyList.split(',')
                    const checkedFamilyArr = []
                    for (let i = 0; i < familyArr.length; i++) {
                        if (familyArr[i].split('-')[1] == collegeArr) {
                            checkedFamilyArr.push(familyArr[i].split('-')[0])
                        }
                    }
                    family[collegeList] = checkedFamilyArr
                }
            } else {
                // 选择多个学院
                if (familyList == '全部') {
                    const collegeArr = collegeList.split(',')
                    for (let i = 0; i < collegeArr.length; i++) {
                        family[collegeArr[i]] = ['ALL']
                    }
                } else {
                    const familyArr = familyList.split(',')
                    const collegeArr = collegeList.split(',')
                    let checkedFamilyArr = []
                    for (let i = 0; i < collegeArr.length; i++) {
                        for (let j = 0; j < familyArr.length; j++) {
                            if (familyArr[j].split('-')[1] == collegeArr[i]) {
                                checkedFamilyArr.push(familyArr[j].split('-')[0])
                            }
                        }
                        family[collegeArr[i]] = checkedFamilyArr
                        checkedFamilyArr = []
                    }
                }
            }
        }

        return family
    },

    validateTime(beginTime, endTime) {
        if (!beginTime) {
            alert('开始时间不能为空！')
            return false
        }
        if (!endTime) {
            alert('结束时间不能为空！')
            return false
        }
        const bT = new Date(beginTime).getTime()
        const eT = new Date(endTime).getTime()
        if (bT > eT) {
            alert('开始时间不能大于结束时间！')
            return false
        }
        return true
    },

    // 新增取消推荐
    addShield(e) {
        const type = this.$el.find('#recommendedPosition option:selected').val()
        const {
            isShowTopicName, addShieldHead, pageSize, pageNo, typeNum,
        } = this.model.toJSON()
        this.AddShield = new AddShield({
            el: this.$el.find('#addShieldDialog')[0],
            isShowTopicName,
        })
        const that = this
        const d = new Dialog({
            title: addShieldHead,
            content: this.AddShield.el,
            type: 4,
            ok() {
                // var params = common.getFormData({formId: 'form'});
                const postMasterId = this.$el.find('#postMasterId').val()
                const params = { postMasterId }
                const iptObj = this.$el.find('#shieldDialogTopicName').find("input[type='checkbox']:checked")
                const contentType = +this.$el.find("input[name='contextType']:checked").val()
                const valArr = []
                for (const item of iptObj) {
                    const topicId = item.value
                    valArr.push(topicId)
                }
                const topicIdList = valArr.toString()
                Object.assign(params, { pageSize }, { pageNo }, { topicIdList }, { isShowTopicName }, { type }, { contentType })
                if (type == 2) {
                    Object.assign(params, { contentType: 1 })
                }
                if (validate.addShield(params) && validate.isTopicNameNotEmpty(params)) {
                    service.addShield(params, $.proxy(function (response) {
                        if (response.rs) {
                            // 新增成功
                            alert('新增成功！')
                            this.closeDialog()
                            this.$el.find('#addShieldDialog').empty()
                            that.getShieldData(params)
                        } else {
                            alert(response.rsdesp)
                        }
                    }, this))
                }
            },
        })
    },

    bindDialogEvents() {
        const that = this
        // 时间选择框
        $('#beginTime').datetimepicker({
            format: 'yyyy-mm-dd hh:00:00',
            autoclose: true,
            todayBtn: true,
            minView: 'day',
        })

        $('#endTime').datetimepicker({
            format: 'yyyy-mm-dd hh:00:00',
            autoclose: true,
            todayBtn: true,
            minView: 'day',
        })

        $('#beginTime').on('click', () => {
            $('#beginTime').datetimepicker('show')
        })
        $('#endTime').on('click', () => {
            $('#endTime').datetimepicker('show')
        })

        $('#pageNoDialog').on('keydown', e => {
            // Allow: backspace, delete, tab, escape, enter and (can't input . 190)
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                // Allow: Ctrl+A
                (e.keyCode == 65 && e.ctrlKey === true) ||
                // Allow: Ctrl+C
                (e.keyCode == 67 && e.ctrlKey === true) ||
                // Allow: Ctrl+X
                (e.keyCode == 88 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return
            }
            const pageNoKeyCodeList = [49, 50, 51, 52, 53, 97, 98, 99, 100, 101]
            const len = $('#pageNoDialog').val().length
            if ($.inArray(e.keyCode, pageNoKeyCodeList) == -1 || len) {
                e.preventDefault()
            }
        })

        $('#ranking').on('keydown', e => {
            // Allow: backspace, delete, tab, escape, enter and (can't input . 190)
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                // Allow: Ctrl+A
                (e.keyCode == 65 && e.ctrlKey === true) ||
                // Allow: Ctrl+C
                (e.keyCode == 67 && e.ctrlKey === true) ||
                // Allow: Ctrl+X
                (e.keyCode == 88 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return
            }

            const rankingKeyCodeList = [49, 50, 51, 52, 53, 54, 55, 56, 57,
                97, 98, 99, 100, 101, 102, 103, 104, 105]
            const len = $('#ranking').val().length
            if ($.inArray(e.keyCode, rankingKeyCodeList) == -1 || len) {
                e.preventDefault()
            }
        })
    },

    // 首页热帖-推荐-状态-展示
    format(data) {
        const { resultList = [], shieldList = [], typeNum } = this.model.toJSON()
        const targetResultList = Array.prototype.concat.call([], resultList)
        if (typeNum == 0) {
            // 格式化推荐列表数据
            targetResultList.forEach((item, index) => {
                const state = Object.assign({}, item.state)
                switch (state) {
                case 0:
                    item.stateText = '展示中'
                    break
                case 1:
                    item.stateText = '待展示'
                    break
                case 2:
                    item.stateText = '展示结束'
                    break
                default:
                    break
                }
                item.index = index
            })
            return { targetResultList }
        } else if (typeNum == 1) {
            // 格式化屏蔽列表数据
            const targetShieldList = Array.prototype.concat.call([], shieldList)
            targetShieldList.forEach((item, index) => {
                const isBlocked = Object.assign({}, item.isBlocked)
                switch (isBlocked) {
                case 0:
                    item.isBlockedText = '屏蔽'
                    break
                case 1:
                    item.isBlockedText = '取消屏蔽'
                default:
                    break
                }
                item.index = index
            })
            return { targetShieldList }
        }
    },

    renderUnpayedInnersearch(typeNum) {
        if (typeNum == 0 || typeNum == 1) {
            this.$el.find('#innerSearch .unpayed-innerSearch').addClass('hide')
        } else if (typeNum == 2) {
            this.$el.find('#innerSearch .unpayed-innerSearch').removeClass('hide')
        }
    },

    renderUnpayedItems() {
        // @params: typeOfRecommend .. 推荐内容类型
        const {
            unpayedList = [], pageSize, pageCount, pageNo, typeOfRecommend,
        } = this.model.toJSON()
        this.model.set({
            pageSize,
            pageNo,
            pageCount,
        })
        const It = this
        this.unPayedItems && this.unPayedItems.undelegateEvents()
        this.unPayedItems = new UnPayedItems({
            el: this.$el.find('#unpayedBody'),
            onSuccessCallBack: this.getUnpayedListData.bind(this),
            unpayedList,
            pageSize,
            pageNo,
            typeOfRecommend,
            It,
        })
    },

    switchTab(event) {
        const currentTarget = $(event.target)
        var typeNum = currentTarget.index()
        this.$el.find('#postsTabSwitch').data('typeNum', typeNum)
        this.model.set({ typeNum })

        // 每次切换tab将默认页数置为默认值
        const pageSize = PAGE_SIZE
        const pageNo = 1
        var { typeNum, pageCount, isShowTopicName } = this.model.toJSON()
        const params = {
            pageSize,
            pageNo,
            typeNum,
        }
        currentTarget.addClass('active').siblings('li').removeClass('active')

        const addBtnArr = this.$el.find('.add-new-btn')
        const tabBoxArr = this.$el.find('.table-box')
        if (typeNum == 0) {
            // this.$el.find('.home-search').removeClass('visibility-none');
            this.$el.find('#recommendedPosition').empty()
            this.$el.find('#recommendedPosition').append('<option value="1">首页</option><option value="2">话题详情页</option><option value="3">问答列表页</option><option value="4">社区关注页</option>')
            this.$el.find('#operatePanel').addClass('hide')
            this.selsetorArr(addBtnArr, typeNum, 1)
            this.selsetorArr(tabBoxArr, typeNum, 2)
        } else if (typeNum == 1) {
            // this.$el.find('.home-search').removeClass('visibility-none');
            this.$el.find('#recommendedPosition').empty()
            this.$el.find('#recommendedPosition').append('<option value="1">首页</option><option value="2">话题详情页</option>')
            this.$el.find('#operatePanel').addClass('hide')
            this.selsetorArr(addBtnArr, typeNum, 1)
            this.selsetorArr(tabBoxArr, typeNum, 2)
        } else if (typeNum == 2) {
            // this.$el.find('.home-search').addClass('visibility-none');
            this.$el.find('#recommendedPosition').empty()
            this.$el.find('#recommendedPosition').append('<option value="1">首页</option><option value="3">问答列表页</option><option value="4">社区关注页</option>')
            this.$el.find('#operatePanel').removeClass('hide')
            this.selsetorArr(addBtnArr, typeNum, 1)
            this.selsetorArr(tabBoxArr, typeNum, 2)
        }

        this.renderUnpayedInnersearch(typeNum)

        if (typeNum == 0) {
            this.getRecommendData(params)
        } else if (typeNum == 1) {
            this.getShieldData(params)
        } else if (typeNum == 2) {
            this.getUnpayedListData(params)
        }

        // 新增话题页屏蔽
        this.changeRecomPosition()
        // 手动触发Pager重新渲染
        this.renderPager()
    },

    selsetorArr(arr, typeNum, flag) {
        // @flag==1**btnArr
        // @flag==2**tabBoxArr
        for (let i = 0; i < arr.length; i++) {
            $(arr[i]).css('display', 'none')
        }
        if (flag == 1) {
            if (+typeNum != 2) {
                $(arr[+typeNum]).css('display', 'block')
            } else {
                $(arr[2]).css('display', 'block')
                $(arr[3]).css('display', 'block')
            }
        } else if (flag == 2) {
            $(arr[+typeNum]).css('display', 'block')
        }
    },


    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
        this.initDatepicker()
        return this
    },
})

export { HotPosts }
