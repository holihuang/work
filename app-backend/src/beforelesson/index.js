/**
 * @file 体验前置
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */
 
import { ComponentGenerator } from 'common/ReactBackbone'
import { global } from 'common/global'
import component from './Beforelesson'

import service from './service'

const componentProps = {
    defaults: {
        // edit
        editType: '',
        // log 查看详情
        logModal: '',
        detail: [],
        // filter
        majorName: '',
        typeId: -1,
        isHide: -1, // 传数字
        // 列表
        dataSource: [],
        pageSize: 30,
        pageNo: 1,
        loading: false, // 第一次Init的load 不出此loading
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        hash: 'beforelesson', // 用于编辑成功后的数据回填
        load() {
            return [this.getMajorList()]
        },
        getListParams() {
            return _.pick(
                this.model.toJSON(),
                'majorName', 'typeId', 'isHide', 'pageSize', 'pageNo',
            )
        },
        getMajorList() {
            const params = this.getListParams()

            return service.getMajorList(params).then((response) => {
                let { totalCount, resultList } = response
                return {
                    dataSource: resultList,
                    total: +totalCount,
                }
            })
        },
        tableRefresh(params = {}) {
            params = {
                ...this.getListParams(),
                ...params,
            }

            // 无论触发源是啥，都在此统一更新请求参数到model
            this.model.set({
                ...params,
                loading: true, // 显示loading
            })

            // 请求
            service.getMajorList(params).then(response => {
                // set new params in model
                let { totalCount, resultList } = response
                this.model.set({
                    dataSource: resultList,
                    total: +totalCount,
                    loading: false,
                })
            })
        },
        add() {
            this.model.set({
                editType: 'add',
            })
        },
        // 主动的数据注入
        injectParams() {
            global.pageParams.beforelesson = {
                ..._.pick(
                    this.model.toJSON(),
                    'isHide',
                    'majorName',
                    'typeId',
                    'pageSize',
                    'pageNo',
                )
            }
        },
        edit(e) {
            this.injectParams()
            // hash跳转
            location.hash = `#beforelesson/${e.row.typeId}/${e.row.majorId}`
        },
        stat(e) {
            const params = {
                majorId: e.row.majorId,
                operator: window.userInfo.userAccount,
                isHide: (+e.row.isHide + 1) % 2,
            }

            service.updateMajorStatus(params).then(response => {
                // refresh
                this.tableRefresh()
            }, () => {
                alert('请求失败，请重试')
            })
        },
        detail(e) {
            const params = {
                majorId: e.row.majorId,
            }
            this.model.set({
                logModal: 'detail',
                detail: [], // 先清空
            })
            service.getOperationLog(params).then(response => {
                // refresh
                this.model.set({
                    detail: response.map((item, index) => {
                        return {
                            ...item,
                            key: index + 1
                        }
                    }) || []
                })
            }, () => {
                alert('请求失败，请重试')
            })
        },
        del(e) {
            const params = {
                majorId: e.row.majorId,
                // operator: window.userInfo.userAccount,
            }
            if (confirm('确定要删除吗？请谨慎操作！')) {
                service.deleteMajor(params).then((response) => {
                    // refresh
                    this.tableRefresh()
                }, () => {
                    alert('删除失败，请重试')
                })
            }
        },
        query(e) {
            const listParams = {
                ...this.getListParams(),
                ..._.pick(e, 'isHide', 'majorName', 'typeId'),
                // 每次搜索 页码都重置回1
                pageNo: 1,
            }
            this.tableRefresh(listParams)
        },
        pageChange(e) {
            const listParams = {
                ...this.getListParams(),
                pageSize: e.pageSize,
                pageNo: e.current,
            }

            this.tableRefresh(listParams)
        },
        closeModal(type = 'editType') {
            this.model.set({
                [type]: '',
            })
        },
        submitEdit(e) {
            const params = {
                ..._.pick(e, 'majorName', 'typeId'),
                operator: window.userInfo.userAccount,
            }

            // 新增
            service.addMajor(params).then(response => {
                this.closeModal()
                // refresh
                this.tableRefresh()
            }, rst => {
                console.error('新增失败，请重试')
                alert(rst)
            })
        },

    }
}

const Beforelesson = ComponentGenerator(componentProps)

export { 
    Beforelesson
}