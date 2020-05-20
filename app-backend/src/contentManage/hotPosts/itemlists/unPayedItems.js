import { service } from '../../../common/service'
import { common } from '../../../common/common'
import { envCfg } from '../../../common/envCfg'
import { Dialog } from '../../../components/dialog/index'
import { RecConfigDialog } from '../dialogTpl/recConfigDialog/index'
import { DeleteDialog } from '../dialogTpl/deleteDialog/index'

const tpl = require('./unPayedItems.html')

const Model = Backbone.Model.extend({
    defaults: {
        unpayedList: [],
        checkedNumber: 1,
    },
})

const UnPayedItems = Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        this.options = options
        const {
            unpayedList, pageNo, pageSize, typeOfRecommend, It,
        } = options
        this.listenTo(this.model, 'change:unpayedList', this.render)
        this.model.set({ typeOfRecommend, It })
        unpayedList && this.model.set({ unpayedList })
        pageNo && this.model.set({ pageNo })
        pageSize && this.model.set({ pageSize })

        this.render()
    },

    events: {
        'click .recConfig': 'recConfigDialog',
        'click #setShowScope': 'setShowScope',
        'click .dele': 'deleteDialog',
        'click .check-user-update': 'recConfigDialog',
    },

    setShowScope(e) {
        const index = $(e.currentTarget).attr('index')
        const cnt = $(e.currentTarget).html()
        const that = this

        const {
            unpayedList, pageNo, pageSize,
        } = this.model.toJSON()

        const itm = unpayedList[+index]

        let showScope = 1

        if (cnt === '全量开放') {
            showScope = 1
        } else if (cnt === '灰度限制') {
            showScope = 2
        }

        const params = {
            id: itm.id,
            showScope,
        }

        service.updateUnPaidHotShowScope(
            params,
            $.proxy(response => {
                if (response.rs) {
                    alert('设置成功！')
                    that.options.onSuccessCallBack({ pageSize, pageNo })
                } else {
                    alert(response.rsdesp)
                }
            }, this),
        )
    },

    recConfigDialog(e) {
        const index = $(e.currentTarget).attr('index')
        const {
            unpayedList, pageNo, pageSize, It,
        } = this.model.toJSON()
        const itm = unpayedList[+index]
        let {
            beginTime,
            endTime,
            postMasterId,
            pageNumber,
            ranking,
            suggestedStatus,
            type,
            id,
            questionId,
            position,
            skipTitle,
            skipName,
        } = itm
        this.recConfigDialog = new RecConfigDialog({
            el: this.$el.find('#recConfigDialog')[0],
            itm,
        })

        const that = this

        // const headText = type == 1 ? "推荐设置" : "更新内容";
        const headText = '更新内容'

        const d = new Dialog({
            title: headText,
            content: this.recConfigDialog.el,
            type: 4,
            ok() {
                const selector = this.$el.find('.dialog #form')
                const beginTime = selector.find('#beginTimeRec').val()
                const endTime = selector.find('#endTimeRec').val()
                const pageNumber = selector.find('#pageNumber').val()
                const ranking = selector.find('#ranking').val()
                const contentPic = selector.find('#contentPic').val()
                // suggestedStatus = this.$el.find('#recConfigUpdate').is(":checked") ? 1 : 0;
                suggestedStatus = 1
                postMasterId = type == 1 ? postMasterId : questionId
                skipTitle = this.$el.find('#pageTitle').val()
                const params = {
                    beginTime,
                    endTime,
                    pageNumber,
                    ranking,
                    postMasterId,
                    suggestedStatus,
                    type,
                    position,
                    skipType: 1,
                }
                type == 3 &&
                    Object.assign(params, {
                        contentPic,
                        skipName: encodeURIComponent(skipName),
                        postMasterId: id,
                        skipTitle,
                        skipType: 3,
                    })
                if (
                    that.valideTitleAndPic(type, contentPic, skipTitle) &&
                    that.validateTimeBeforeAfter(beginTime, endTime, suggestedStatus) &&
                    that.validateInputNumber(+pageNumber, +ranking, suggestedStatus)
                ) {
                    service.setUnPaidSuggestedPost(
                        params,
                        $.proxy(function (response) {
                            if (response.rs) {
                                alert('设置成功！')
                                this.closeDialog()
                                this.$el.find('#recConfigDialog').empty()
                                that.options.onSuccessCallBack({ pageSize, pageNo })
                            } else {
                                alert(response.rsdesp)
                            }
                        }, this),
                    )
                }
            },
        })
    },

    valideTitleAndPic(type, pic, title) {
        if (type == 3) {
            if (!title.length) {
                alert('页面标题不能为空！')
                return false
            }
            if (title.length > 20) {
                alert('页面标题长度过长！')
                return false
            }
            if (!pic.length) {
                alert('请上传广告图！')
                return false
            }
            return true
        }
        return true
    },

    deleteDialog(e) {
        const index = $(e.currentTarget).attr('index')
        const { unpayedList, checkedNumber, typeOfRecommend } = this.model.toJSON()
        const itm = unpayedList[+index]
        const {
            postMasterId, postSubject, questionId, content, id, skipTitle,
        } = itm
        const delList = []
        delList.push(id)
        // 删除dialog title
        const delDialogTitle = typeOfRecommend == 1 ? '取消推荐热帖' : '删除热门内容'
        // 获取用户263账号
        const { userAccount } = common.getUserInfo()
        const params = {
            delList,
            type: typeOfRecommend,
            userAccount,
        }
        this.deleteDialog = new DeleteDialog({
            el: this.$el.find('#deleteDialog')[0],
            checkedNumber,
            postSubject,
            typeOfRecommend,
            content,
            skipTitle,
            isSingleClick: true,
        })
        const that = this
        const d = new Dialog({
            title: delDialogTitle,
            content: this.deleteDialog.el,
            type: 4,
            ok() {
                service.deleteNewUnpayedHotMasterPosts(
                    params,
                    $.proxy(function (response) {
                        if (response.rs) {
                            alert('删除成功！')
                            this.closeDialog()
                            this.$el.find('#deleteDialog').empty()
                            that.options.onSuccessCallBack()
                        } else {
                            alert(response.rsdesp)
                        }
                    }, this),
                )
            },
        })
    },

    validateInputNumber(pageNumber, ranking, suggestedStatus) {
        if (suggestedStatus) {
            if (!pageNumber) {
                alert('页码不能为空！')
                return false
            }
            if (!ranking) {
                alert('位数不能为空！')
                return false
            }
        }
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
    },
    validateTimeBeforeAfter(beginTime, endTime, suggestedStatus) {
        if (suggestedStatus) {
            beginTime = new Date(beginTime).getTime()
            endTime = new Date(endTime).getTime()
            if (!beginTime || !endTime) {
                if (!beginTime) {
                    alert('开始时间不能为空！')
                    return false
                }
                if (!endTime) {
                    alert('结束时间不能为空！')
                    return false
                }
            } else {
                if (beginTime > endTime) {
                    alert('开始时间不能大于结束时间!')
                    return false
                }
                return true
            }
        }
        return true
    },

    format(data) {
        const { unpayedList, typeOfRecommend } = data

        // 是否是帖子
        const isPost = typeOfRecommend == 1
        // 是否是活动页面
        const isActivePage = typeOfRecommend == 3 || +typeOfRecommend === 4

        // colspan: 内容类型选中项value-列表列数
        const tableColMap = {
            1: 12,
            2: 8,
            3: 9,
            4: 9,
        }
        const colspanNumber = tableColMap[typeOfRecommend]
        unpayedList.forEach((item, index) => {
            item.index = index
            if (isPost) {
                item.addTypeCnt = {
                    1: '人工导入',
                    2: '自动导入1',
                }[item.addType] || ''
                item.showScopeCnt = {
                    1: '全量开放',
                    2: '灰度限制',
                }[item.showScope] || ''
                // 设置 - 反向
                item.setShowScope = {
                    2: '全量开放',
                    1: '灰度限制',
                }[item.showScope] || ''
                // 1/2 时候不允许点击设置
                item.canSetShowScope = ![1, 2].includes(item.statusResult)
            }
            // 状态转换成中文文本
            switch (+item.statusResult) {
            case 0:
                item.status = '未推荐'
                break
            case 1:
                item.status = '待展示'
                break
            case 2:
                item.status = '展示中'
                break
            case 3:
                item.status = '展示结束'
                break
            default:
                break
            }

            item.showUpdate = true

            // 类型转化成中文文本
            if (item.type === 1) {
                item.typeText = '帖子'
            } else if (item.type === 2) {
                item.typeText = '问答'
            } else if (item.type === 3) {
                item.recContent = '活动页面'
            } else if (+item.type === 4) {
                item.recContent = '微信小程序'
                item.showUpdate = false
            }

            // 操作列-删除操作-显示文本
            // item.deleteText = typeOfRecommend == 1 ? '删除热帖' : '删除问答';
            if (typeOfRecommend == 1) {
                item.deleteText = '删除热帖'
            } else if (typeOfRecommend == 2) {
                item.deleteText = '删除问答'
            } else if (typeOfRecommend == 3) {
                item.deleteText = '删除活动'
            } else if (+typeOfRecommend === 4) {
                item.deleteText = '下线'
            }

            // 导向url
            item.navUrl = `${envCfg.postBaseUrl}${item.postMasterId}`
        })
        return Object.assign(data, {
            unpayedList,
            isPost,
            isActivePage,
            colspanNumber,
        })
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
    },
})

export { UnPayedItems }
