import { service } from '../../../common/service'
import { common } from '../../../common/common'
import { Dialog } from '../../../components/dialog/index'
import { DialogConfirm } from '../../../components/dialogConfirm/index'
import { validate } from '../../../common/validate'
import { envCfg } from '../../../common/envCfg'
import { Update } from '../dialogTpl/update/update'
import { CancelRecDialog } from '../dialogTpl/cancelRecDialog/index'

require('datepicker/js/bootstrap-datetimepicker')

const tpl = require('./tpl.html')
const shieldTpl = require('./tplShield.html')
const checkTpl = require('../dialogTpl/check.html')
// var updateTpl = require('../dialogTpl/update.html');

const shield = require('../dialogTpl/shield.html')
const unShield = require('../dialogTpl/unShield.html')


const Model = Backbone.Model.extend({
    defaults: {

    },
})

const PostsListItm = Backbone.View.extend({
    tagName: 'tbody',

    initialize(options) {
    // options pageSize, pageNo, typeNum
        const {
            pageSize, pageNo, typeNum, resultList = [], shieldList = [], topicIdList, isShowTopicName, It, type, contentType,
        } = options
        this.options = options
        this.model = new Model()
        this.listenTo(this.model, 'change', this.render)
        this.model.set({
            pageSize, pageNo, typeNum, resultList, shieldList, topicIdList, isShowTopicName, It, type, contentType,
        })
    },

    events: {
        'click .checklog': 'checklog', // 查看-推荐
        'click .checklogShield': 'checklog', // 查看-屏蔽（取消推荐）
        'click .updateHotPosts': 'updateHotPosts', // 更新
        'click .shieldHotPosts': 'shieldHotPosts', // 屏蔽||取消屏蔽（取消推荐||恢复推荐）
        'click .offline': 'offline', // 下线
    },

    offline(e) {
        const index = $(e.currentTarget).attr('index')
        const { resultList, pageSize, pageNo } = this.model.toJSON()
        const { id, contentType } = resultList[index]
        const params = {
            id,
            contentType,
        }
        const that = this
        if (confirm('确定下线此推荐广告位吗？')) {
            service.adminUpdateSuggestState(params, response => {
                if (response.rs) {
                    alert('下线成功！')
                    that.options.onCallBackQueryRec({ pageSize, pageNo })
                } else {
                    alert(response.rsdesp)
                }
            })
        }
    },

    checklog(e) {
    // 推荐-查看-传operationType:0
    // 屏蔽-查看-传operationType:1
        const index = $(e.currentTarget).attr('index')
        const { resultList, shieldList, typeNum } = this.model.toJSON()
        const params = {
            account: common.getUserInfo().userAccount,
            operationType: typeNum - '',
        }
        if (typeNum == 0) {
            var item = resultList[index]
            var {
                rank, skipId, contentType, id,
            } = item
            Object.assign(params, { postMasterId: skipId, rank, contentType })
            if (contentType == 4 || +contentType === 7) {
                Object.assign(params, { postMasterId: id })
            }
        } else if (typeNum == 1) {
            var item = shieldList[index]
            var { postMasterId, rank, contentType } = item
            Object.assign(params, { postMasterId, rank, contentType })
        }

        const callback = response => {
            if (response.rs) {
                let resultList
                if (typeNum == '0') {
                    resultList = response.resultMessage
                    resultList.forEach(item => {
                        switch (item.operationDesc) {
                        case 'insert':
                            item.operationDesc = '创建'
                            break
                        case 'update':
                            item.operationDesc = '更新'
                            break
                        case 'offline':
                            item.operationDesc = '下线'
                            break
                        default:
                            break
                        }
                        // item.operationDesc = item.operationDesc === 'insert' ? '创建' : '更新';
                    })
                } else if (typeNum == '1') {
                    resultList = response.resultMessage
                    resultList.forEach(item => {
                        item.operationDesc = item.operationDesc === 'insert' ? '创建' : '更新'
                    })
                }
                if (resultList.length) {
                    resultList.forEach((item, index) => {
                        item.order = index + 1
                    })
                    new Dialog({
                        title: '操作日志',
                        type: 2,
                        content: checkTpl({ resultList }),
                    })
                } else {
                    alert('暂无操作日志')
                }
            }
        }

        if (typeNum == '0') {
            service.viewCheckLog(params, callback)
        } else if (typeNum == '1') {
            service.viewCheckLog(params, callback)
        }
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

    updateHotPosts(e) {
        const {
            resultList, isShowTopicName, It, type, topicIdList,
        } = this.model.toJSON()
        const index = $(e.currentTarget).attr('index')
        const itemModel = resultList[index]
        // let addUpdateDialogHead = "更新首页热门推荐";
        // if(isShowTopicName) {
        //   addUpdateDialogHead = "更新话题热帖推荐";
        // }
        let addUpdateDialogHead
        switch (+type) {
        case 1:
            addUpdateDialogHead = '更新首页热门推荐'
            break
        case 2:
            addUpdateDialogHead = '更新话题热帖推荐'
            break
        case 3:
            addUpdateDialogHead = '更新回答列表页热门推荐'
            break
        default:
            break
        }
        const that = this

        this.addRecUpdate = new Update({
            el: It.$el.find('#addUpdate')[0],
            itemModel,
            isShowTopicName,
            type,
        })

        const d = new Dialog({
            title: addUpdateDialogHead,
            content: this.addRecUpdate.el,
            type: 4,
            ok() {
                const beginTime = this.$el.find('#beginTime').val()
                const endTime = this.$el.find('#endTime').val()
                const pageNo = this.$el.find('#pageNoDialog').val()
                const ranking = this.$el.find('#ranking').val()
                const params = {
                    beginTime, endTime, pageNo, ranking,
                }
                const iptObj = this.$el.find("#updateRecTopicName input[type='checkbox']:checked")
                const valArr = []
                for (const item of iptObj) {
                    const topicId = item.value
                    valArr.push(topicId)
                }
                let topicIdList = valArr.toString()
                // 素材跳转页面类型
                const skipType = this.$el.find('#skipType').val()
                // 推荐内容 input框-验空
                const contentType = +this.$el.find('#skipTo option:selected').val()
                const skipToInput = this.$el.find(".content-detail input[name='contentDetail']").val()
                if (contentType && !skipToInput) {
                    alert('帖子/话题/个人主页/活动/问答不能为空！')
                    return false
                }
                let skipId,
                    skipName
                // 帖子Id，用户userId, 问题ID || 话题名称
                if (contentType === 1 || contentType === 3 || contentType === 5) {
                    skipId = +this.$el.find(".content-detail input[name='contentDetail']").val()
                    Object.assign(params, { skipId })
                } else if (contentType === 2 || contentType === 4) {
                    skipName = this.$el.find(".content-detail input[name='contentDetail']").val()
                    Object.assign(params, { skipName, skipId: 0 })
                    if (contentType === 4) {
                        Object.assign(params, { skipName: encodeURIComponent(skipName) })
                    }
                }

                // 页面标题
                const skipTitle = this.$el.find('#pageTitle').val()

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

                // 话题名称-验空
                if (isShowTopicName && contentType === 1) {
                    const updateRecTopicName = this.$el.find("#updateRecTopicName input[name='selectedItemsText']").val()
                    if (!updateRecTopicName) {
                        alert('话题名称不能为空！')
                        return false
                    }
                }
                // 广告图
                const contentPic = this.$el.find('#contentPic').val()

                // 活动页面广告图验空
                if (contentType === 4) {
                    if (!contentPic.length) {
                        alert('请上传广告图！')
                        return false
                    }
                }

                // 页码和排位不能小于0；
                if (pageNo < 1) {
                    alert('页码必须大于0')
                    return
                }
                if (ranking < 1) {
                    alert('排位必须大于0')
                    return
                }
                // 校验帖子位置第一页第三位
                if (type == '1' && contentType !== 5 && !isShowTopicName && pageNo == 1 && ranking == 3) {
                    alert('推荐位置第一页第三位为优惠券固定排位，请换一个推荐位置哟~')
                    return false
                }
                // //推荐至话题-验空
                // const dialogRecTopicName = this.$el.find("#dialogRecTopicName input[name='selectedItemsText']").val();
                // if(!dialogRecTopicName) {
                //     alert("推荐至话题不能为空！");
                //     return false;
                // }
                // 推荐至话题 -- 入参
                const recToTopicList = this.$el.find("#dialogRecTopicName input[name='selectedItemsText']").val()
                const recToTopicListValue = this.$el.find("#dialogRecTopicName input[name='selectedItemsValue']").val()
                const topicIdListVal = this.$el.find("#updateRecTopicName input[name='selectedItemsValue']").val()
                if (topicIdListVal) {
                    if (isShowTopicName) {
                        topicIdList = topicIdListVal
                    }
                }
                // 用户归属-学院 || 家族 验空
                const collegeList = this.$el.find("#collegeWrapper input[name='selectedItemsText']").val()
                const familyList = this.$el.find("#familyWrapper input[name='selectedItemsText']").val()
                // to do 取消话题详情页校验
                if (type == 1 && contentType !== 5 && !collegeList) {
                    alert('归属学院不能为空！')
                    return false
                }
                // to do 取消话题详情页校验
                if (type == 1 && contentType !== 5 && !familyList) {
                    alert('归属家族不能为空！')
                    return false
                }
                const family = that.formatFamilyList(collegeList, familyList)
                Object.assign(params, {
                    topicIdList, isShowTopicName, type, family, skipType, contentType, contentPic,
                })
                skipTitle && Object.assign(params, { skipTitle })
                // 传id
                params.id = itemModel.id
                // 校验结束时间是否小于开始时间
                if (validate.addPostsPic(params) && validate.isEndBiggerThanStart(params)) {
                    service.updateHotPosts(params, $.proxy(function (response) {
                        if (response.rs) {
                            alert('更新成功!')
                            // 刷新推荐贴列表
                            const {
                                pageSize, pageNo, typeNum, userAccount,
                            } = that.model.toJSON()

                            if (typeof that.options.onCallBackQueryRec === 'function') {
                                that.options.onCallBackQueryRec({ pageSize, pageNo })
                            }
                            this.closeDialog()
                            that.$el.find('#addUpdate').empty()
                        } else {
                            alert(response.rsdesp)
                        }
                    }, this))
                }
            },
        })
        that.bindDialogEvents()
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

    shieldHotPosts(e) {
    // 传id，1-isBlocked，
        const { shieldList, typeNum, type } = this.model.toJSON()
        const index = $(e.currentTarget).attr('index')
        const itemModel = shieldList[index]
        const { topicIdList, contentType, shieldOperate } = itemModel
        const that = this
        const text = contentType == 1 ? '帖子' : '回答'
        const action = shieldOperate == '恢复推荐' ? '恢复推荐' : '取消推荐'
        this.cancelRecDialog = new CancelRecDialog({ text, action })
        if (itemModel.shieldOperate == '恢复推荐') {
            const d = new DialogConfirm({
                content: this.cancelRecDialog.el,
                type: 4,
                ok() {
                    const params = common.getFormData({ formId: 'form' })
                    params.id = itemModel.id
                    const isBlocked = itemModel.isBlocked
                    params.postMasterId = itemModel.postMasterId
                    params.isBlocked = isBlocked
                    params.deleteFlag = 1 - isBlocked
                    Object.assign(params, { type }, { topicIdList }, { contentType })

                    // 校验结束时间是否小于开始时间
                    service.shieldHotPosts(params, $.proxy(function (response) {
                        if (response.rs) {
                            alert('成功恢复推荐!')
                            const {
                                pageSize, pageNo, typeNum, userAccount,
                            } = that.model.toJSON()
                            if (typeof that.options.onCallBackQueryShield === 'function') {
                                that.options.onCallBackQueryShield({ pageSize, pageNo })
                            }
                            this.closeDialog()
                        } else {
                            alert(response.rsdesp)
                        }
                    }, this))
                },
            })
        } else {
            const d = new DialogConfirm({
                content: this.cancelRecDialog.el,
                type: 4,
                ok() {
                    const params = common.getFormData({ formId: 'form' })
                    params.id = itemModel.id
                    const isBlocked = itemModel.isBlocked
                    params.postMasterId = itemModel.postMasterId
                    params.isBlocked = isBlocked
                    params.deleteFlag = 1 - isBlocked
                    Object.assign(params, { type }, { topicIdList }, { contentType })
                    // 校验结束时间是否小于开始时间
                    service.shieldHotPosts(params, $.proxy(function (response) {
                        if (response.rs) {
                            alert('取消推荐成功!')
                            // that.getHotPostsRecommendationData.call(that);
                            // 刷新屏蔽列表
                            const {
                                pageSize, pageNo, typeNum, userAccount,
                            } = that.model.toJSON()
                            if (typeof that.options.onCallBackQueryShield === 'function') {
                                that.options.onCallBackQueryShield({ pageSize, pageNo })
                            }
                            this.closeDialog()
                        } else {
                            alert(response.rsdesp)
                        }
                    }, this))
                },
            })
        }
    },

    getHotPostsRecommendationData() {
        const params = {
            userId: '',
            queryType: 'all',
            deleteFlag: 0,
        }

        service.getHotPostsRecommendationData(params, response => {
            const data = response.resultMessage
            const resultList = []
            for (let i = 0, len = data.length; i < len; i++) {
                if (data[i].bannerType == 1) { // 1为一句话
                    resultList.push(data[i])
                }
            }

            this.model.set({ resultList })
        })
    },


    format(data) {
        const {
            resultList = [], shieldList = [], typeNum, type, contentType, isShowTopicName,
        } = data
        if (typeNum == 0) {
            resultList.forEach((item, index) => {
                const state = item.state
                switch (state) {
                case 0:
                    item.showUpdateBtn = true
                    item.stateText = '展示中'
                    break
                case 1:
                    item.showUpdateBtn = true
                    item.stateText = '待展示'
                    break
                case 2:
                    item.stateText = '展示结束'
                    item.showUpdateBtn = false
                    break
                default:
                    break
                }
                item.index = index
                item.showUpdate = true
                // 推荐内容
                if (item.contentType == 1) {
                    item.recContent = '帖子详情页'
                    item.isRecCommendId = true
                } else if (item.contentType == 2) {
                    item.recContent = '话题详情页'
                    item.isRecCommendId = false
                } else if (item.contentType == 3) {
                    item.recContent = '个人主页'
                    item.isUserHome = true
                    item.userHomeUrl = `${envCfg.pcBBSBaseUrl}#userHome/${item.skipId}`
                } else if (item.contentType == 4) {
                    item.recContent = '活动页面'
                    item.isRecCommendId = false
                } else if (item.contentType == 5) {
                    item.recContent = '问答'
                    item.isRecCommendId = true
                } else if (+item.contentType === 7) {
                    item.recContent = '微信小程序'
                    item.showUpdate = false
                    item.isRecCommendId = false
                }
                item.order = index + 1
                // to do 后期删除 (postMasterId)
                // 取消话题详情页-列表新需求权限
                // item.postUrl = type == 1 ? `${envCfg.postBaseUrl}${item.skipId}` : `${envCfg.postBaseUrl}${item.postMasterId}`;
                // 回答ID
                item.postMasterId = +item.contentType == 5 ? item.content : item.postMasterId

                if (item.type == 1) {
                    item.postUrl = `${envCfg.postBaseUrl}${item.skipId}`
                    if (+item.contentType == 5) {
                        item.postUrl = `${envCfg.questionBaseUrl}${item.postMasterId}`
                    }
                } else if (item.type == 2) {
                    item.postUrl = `${envCfg.postBaseUrl}${item.skipId}`
                } else if (item.type == 3) {
                    item.postUrl = `${envCfg.questionBaseUrl}${item.postMasterId}`
                }

                // 下线--显示||隐藏
                if (!typeNum) {
                    item.hideOffLine = (+type == 1) ? (+item.contentType == 5 ? 'hide-important' : '') : 'hide-important'
                }
            })
            // to do 后期删除 (hideItemsOfNewDeveloped)
            // 取消话题详情页-列表新需求权限
            const hideItemsOfNewDeveloped = !!((type == 1 && contentType != 5))
            const data = Object.assign({ resultList }, { hideItemsOfNewDeveloped, isShowTopicName })
            return data
        } else if (typeNum == 1) {
            shieldList.forEach((item, index) => {
                const isBlockedCase = item.isBlocked
                let blockedText
                if (type == 1) {
                    blockedText = '首页'
                } else if (type == 2) {
                    blockedText = item.topicTitleList || ''
                }
                switch (isBlockedCase) {
                case 0:
                    item.isBlockedText = `${blockedText}取消推荐`
                    item.shieldOperate = '恢复推荐'
                    break
                case 1:
                    item.isBlockedText = `${blockedText}取消推荐结束`
                    item.shieldOperate = '取消推荐'
                    break
                default:
                    break
                }
                item.index = index
                item.order = index + 1
                // item.postUrl = `${envCfg.postBaseUrl}${item.postMasterId}`;
                item.postUrl = `${envCfg.postBaseUrl}${item.postMasterId}`
                if (item.contentType == 5) {
                    item.postUrl = `${envCfg.questionBaseUrl}${item.postMasterId}`
                }
            })
            return { shieldList }
        }
    },


    render() {
        const data = this.format(this.model.toJSON())
        if ($('#hotPostsView').find('#recommend').hasClass('active')) {
            this.$el.html(tpl(data))
        } else {
            this.$el.html(shieldTpl(data))
        }
        const {
            isShowTopicName, type, resultList, typeNum,
        } = data
        // to do

        // if(+type !== 1) {
        //     this.$el.find('.offline').addClass('hide-important');
        // } else {
        //   this.$el.find('.offline').removeClass('hide-important');
        // }
        return this
    },
})

export { PostsListItm }
