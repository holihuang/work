/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:38 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-03-07 20:16:30
 */
/**
 * @file test import react
 *
 * @auth gushouchuang
 * @date 2018-1-2
 */
import cloneDeep from 'lodash/cloneDeep'
import { ComponentGenerator } from '../../common/ReactBackbone'
import { message, Modal } from 'antd'
import indexComponent from './indexComponent'

import servicePromise from './service'
import { service } from '../../common/service'

const confirm = Modal.confirm;

const componentProps = {
    defaults: {
        dataSource: [],
        operateLogList: [],
        listParams: {
            title: '',
            contentType: '0',
            userType: '0',
            showTime: '',
            status: '0',
            pageSize: 10,
            pageNo: 1,
        },
        actInfo: {
            title: '',
            imageUrl: '',
            skipName: '',
            skipId: '',
            content: '',
            college: '',
            family: '',
            roundIds: '',
            corps: '',
            startTime: '',
            endTime: '',
        },
        operateLogVisible: false,  //操作日志modal
        previewVisible: false,  //图片预览modal
        userType: 1,
        contentType: '1',                   //跳转页面：1帖子详情 2话题详情 3活动页面
    },
    view: {
        el: document.getElementById('react-container'),
        Component: indexComponent,
        // life cyc
        preInit(options) {
            // this.uuuid = options.uuuid
        },
        load() {
            // @return {Array}
            // const state = this.model.toJSON()
            const params = {
                ...this.model.get('listParams'),
            }
            return [this.getHotActList(params)]
        },
        prepare(state) {
            // do somethings if you need 自行操作model
        },
        preRender() {
            // do somethings if you need
        },
        // 类似did mout
        initBehavior() {
            // do somethings if you need
        },
        tableReload(params = {}) {
            // get && extend model中存储的原请求参数
            params = {
                ...this.model.get('listParams'),
                pageNo: 1,
                ...params,
            }
            // 请求
            this.getHotActList(params).then((rst) => {
                const { dataSource, total } = rst
                this.model.set({
                    dataSource,
                    total,
                })
            })
            // set new params in model
            this.model.set({
                listParams: params
            }, {
                    silent: true
                })
        },
        //查看操作日志
        log(e) {
            this.getHotActivityOperationLog({ hotActivityId: e.row.hotActivityId })
        },
        //查看热门活动
        view(e) {
            this.getHotActivityById(e.row.hotActivityId, 'view')
        },
        //编辑热门活动
        edit(e) {
            this.getHotActivityById(e.row.hotActivityId, 'update')
        },
        //删除热门活动
        del(e) {
            const deleteHotActivity = this.deleteHotActivity.bind(this)
            confirm({
                title: '该活动还未到达展示时间，是否确认删除？删除后不可恢复。',
                okText: '确认删除',
                cancelText: '取消',
                onOk() {
                    return deleteHotActivity({hotActivityId: e.row.hotActivityId})
                },
                onCancel() { },
            });
        },
        //下线热门活动
        offline(e) {
            const offlineHotActivity = this.offlineHotActivity.bind(this)
            confirm({
                title: '该活动还未到达结束展示时间，确定要下线吗？下线后不可恢复！请谨慎操作！',
                okText: '确定下线',
                cancelText: '取消',
                onOk() {
                    return offlineHotActivity({hotActivityId: e.row.hotActivityId})
                },
                onCancel() { },
            });
        },
        query(e) {
            this.tableReload(e)
        },
        getSelectedFamilyList({ collegeSelectedList }) {
            const { family = [] } = this.model.toJSON()
            service.getSelectedFamilyList({
                schoolName: collegeSelectedList.join(',')
            }, (response) => {
                if (response.rs) {
                    this.model.set({ family: response.resultMessage })
                }
            })
            this.model.set({ collegeSelectedList })
        },

        changeContentType({ contentType }) {
            this.model.set({
                contentType
            })
        },
        getHotActList(params = {}) {
            return servicePromise.adminGetHotActivityList(params).then((response) => {
                let { resultList, totalCount } = response
                return {
                    dataSource: resultList,
                    total: +totalCount,
                }
            },(error) => {
                Modal.error({
                    title: error,
                })
            })
        },
        deleteHotActivity(params = {}) {
            const tableReload = this.tableReload.bind(this)
            return servicePromise.adminDeleteHotActivity(params).then((response) => {
                Modal.success({
                    title: '删除成功！',
                })
                tableReload()
            },(error) => {
                Modal.error({
                    title: error,
                })
            })
        },
        offlineHotActivity(params = {}) {
            const tableReload = this.tableReload.bind(this)
            return servicePromise.adminOfflineHotActivity(params).then((response) => {
                Modal.success({
                    title: '下线成功！',
                })
                tableReload()
            },(error) => {
                Modal.error({
                    title: error,
                })
            })
        },
        selectContentType(e) {
            this.model.set('queryContentType', +e)

            // 虽然没暴露组件实体，但允许注入state，也有点不规矩...
            // 想改变的子组件的state，一定要在此返回
            return {
                skipId: '',
                skipName: '',
            }
        },
        modalChange(e) {
            const { type, visible = false, actInfo = {}, others = {} } = e
            let modalTitle = '新增热门活动'
            if (type === 'update') {
                modalTitle = '更新热门活动'
                this.getSelectedFamilyList({ type: 'select', collegeName: '', collegeSelectedList: others.collegeSelectedList })
            } else if (type === 'view') {
                modalTitle = '查看热门活动'
            }
            this.model.set({
                modalType: type,
                modalTitle,
                addVisible: visible,
                collegeSelectedList: [],
                famlilySelectedList: [],
                checkedCorps: [],
                userType: 1,
                contentType: 1,
                actInfo,
                hotActivityId: '',
                ...others
            })
        },
        //获取活动详情
        getHotActivityById(hotActivityId, type = '') {
            servicePromise.adminGetHotActivityById({
                hotActivityId
            }).then((response) => {
                const { userType, contentType, college, family, corps } = response
                    this.modalChange({
                        type,
                        visible: true,
                        actInfo: response,
                        others: {
                            userType,
                            contentType,
                            checkedCorps: corps ? corps.split(',') : [],
                            collegeSelectedList: college ? college.split(',') : [],
                            famlilySelectedList: family ? family.split(',') : [],
                            hotActivityId,
                        }
                    })
            },(error) => {
                Modal.error({
                    title: error,
                })
            })
        },
        addHotActivity(params) {
            servicePromise.adminAddHotActivity({
                ...params
            }).then((response) => {
                this.modalChange({
                    visible: false,
                    others: {
                        reset: true
                    }
                })
                Modal.success({
                    title: !!params.hotActivityId ? '更新成功!' : '新增成功！',
                })
                this.tableReload()
            },(error) => {
                Modal.error({
                    title: error,
                })
            })
        },
        // updateHotActivity(params) {
        //     servicePromise.adminUpdateHotActivity({
        //         ...params
        //     }).then((response) => {
        //         this.modalChange({
        //             visible: false,
        //             others: {
        //                 reset: true
        //             }
        //         })
        //         Modal.success({
        //             title: '更新成功！',
        //         })
        //         this.tableReload()
        //     },(error) => {
        //         Modal.error({
        //             title: error,
        //         })
        //     })
        // },
        getHotActivityOperationLog(params) {
            servicePromise.getHotActivityOperationLog(params).then((response) => {
                this.model.set({
                    operateLogVisible: true,
                    operateLogList: response,
                })
            },(error) => {
                Modal.error({
                    title: error,
                })
            })
        },
        closeOperateLog() {
            this.model.set({
                operateLogVisible: false,
            })
        },
        //图片预览
        imgPreview({ previewVisible = false, previewImgUrl = '' } = {}) {
            this.model.set({
                previewVisible,
                previewImgUrl,
            })
        },
    }
}

const hotActivity = ComponentGenerator(componentProps)

export {
    hotActivity
}