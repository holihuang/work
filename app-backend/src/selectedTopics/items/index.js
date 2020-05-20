import React from 'react'
import { Modal, message, Table } from 'antd'
import { service } from '../../common/service'
import { common } from '../../common/common'
import { Dialog } from '../../components/dialog/index'
import { DialogConfirm } from '../../components/dialogConfirm/index'
import { Update } from '../dialog/update/update'
import { Config } from '../dialog/config/index'
import injectReactComponent from '../../common/injectReactComponent'
import ajax from '../service'

const tpl = require('./tpl.html')

const Model = Backbone.Model.extend({
    topicClassList: [],
})

const Items = Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        this.listenTo(this.model, 'change', this.render)
        const {
            pageSize, pageNo, resultList, topicClassifyList, isSCHBM, onSuccess,
            parent,
        } = options
        this.onSuccess = onSuccess
        this.parent = parent
        this.model.set({
            resultList,
            topicClassifyList,
            pageSize,
            pageNo,
            isSCHBM,
            parent,
        })
    },

    events: {
        'click .configClassify': 'configClassify', // 设置分类
        'click .updateTopicInfo': 'updateTopicInfo', // 更新话题信息
        'click .disTopicInfo': 'disTopicInfo', // 隐藏|显示操作
        'click .deleteTopicInfo': 'deleteTopicInfo', // 删除操作
        'click .operLog': 'operLog', // 操作日志
    },

    operLog(e) {
        const topicId = e.target.getAttribute('topicid')
        const params = { topicId }

        // show log modal
        this.toggleLogModal(true)
        this.getLogList(params)
    },

    toggleLogModal(bool) {
        this.model.set({ showLogModal: bool })
    },

    tableCheckboxState() {
        const { parent } = this
        parent.selectAll()
    },

    getLogList(params) {
        ajax.adminGetOpLogList(params).then(response => {
            this.model.set({ logList: response })
            this.tableCheckboxState()
        }).catch(e => {
            message.error(e)
        })
    },

    onCloseLogModal() {
        this.toggleLogModal(false)
        this.tableCheckboxState()
    },

    LogList(props) {
        const { showLogModal, logList = [], dispatch } = props
        const logModalProps = {
            title: '操作日志',
            visible: true,
            onOk: () => {
                dispatch('onCloseLogModal')
            },
            onCancel: () => {
                dispatch('onCloseLogModal')
            },
        }
        const tableProps = {
            columns: [{
                title: '操作人',
                dataIndex: 'operator',
            }, {
                title: '操作事件',
                dataIndex: 'operateEvent',
            }, {
                title: '操作时间',
                dataIndex: 'operateTime',
            }],
            dataSource: logList,
        }
        return (
            <div>
                {
                    showLogModal ? (
                        <Modal {...logModalProps}>
                            <Table {...tableProps} />
                        </Modal>
                    ) : null
                }
            </div>
        )
    },

    formatSetClassifyList(obj = []) {
        const arr = []
        for (const item of obj) {
            arr.push(item.value)
        }
        return arr
    },

    // 设置分类
    configClassify(e) {
        const index = $(e.currentTarget).attr('index')
        const {
            resultList, topicClassifyList, pageSize, pageNo,
        } = this.model.toJSON()
        const item = resultList[index]
        const { topicId } = item
        const that = this
        this.config = new Config({
            index,
            item,
            topicId,
            topicClassifyList,
            onSuccess: this.onSuccess.bind(this),
        })
        this.dialog = new Dialog({
            title: '设置分类',
            type: 4,
            content: this.config.el,
            ok() {
                const classifyIdList = that.formatSetClassifyList(this.$el.find('.classify-list .checked'))
                const params = {
                    topicId,
                    classifyIdList,
                }
                service.adminSetTopicClass(params, response => {
                    if (response.rs) {
                        alert('设置分类成功！')
                        if (typeof (that.onSuccess) === 'function') {
                            that.onSuccess({ pageSize, pageNo })
                        }
                        this.closeDialog()
                    } else {
                        alert(response.rsdesp)
                    }
                })
            },
        })
    },

    /*= =====================更新话题点击操作============================== */
    updateTopicInfo(e) {
        const inx = $(e.currentTarget).attr('index')
        const { resultList } = this.model.toJSON()
        const itm = resultList[inx]
        const { topicId, topicOwner } = itm
        const that = this
        this.update = new Update({
            itm,
            topicId,
            topicOwner,
            onSuccess: that.onSuccess,
        })
    },

    /*= ==================隐藏|显示点击操作=========================== */
    disTopicInfo(e) {
        const inx = $(e.currentTarget).attr('index')
        const { resultList } = this.model.toJSON()

        const itm = resultList[inx]

        let { topicId, isShow } = itm
        let r

        if (isShow) {
            isShow = 0
            r = confirm('确定隐藏该话题吗？')
        } else {
            isShow = 1
            r = confirm('确定显示该话题吗？')
        }

        if (r === true) {
            const params = {}
            Object.assign(params, { topicId }, { isShow })
            service.disOrHideItems(params, $.proxy(function (response) {
                if (response.rs) {
                    alert('修改成功！')

                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess()
                    }
                } else {
                    alert(response.rsdesp)
                }
            }, this))
        }
    },

    /*= =========================删除点击操作=================================== */
    deleteTopicInfo(e) {
        const inx = $(e.currentTarget).attr('index')
        const { resultList } = this.model.toJSON()

        const itm = resultList[inx]

        const { topicId, deleteFlag } = itm

        const topicIdList = topicId

        const r = confirm('确定删除该话题吗？')
        if (r === true) {
            const params = {}
            Object.assign(params, { topicIdList })
            service.deleteTopicInfoItems(params, $.proxy(function (response) {
                if (response.rs) {
                    alert('删除成功！')
                    if (typeof this.onSuccess === 'function') {
                        this.onSuccess()
                    }
                } else {
                    alert(response.rsdesp)
                }
            }, this))
        }
    },

    // 格式化“话题类型”-classifyNameList成中文
    formatClassifyNameList(str) {
        const arr = str.split(',') || []
        const formattedArr = []
        arr.forEach((item, index) => {
            switch (+item) {
            case 1:
                formattedArr.push('精华')
                break
            case 2:
                formattedArr.push('交友')
                break
            case 3:
                formattedArr.push('攻略')
                break
            case 4:
                formattedArr.push('课程')
                break
            case 5:
                formattedArr.push('兴趣')
                break
            case 6:
                formattedArr.push('自考')
                break
            case 7:
                formattedArr.push('其他')
                break
            default:
                formattedArr.push('全部')
                break
            }
        })
        return formattedArr.join(';')
    },

    /*= ==============================格式化数据================================== */
    format(data) {
        const { resultList = [], isSCHBM } = data

        resultList.forEach((item, index) => {
            const {
                isShow, deleteFlag, userType, topicOwner,
            } = item
            // 话题归属
            item.topicOwnerTxt = +topicOwner === 1 ? '官方话题' : '自发话题'
            // 是否是官方话题
            item.isOfficalTopic = +topicOwner === 1
            // 隐藏 状态操作按钮
            item.showStatusBtn = +topicOwner !== 2

            /*= ===============用户类型================ */
            switch (userType) {
            case 0:
                item.userTypeText = '免费用户'
                break
            case 1:
                item.userTypeText = '付费用户'
                break
            case 2:
                item.userTypeText = '全部用户'
            default:
                break
            }

            /*= ==============状态列================ */
            const statusArr = []

            if (isShow) {
                statusArr.push('显示')
            } else {
                statusArr.push('隐藏')
            }

            deleteFlag && statusArr.push('已删除')
            item.status = statusArr.join(' | ')

            /*= ==============操作列================== */

            const showText = isShow ? '隐藏' : '显示'
            let deleteText
            if (+deleteFlag === 0) {
                deleteText = '删除'
            }

            item.showText = showText
            item.deleteText = deleteText

            /*= ================索引================== */

            item.index = index

            /*= ==============学院-版主================== */
            item.isSCHBM = isSCHBM

            /*= ========话题类型-格式化成中文========== */
            item.classifyIds && (item.topicClassify = this.formatClassifyNameList(item.classifyIds))
        })
        return { resultList }
    },

    render() {
        const data = this.format(this.model.toJSON())
        const { parent } = this.model.toJSON()
        this.$el.html(tpl(data))
        const target = [{
            id: 'logList',
            component: this.LogList,
        }]
        injectReactComponent(this, target, { keyArr: ['showLogModal', 'logList'], parent })
    },
})

export { Items }
