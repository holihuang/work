/**
 * @file 话术管理
 *
 * @auth gushouchuang
 * @date 2018-9-17
 */

import { ComponentGenerator } from 'common/ReactBackbone'
import { message, Modal } from 'antd'

import component from './Patter'
import service from './service'

const componentProps = {
    defaults: {
        importModal: false,
        importRst: {
            success: 0,
            fail: 0,
            url: '',
        },
        editType: '',
        editCntType: '', // '1'-文本 '2'-图片
        editCnt: {
            labelId: '',
        },
        labelId: '',
        searchContent: '',
        labelList: [], // 标签list
        // 列表
        dataSource: [],
        total: 0,
        pageSize: 10,
        pageNo: 1,
        loading: false, // 第一次Init的load 不出此loading
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        hash: 'patter', // 用于编辑成功后的数据回填
        load() {
            return [this.getList(null)]
        },
        initBehavior() {
            // 正在被编辑的索引
            this._editIndex = -1

            this.getQuickReplyLabels()
        },
        getListParams(options = {}) {
            // "top": "类型:Number 说明:0是非置顶，1是置顶，2全部"
            const reqParams = {
                ..._.pick(
                    this.model.toJSON(),
                    'labelId',
                    'searchContent',
                    'pageSize',
                    'pageNo',
                ),
                ...options,
            }

            this.model.set({
                loading: true,
                ...reqParams,
            })

            return {
                ...reqParams,
                teacherAccount: window.userInfo.userAccount,
                top: 2, // 永远查全部
            }
        },
        getQuickReplyLabels() {
            const params = {
                teacherAccount: window.userInfo.userAccount,
            }

            service.getQuickReplyLabels(params).then(response => {
                this.model.set({
                    labelList: response.map(item => ({
                        label: item.labelName,
                        value: item.id,
                    })),
                })
            })
        },
        getList(options = {}) {
            const params = this.getListParams(options)

            return service.getAllQuickReplys(params).then(response => {
                const { totalCount, resultList } = response

                const stateChange = {
                    dataSource: resultList,
                    total: +totalCount,
                    loading: false,
                }

                if (options == null) {
                    return stateChange
                }
                this.model.set(stateChange)
            })
        },
        add() {
            this.model.set({
                editType: 'add',
                editCntType: '',
                editCnt: {
                    labelId: '',
                    quickReplyContent: '',
                    remark: '',
                },
            })
        },
        edit(source) {
            const editCnt = {
                labelId: source.labelId,
                quickReplyContent: source.quickReplyContent,
                remark: source.remark,
            }
            // 图片类型，cnt字段更改
            if (source.type === 2) {
                editCnt.quickReplyContent = ''
                editCnt.imgCnt = source.quickReplyContent
            }

            this.model.set({
                editType: 'edit',
                editCnt,
                editCntType: `${source.type}`,
            })
        },
        submitEdit(e) {
            const params = {
                ..._.pick(
                    e,
                    'labelId',
                    'remark',
                ),
                quickReplyContent: encodeURIComponent(e.quickReplyContent),
                teacherAccount: window.userInfo.userAccount,
            }

            const { editType, editCntType } = this.model.toJSON()

            params.type = +editCntType
            // 如果是图片
            if (params.type === 2) {
                params.quickReplyContent = e.upload[0].url
            }

            if (editType === 'add') {
                // 新增
                service.addQuickReply(params).then(response => {
                    this.closeModal()
                    // refresh
                    this.getList({
                        pageNo: 1,
                    })
                }, rst => {
                    message.error(rst)
                })
            } else if (editType === 'edit') {
                params.id = this.model.get('dataSource')[this._editIndex].id
                // 编辑
                service.editQuickReply(params).then(response => {
                    this.closeModal()
                    // refresh
                    this.getList({
                        pageNo: 1,
                    })
                }, rst => {
                    message.error(rst)
                })
            }
        },
        changeEditCntType(value) {
            this.model.set({
                editCntType: value,
            })
        },
        del(id) {
            const params = {
                id,
                rank: '',
                teacherAccount: window.userInfo.userAccount,
            }

            Modal.confirm({
                title: '',
                content: '确定要删除话术吗？',
                okText: '确认',
                onOk: () => {
                    service.deleteQuickReply(params).then(response => {
                        // refresh
                        this.getList({
                            pageNo: 1,
                        })
                    }, rst => {
                        message.error(rst)
                    })
                },
                cancelText: '取消',
            })
        },
        // 置顶、取消置顶
        top(id, top) {
            const params = {
                id,
                top,
                teacherAccount: window.userInfo.userAccount,
            }

            service.topQuickReply(params).then(response => {
                const txt = ['取消置顶', '置顶'][top]
                message.info(`${txt}成功！`)
                // refresh
                this.getList({
                    pageNo: 1,
                })
            }, rst => {
                message.error(rst)
            })
        },
        closeModal(type = 'editType', value = '') {
            this.model.set({
                [type]: '',
            })
        },
        submitImport(e) {
            const uploadFileData = new FormData()

            uploadFileData.append('labelId', e.labelId)
            uploadFileData.append('teacherAccount', window.userInfo.userAccount)
            uploadFileData.append('data', e.upload.file, e.upload.name)

            $.ajax({
                url: '/community-manager-war/server/teachermessage/uploadQuickReplysFile',
                type: 'post',
                data: uploadFileData,
                dataType: 'json',
                processData: false,
                cache: false,
                contentType: false,
            }).done(response => {
                if (response.rs) {
                    this.closeModal('importModal')
                    const { resultMessage } = response

                    this.model.set('importRst', {
                        success: resultMessage.successCount || 0,
                        fail: resultMessage.failCount || 0,
                        url: resultMessage.linkUrl,
                    })
                    // refresh
                    this.getList({
                        pageNo: 1,
                    })
                } else {
                    message.error(response.rsdesp)
                }
            }).fail((jqXHR, textStatus) => {
                message.error(jqXHR.responseText)
            })
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
        operDetail(field) {
            switch (field) {
            case 'tag':
                window.location.hash = '#/tag'
                break
            case 'add':
                this.add()
                break
            case 'import':
                this.model.set({
                    importModal: true,
                })
                break
            default:
                break
            }
        },
    },
}

const Patter = ComponentGenerator(componentProps)

export { Patter }
