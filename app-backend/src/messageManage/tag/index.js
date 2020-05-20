/**
 * @file 标签管理
 *
 * @auth gushouchuang
 * @date 2018-9-17
 */
 
import { ComponentGenerator } from 'common/ReactBackbone'
import { message, Modal } from 'antd'

import component from './Tag'
import service from './service'

const componentProps = {
    defaults: {
        editType: '',
        editCnt: {
            labelName: ''
        },
        // 列表
        dataSource: [],
        total: 0,
        loading: false, // 第一次Init的load 不出此loading
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        hash: 'patter', // 用于编辑成功后的数据回填
        load() {
            return [this.getList(null)]
        },
        getListParams() {
            this.model.set({
                loading: true,
            })

            return {
                teacherAccount: window.userInfo.userAccount,
            }
        },
        getList(options = {}) {
            const params = this.getListParams()

            return service.getQuickReplyLabels(params).then((response) => {
                const stateChange = {
                    dataSource: response,
                    total: response && response.length,
                    loading: false,
                }

                if (options == null) {
                    return stateChange
                } else {
                    this.model.set(stateChange)
                }
                
            })
        },
        add() {
            this.model.set({
                editType: 'add',
                editCnt: {
                    labelName: ''
                },
            })
        },
        edit(source) {
            const editCnt = {
                labelName: source.labelName,
            }

            this.model.set({
                editType: 'edit',
                editCnt,
            })
        },
        del(labelId) {
            const params = {
                labelId,
                teacherAccount: window.userInfo.userAccount,
            }

            Modal.confirm({
                title: '',
                content: '删除该标签将同时删除标签下的所有话术，请确保该标签下没有有用的话术信息，确认删除吗？',
                okText: '确认',
                onOk: () => {
                    service.delQuickReplyLabel(params).then((response) => {
                        // refresh
                        this.getList()
                    }, rst => {
                        message.error(rst)
                    })
                },
                cancelText: '取消',
            })
        },
        // 置顶、取消置顶
        top(labelId, top) {
            const params = {
                labelId,
                top,
                teacherAccount: window.userInfo.userAccount,
            }

            if (top === 1) {
                Modal.confirm({
                    title: '',
                    content: '确定置顶该标签吗？若已有置顶标签，将自动取消已有的标签置顶！',
                    okText: '确认',
                    onOk: () => {
                        service.adminTopLabel(params).then((response) => {
                            const txt = ['取消置顶', '置顶'][top]
                            message.info(`${txt}成功！`)
                            // refresh
                            this.getList()
                        }, rst => {
                            message.error(rst)
                        })
                    },
                    cancelText: '取消',
                })
            } else {
                service.adminTopLabel(params).then((response) => {
                    const txt = ['取消置顶', '置顶'][top]
                    message.info(`${txt}成功！`)
                    // refresh
                    this.getList()
                }, rst => {
                    message.error(rst)
                })
            }
        },
        closeModal(type = 'editType') {
            this.model.set({
                [type]: '',
            })
        },
        submitEdit(e) {
            const params = {
                ..._.pick(e, 'labelName'),
                teacherAccount: window.userInfo.userAccount,
            }

            const { editType } = this.model.toJSON()

            if (editType === 'add') {
                // 新增
                service.addQuickReplyLabel(params).then(response => {
                    this.closeModal()
                    // refresh
                    this.getList()
                }, rst => {
                    message.error(rst)
                })
            } else if (editType === 'edit') {
                params.labelId = this.model.get('dataSource')[this._editIndex].id
                // 编辑
                service.updateQuickReplyLabel(params).then(response => {
                    this.closeModal()
                    // refresh
                    this.getList()
                }, rst => {
                    message.error(rst)
                })
            }
        },
        inlineOper(evt = {}) {
            const { field, index } = evt
            const source = this.model.get('dataSource')[index]

            switch (field) {
                case 'edit':
                    this._editIndex = index
                    this.edit(source)
                    break
                case 'del':
                    this.del(source.id)
                    break
                case 'top':
                    this.top(source.id, Math.abs(source.top - 1))
                    break
                default: 
                    break
            }
        },
    }
}

const Tag = ComponentGenerator(componentProps)

export { 
    Tag
}