import { envCfg } from '../../../common/envCfg'
import { service } from '../../../common/service'
import { common } from '../../../common/common'
import { Dialog } from '../../../components/dialog'

const tpl = require('./tpl.html')
const logTpl = require('../dialogTpl/logTpl.html')

const Model = Backbone.Model.extend({
    defaults: {
        userRole: window.userInfo.userRole,
        operateType: {
            HIDE: '屏蔽',
            RECOVER_HIDE: '取消屏蔽',
            DELETE: '删除',
            RECOVER_DELETE: '取消删除',
            AUDIT_PASS: '审核通过',
        },
    },
})

const PostSlaveItems = Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        const { el, ...others } = options
        this.listenTo(this.model, 'change', this.render)
        this.model.set({ ...others })
    },

    events: {
        'click .checklog': 'checklog',
        'click .hide-item': 'hideItem', // 屏蔽帖子
        'click .delete-item': 'deleteItem', // 删除帖子
        'click .recover-hide': 'recoverHideItem', // 恢复屏蔽帖
        'click .recover-delete': 'recoverDeleteItem', // 恢复删除帖
    },

    checklog(e) {
        const index = $(e.currentTarget).attr('index')
        const { resultList, operateType, isReply } = this.model.toJSON()
        const { postSlaveId, replyId } = resultList[index]
        if (+isReply) {
            service.getPostReplyOperationLog({ replyId }, response => {
                if (response.rs) {
                    const resultMessage = response.resultMessage
                    if (resultMessage.length) {
                        resultMessage.forEach((item, index) => {
                            item.typeText = operateType[item.type]
                        })

                        new Dialog({
                            title: '操作日志',
                            type: 2,
                            content: logTpl({ resultMessage }),
                        })
                    } else {
                        alert('暂无操作记录')
                    }
                } else {
                    alert(`查询失败${response.rsdesp}`)
                }
            })
        } else {
            service.getPostSlaveOperationLog({ postSlaveId }, response => {
                if (response.rs) {
                    const resultMessage = response.resultMessage
                    if (resultMessage.length) {
                        resultMessage.forEach((item, index) => {
                            item.typeText = operateType[item.type]
                        })

                        new Dialog({
                            title: '操作日志',
                            type: 2,
                            content: logTpl({ resultMessage }),
                        })
                    } else {
                        alert('暂无操作记录')
                    }
                } else {
                    alert(`查询失败${response.rsdesp}`)
                }
            })
        }
    },

    /** **************************** 单条操作 ************************************ */
    // 删除跟帖
    deleteItem(e) {
        if (confirm('确定要删除该回贴吗？')) {
            const index = $(e.currentTarget).attr('index')
            const { resultList } = this.model.toJSON()
            const { postSlaveId, replyId, postMasterId } = resultList[index]

            const { isReply } = this.model.toJSON()

            if (+isReply) {
                // 二级回帖
                this.updatePostReplyDeleteFlag({
                    deleteFlag: 1, replyId, postMasterId, postSlaveId,
                })
            } else {
                this.updatePostSlaveDeleteFlag({ deleteFlag: 1, postSlaveId })
            }
        }
    },

    // 回帖-恢复删除回帖
    recoverDeleteItem(e) {
        if (confirm('确定要恢复该回帖吗？')) {
            const index = $(e.currentTarget).attr('index')
            const { resultList } = this.model.toJSON()
            const { postSlaveId, replyId, postMasterId } = resultList[index]

            const { isReply } = this.model.toJSON()

            if (+isReply) {
                // 二级回帖
                this.updatePostReplyDeleteFlag({
                    deleteFlag: 0, replyId, postMasterId, postSlaveId,
                })
            } else {
                this.updatePostSlaveDeleteFlag({ deleteFlag: 0, postSlaveId })
            }
        }
    },

    hideItem(e) {
        if (confirm('确定要屏蔽该回帖吗？')) {
            const index = $(e.currentTarget).attr('index')
            const { resultList } = this.model.toJSON()
            const { postSlaveId, replyId, postMasterId } = resultList[index]

            const { isReply } = this.model.toJSON()

            if (+isReply) {
                // 二级回帖
                this.updatePostReplyHideState({
                    isHide: 1, replyId, postMasterId, postSlaveId,
                })
            } else {
                this.updatePostSlaveHideState({ isHide: 1, postSlaveId })
            }
        }
    },

    // 回帖-恢复屏蔽回帖
    recoverHideItem(e) {
        if (confirm('确定要恢复该回帖吗？')) {
            const index = $(e.currentTarget).attr('index')
            const { resultList } = this.model.toJSON()
            const { postSlaveId, replyId, postMasterId } = resultList[index]

            const { isReply } = this.model.toJSON()

            if (+isReply) {
                // 二级回帖
                this.updatePostReplyHideState({
                    isHide: 0, replyId, postMasterId, postSlaveId,
                })
            } else {
                this.updatePostSlaveHideState({ isHide: 0, postSlaveId })
            }
        }
    },
    /** ================================================================================== */


    /** ************************************* 批量操作 ************************************ */
    // 批量操作回帖时，首先判断选中的回帖状态是否相同
    checkReplyPostsStatus(arr, flag) {
        /*
        let statusArr = [];
		arr.forEach((item, index) => {
			if (item.isHide) {  //是否被屏蔽
				if (statusArr.indexOf('isHide') === -1) {
					statusArr.push('isHide');
				}
			} else if (item.deleteFlag) { //是否删除帖
				if (statusArr.indexOf('deleteFlag') === -1) {
					statusArr.push('deleteFlag');
				}
			} else { //正常帖
				if (statusArr.indexOf('normal') === -1) {
					statusArr.push('normal');
				}
			}
		})

		if (statusArr.length > 1) {
			return false;
		} else {
			return true;
		} */
        if (flag == 1) { // 回帖-屏蔽
            let temptFlag = false
            arr.forEach((item, index) => {
                const { deleteFlag, isHide } = item
                if (isHide !== 0) {
                    temptFlag = true
                }
            })
            return temptFlag
        } else if (flag == 2) { // 回帖-删除
            let temptFlag = false
            arr.forEach((item, index) => {
                const { deleteFlag, isHide } = item
                if (deleteFlag !== 0) {
                    temptFlag = true
                }
            })
            return temptFlag
        } else if (flag == 3) { // 回帖-恢复屏蔽回帖
            let temptFlag = false
            arr.forEach((item, index) => {
                const { deleteFlag, isHide } = item
                if (isHide == 0) {
                    temptFlag = true
                }
            })
            return temptFlag
        } else if (flag == 4) { // 回帖-恢复删除回帖
            let temptFlag = false
            arr.forEach((item, index) => {
                const { deleteFlag, isHide } = item
                if (deleteFlag == 0) {
                    temptFlag = true
                }
            })
            return temptFlag
        }
    },

    getCheckedItems(flag) {
        const arr = []
        const { resultList } = this.model.toJSON()
        this.$el.find('.check-item-ipt').each(function () {
            if ($(this).prop('checked')) {
                arr.push(resultList[$(this).val()])
            }
        })
        if (this.checkReplyPostsStatus(arr, flag)) {
            alert('帖子已屏蔽，已删除或批量操作存在多种状态，请重新选择！')
            return
        }

        return arr
    },

    getPostSlaveIds() {
        const checkedItems = this.getCheckedItems()
        const postSlaveIds = []
        checkedItems.forEach(item => {
            postSlaveIds.push(item.postSlaveId)
        })

        return postSlaveIds
    },

    getPostMasterIdReplyIdArr() {
        const checkedItems = this.getCheckedItems()
        const postMasterIdReplyIdArr = []
        checkedItems.forEach(item => {
            const { postMasterId, replyId } = item
            postMasterIdReplyIdArr.push({ postMasterId, replyId })
        })

        return postMasterIdReplyIdArr
    },

    // 批量删除回帖
    batchDeleteItems() {
        /** ********批量删除=======flag=2************ */
        const checkedItems = this.getCheckedItems(2)

        if (checkedItems) {
            if (confirm('确定要删除这些回贴吗？')) {
                const { isReply } = this.model.toJSON()

                if (+isReply) {
                    // 二级回帖
                    const postReplys = this.getPostMasterIdReplyIdArr()

                    this.updatePostReplyDeleteFlag({ postReplys, deleteFlag: 1, operateFlag: 1 })
                } else {
                    const postSlaveIds = this.getPostSlaveIds()
                    this.updatePostSlaveDeleteFlag({ deleteFlag: 1, postSlaveIds, operateFlag: 1 })
                }
            }
        }
    },

    // 批量恢复删除回帖
    batchRecoverDeleteItems() {
        /** ********批量恢复删除回帖=======flag=4************ */
        const checkedItems = this.getCheckedItems(4)

        if (checkedItems) {
            const { isReply } = this.model.toJSON()

            if (confirm('确定要恢复这些回帖吗？')) {
                if (+isReply) {
                    // 二级回帖
                    const postReplys = this.getPostMasterIdReplyIdArr()
                    this.updatePostReplyDeleteFlag({ postReplys, deleteFlag: 0, operateFlag: 1 })
                } else {
                    const postSlaveIds = this.getPostSlaveIds()
                    this.updatePostSlaveDeleteFlag({ deleteFlag: 0, postSlaveIds, operateFlag: 1 })
                }
            }
        }
    },

    // 批量屏蔽回帖
    batchHideItems() {
        /** ********批量屏蔽=======flag=1************ */
        const checkedItems = this.getCheckedItems(1)

        if (checkedItems) {
            const { isReply } = this.model.toJSON()

            if (confirm('确定要屏蔽这些回帖吗？')) {
                if (+isReply) {
                    // 二级回帖

                    const postReplys = this.getPostMasterIdReplyIdArr()

                    this.updatePostReplyHideState({ postReplys, isHide: 1, operateFlag: 1 })
                } else {
                    const postSlaveIds = this.getPostSlaveIds()
                    this.updatePostSlaveHideState({ isHide: 1, postSlaveIds, operateFlag: 1 })
                }
            }
        }
    },

    // 回帖-批量恢复屏蔽回帖
    batchRecoverHideItems() {
        /** ********批量恢复屏蔽回帖=======flag=3************ */
        const checkedItems = this.getCheckedItems(3)

        if (checkedItems) {
            const { isReply } = this.model.toJSON()
            if (confirm('确定要恢复这些回帖吗？')) {
                if (+isReply) {
                    // 二级回帖
                    const postReplys = this.getPostMasterIdReplyIdArr()
                    this.updatePostReplyHideState({ postReplys, isHide: 0, operateFlag: 1 })
                } else {
                    const postSlaveIds = this.getPostSlaveIds()
                    this.updatePostSlaveHideState({ isHide: 0, postSlaveIds, operateFlag: 1 })
                }
            }
        }
    },
    // 回帖-批量屏蔽回帖
    batchRefuseReplyPosts() {
        const checkedItems = this.getCheckedItems(3)

        if (checkedItems) {
            const { isReply } = this.model.toJSON()
            if (confirm('确定要屏蔽这些回帖吗？')) {
                if (+isReply) {
                    // 二级回帖
                    const postReplys = this.getPostMasterIdReplyIdArr()
                    this.updatePostReplyHideStateForExamine({ postReplys, isHide: 1, operateFlag: 1 })
                } else {
                    const postSlaveIds = this.getPostSlaveIds()
                    this.updatePostSlaveHideStateForExamine({ isHide: 1, postSlaveIds, operateFlag: 1 })
                }
            }
        }
    },
    // 回帖-批量审核通过回帖
    batchAgreeReplyPosts() {
        const checkedItems = this.getCheckedItems(3)

        if (checkedItems) {
            const { isReply } = this.model.toJSON()
            if (confirm('确定要通过这些回帖吗？')) {
                if (+isReply) {
                    // 二级回帖
                    const postReplys = this.getPostMasterIdReplyIdArr()
                    this.updatePostReplyHideStateForExamine({ postReplys, isHide: 0, operateFlag: 1 })
                } else {
                    const postSlaveIds = this.getPostSlaveIds()
                    this.updatePostSlaveHideStateForExamine({ isHide: 0, postSlaveIds, operateFlag: 1 })
                }
            }
        }
    },
    /** =================================================================================== */

    /** *********************************************************************************** */
    updatePostSlaveHideStateForExamine(options) {
        const {
            postSlaveIds, postSlaveId, operateFlag, isHide,
        } = options
        const that = this
        service.updatePostSlaveHideState({
            email: common.getUserInfo().userAccount,
            postSlaveIds,
            postSlaveId,
            operateFlag,
            isHide,
            auditFlag: true,
        }, response => {
            if (response.rs) {
                alert('操作成功')
                that.refreshTableData()
            } else {
                alert(response.rsdesp)
            }
        })
    },
    updatePostSlaveHideState(options) {
        const {
            postSlaveIds, postSlaveId, operateFlag, isHide,
        } = options
        const that = this
        service.updatePostSlaveHideState({
            email: common.getUserInfo().userAccount,
            postSlaveIds,
            postSlaveId,
            operateFlag,
            isHide,
        }, response => {
            if (response.rs) {
                alert('操作成功')
                that.refreshTableData()
            } else {
                alert(response.rsdesp)
            }
        })
    },

    updatePostSlaveDeleteFlag(options) {
        const {
            postSlaveIds, postSlaveId, operateFlag, deleteFlag,
        } = options
        const that = this
        service.updatePostSlaveDeleteFlag({
            email: common.getUserInfo().userAccount,
            postSlaveIds,
            postSlaveId,
            operateFlag,
            deleteFlag,
        }, response => {
            if (response.rs) {
                alert('操作成功')
                that.refreshTableData()
            } else {
                alert(response.rsdesp)
            }
        })
    },

    updatePostReplyHideStateForExamine(options) {
        const {
            postReplys, replyId, isHide, operateFlag, postSlaveIds, postSlaveId, postMasterIds, postMasterId,
        } = options
        const that = this
        service.updatePostReplyHideState({
            email: common.getUserInfo().userAccount,
            postReplys,
            replyId,
            postMasterIds,
            postMasterId,
            postSlaveId,
            postSlaveIds,
            operateFlag,
            isHide,
            auditFlag: true,
        }, response => {
            if (response.rs) {
                alert('操作成功！')
                that.refreshTableData()
            } else {
                alert(response.rsdesp)
            }
        })
    },

    updatePostReplyHideState(options) {
        const {
            postReplys, replyId, isHide, operateFlag, postSlaveIds, postSlaveId, postMasterIds, postMasterId,
        } = options
        const that = this
        service.updatePostReplyHideState({
            email: common.getUserInfo().userAccount,
            postReplys,
            replyId,
            postMasterIds,
            postMasterId,
            postSlaveId,
            postSlaveIds,
            operateFlag,
            isHide,
        }, response => {
            if (response.rs) {
                alert('操作成功！')
                that.refreshTableData()
            } else {
                alert(response.rsdesp)
            }
        })
    },

    updatePostReplyDeleteFlag(options) {
        const {
            postReplys, replyId, deleteFlag, operateFlag, postMasterId, postSlaveId, postSlaveIds,
        } = options
        const that = this
        service.updatePostReplyDeleteFlag({
            email: common.getUserInfo().userAccount,
            postReplys,
            replyId,
            deleteFlag,
            operateFlag,
            postSlaveId,
            postSlaveIds,
            postMasterId,
        }, response => {
            if (response.rs) {
                alert('操作成功！')
                that.refreshTableData()
            } else {
                alert(response.rsdesp)
            }
        })
    },
    /** *********************************************************************************** */

    refreshTableData() {
        const {
            resultList, isReply, postReplysId, ...others
        } = this.model.toJSON()

        if (+isReply) {
            others.replyId = postReplysId
            // 二级回帖
            service.retrievePostReplyList({
                ...others,
            }, response => {
                if (response.rs) {
                    const resultList = response.resultMessage.resultList
                    this.model.set({ resultList })
                }
            })
        } else {
            others.postSlaveId = postReplysId

            service.retrieveSlavePostList({
                ...others,
            }, response => {
                if (response.rs) {
                    const resultList = response.resultMessage.resultList
                    this.model.set({ resultList })
                }
            })
        }
    },

    format(data) {
        const { resultList = [], isReply, postType } = data
        let isNormalReply
        let isShowContentImg = false
        if (+postType === 2) {
            isNormalReply = true
        }
        if (+postType === 3) {
            isShowContentImg = true
        }
        resultList.forEach((item, index) => {
            let content = item.content
            if (content == null) {
                content = ''
            }
            item.urlTitle = content.length > 200 ? `${content.substr(0, 200)}...` : content
            item.content = content.length > 64 ? `${content.substr(0, 64)}...` : content
            item.postUrl = `${envCfg.postBaseUrl}${item.postMasterId}`
            // item.statusText = (item.deleteFlag && '已删除') || (item.isHide && '已屏蔽')  || '正常';
            if (item.deleteFlag) {
                if (item.isHide) {
                    if (item.isHide == 1) {
                        item.statusText = '已删除 | 人工屏蔽'
                    } else if (item.isHide == 2) {
                        item.statusText = '已删除 | 系统屏蔽'
                    } else if (item.isHide == 3) {
                        item.statusText = '已删除 | 待审核'
                    }
                } else {
                    item.statusText = '已删除'
                }
            } else if (item.isHide) {
                if (item.isHide == 1) {
                    item.statusText = '人工屏蔽'
                } else if (item.isHide == 2) {
                    item.statusText = '系统屏蔽'
                } else if (item.isHide == 3) {
                    item.statusText = '待审核'
                }
            } else {
                item.statusText = '正常'
            }
            item.index = index
            item.operateList = []
            if (item.deleteFlag) {
                item.operateList.push({
                    className: 'recover-delete',
                    text: '恢复',
                })
            } else if (item.isHide) {
                item.operateList.push({
                    className: 'recover-hide',
                    text: '恢复',
                })
            } else {
                // 正常
                item.operateList.push({
                    className: 'delete-item',
                    text: '删除',
                }, {
                    className: 'hide-item',
                    text: '屏蔽',
                })
            }

            if (+isReply) {
                item.id = item.replyId
                item.replyType = '二级回帖'
            } else {
                item.id = item.postSlaveId
                item.replyType = '一级回帖'
            }

            // 是否只有图片
            item.isImage = !item.content && item.externalLinks

            // 手机号码后两位隐藏
            item.userMobile = item.userMobile ? `${item.userMobile.toString().substr(0, 9)}**` : item.userMobile
        })
        Object.assign(data, { isNormalReply, isShowContentImg })
        console.log(data)
        return data
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
    },

    // 复选框数目大于等于2，列表右边操作列被禁用
    changeCheckedStatus(checkedNumber) {
        if (checkedNumber >= 2) {
            this.$el.find('.list-disable').addClass('disabled')
        } else {
            this.$el.find('.list-disable').removeClass('disabled')
        }
    },
})

export { PostSlaveItems }
