import _ from 'lodash'
import React from 'react'
import { render } from 'react-dom'

import { service } from 'common/service'
import { common } from 'common/common'
import ChoseModal from './choseModal'
import EditModal from './editModal'
import { Modal } from 'antd'


const Model = Backbone.Model.extend({
    defaults: {
        showChoseModal: true,
        showEditModal: false,
        quickReplys: [],
        queryParams: {
            searchContent: '',
            labelId: -1, // 默认接口需要-1
        },
    },
})

const QuickReply = Backbone.View.extend({
    initialize(options) {
        const { onClick, bsParams } = options
        this.model = new Model()
        this.sendMsg = onClick
        this.bsParams = bsParams
        this.getQuickReplys()
        this.getQuickReplyLabels()
        this.listenTo(this.model, 'change', this.render)

        this.render()
    },

    events: {
        // 'click #sendMessageBtn': 'sendTextMessage',
    },

    destroy() {
        this.remove()
    },
    closeChoseModal() {
        this.model.set({
            showChoseModal: false,
        })
    },
    toggleEditModal(data) {
        const { showEditModal } = this.model.toJSON()
        const { type = 'add', item = {} } = data || {}
        console.log('iteminfo:', data)
        this.model.set({
            showEditModal: !showEditModal,
            editModalTitle: type === 'add' ? '设置快捷回复话术' : '编辑快捷回复用语',
            editModalContent: { ...item },
        })
    },
    updateEditModalContent(data) {
        this.model.set({
            editModalContent: data,
        })
    },
    saveUpdate() {
        const { editModalContent, editModalContent: { id, quickReplyContent, labelId, type } } = this.model.toJSON()
        if (!quickReplyContent) {
            Modal.error({ title: '请填写快捷回复用语！' })
            return
        } else if (type !== 2 && quickReplyContent.length > 200) {
            Modal.error({ title: '快捷回复用语最多不超过200个字！' })
            return
        } else if (!labelId) {
            Modal.error({ title: '请选择话术标签！' })
            return
        }
        console.log(editModalContent)
        if (id) {
            service.editCommonPhrase({
                teacherAccount: common.getUserInfo().userAccount,
                ...editModalContent,
            }, response => {
                if (response.rs) {
                    Modal.success({ title: '修改成功！' })
                    this.getQuickReplys()
                    this.toggleEditModal()
                } else {
                    Modal.error({ title: response.rsdesp })
                }
            })
        } else {
            service.addCommonPhrase({
                teacherAccount: common.getUserInfo().userAccount,
                ...editModalContent,
            }, response => {
                if (response.rs) {
                    Modal.success({ title: '添加成功！' })
                    this.getQuickReplys()
                    this.toggleEditModal()
                } else {
                    Modal.error({ title: response.rsdesp })
                }
            })
        }
    },
    getQuickReplys(params = {}) {
        const { queryParams } = this.model.toJSON()
        service.getCommonPhraseList({
            teacherAccount: common.getUserInfo().userAccount,
            pageNo: 1,
            pageSize: 10,
            ...queryParams,
            ...params,
        }, response => {
            if (response.rs) {
                const {
                    resultList: quickReplys, totalCount, pageCount, pageIndex, countPerPage,
                } = response.resultMessage
                this.model.set({
                    quickReplys, totalCount, pageCount, pageIndex, countPerPage, queryParams: { ...queryParams, ...params },
                })
            } else {
                Modal.error({
                    title: response.rsdesp,
                })
            }
        })
    },
    getQuickReplyLabels() {
        console.log('userInfo：', common.getUserInfo())
        service.getQuickReplyLabels({
            teacherAccount: common.getUserInfo().userAccount,
        }, response => {
            if (response.rs) {
                const quickReplyLabels = response.resultMessage
                this.model.set({ quickReplyLabels })
            } else {
                Modal.error({
                    title: response.rsdesp,
                })
            }
        })
    },

    sendQuickReplyMsg(data) {
        const { type, quickReplyContent } = data
        const rs = this.sendMsg({
            messageType: type,
            chatContent: quickReplyContent,
            ...this.bsParams,
        })
        if (rs) {
            this.closeChoseModal()
        }
    },

    delQuickReply({ id, rank }) {
        service.deleteCommonPhrase({
            rank,
            id,
            teacherAccount: common.getUserInfo().userAccount,
        }, response => {
            if (response.rs) {
                Modal.success({
                    title: '删除成功！',
                })
                this.getQuickReplys()
            } else {
                Modal.error({
                    title: response.rsdesp,
                })
            }
        })
    },

    render() {
        const childProps = {
            ...this.model.toJSON(),
            dispatch: (name, ...rest) => {
                if (this[name] && typeof this[name] === 'function') {
                    return this[name](...rest)
                }
                console.warn(`can not find method: ${name}`)
                return undefined
            },
        }

        render(
            <div>
                <EditModal {...childProps} />
                <ChoseModal {...childProps} />
            </div>, this.el)
    },
})

export default QuickReply
export { QuickReply }
