/**
 * @file 公开课配置
 *
 * @auth gushouchuang
 * @date 2018-1-10
 */
 
import { ComponentGenerator } from 'common/ReactBackbone'
import { global } from 'common/global'
import component from './PublicLesson'

import service from './service'

const componentProps = {
    defaults: {
        dataSource: [],
        // 列表参数
        id: '',
        lessonName: '',
        teacherName: '',
        labelName: '',
        labelId: '',
        liveProvider: '0',
        lessonStatus: 0,
        pageSize: 30,
        pageNo: 1,
        // 查看详情
        detail: null,
        loading: false, // 第一次Init的load 不出此loading
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        hash: 'publicLesson',
        load() {
            return [this.getLessonsList()]
        },
        getListParams() {
            return _.pick(
                this.model.toJSON(),
                'id', 'lessonName', 'teacherName', 'labelName', 'liveProvider', 'lessonStatus', 
                'pageSize', 'pageNo', 'labelId',
            )
        },
        getLessonsList() {
            const params = this.getListParams()

            return service.getLessonsList(params).then((response) => {
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
            service.getLessonsList(params).then((response) => {
                // set new params in model
                let { totalCount, resultList } = response
                this.model.set({
                    dataSource: resultList,
                    total: +totalCount,
                    loading: false,
                })
            })
        },
        injectParams() {
            global.pageParams.publicLesson = {
                ..._.pick(
                    this.model.toJSON(),
                    'id',
                    'lessonName',
                    'teacherName',
                    'labelName',
                    'labelId',
                    'liveProvider',
                    'lessonStatus',
                    'pageSize',
                    'pageNo',
                )
            }
        },
        add() {
            this.injectParams()
            location.hash = '#publicLesson/add'
        },
        edit(e) {
            this.injectParams()
            location.hash = `#publicLesson/edit/${e.row.id}`
        },
        del(e) {
            const params = {
                id: e.row.id,
                operator: window.userInfo.userAccount,
            }
            if (confirm('确定要删除课程"' + e.row.lessonName + '"吗？删除后不可恢复，请谨慎操作！')) {
                service.delLessonsList(params).then((response) => {
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
                ..._.pick(e, 'id', 'lessonName', 'lessonStatus', 'liveProvider', 'teacherName'),
                labelName: e.labelName.map(item => item.label).join(','),
                labelId: e.labelName.map(item => item.value).join(','),
                // 每次搜索 页码都重置回1
                pageNo: 1
            }
            // Filter的校验暂时不放在底层
            if (listParams.id && !/^\d+$/.test(listParams.id)) {
                alert('课程ID格式错误，请填写纯数字！')
                return
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
        detail(e) {
            const params = {
                id: e.row.id,
            }
            service.getLessonDetail(params).then(response => {
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
        closeDetail() {
            this.model.set({
                detail: null
            })
        },
    }
}

const PublicLesson = ComponentGenerator(componentProps)

export { 
    PublicLesson
}