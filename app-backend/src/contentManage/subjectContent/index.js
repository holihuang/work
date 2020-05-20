/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:38 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-03-06 16:47:56
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
        listParams: {
            postId: '',
            pageSize: 10,
            pageNo: 1,
        },
        queryContentType: 0,
        resultModalVisible: false,
    },
    view: {
        el: document.getElementById('react-container'),
        Component: indexComponent,
        // life cyc
        preInit(options) {
            // this.uuuid = options.uuuid
            const { subjectId, subjectName, allowOperate } = options
            this.subjectId = subjectId
            this.subjectName = subjectName
            this.allowOperate = allowOperate
            $('.sitemap-container').find('.active').removeClass('active');
            $('#subjectLink').parent().addClass('active').end()
            .parents('dl').removeClass('dl-fold');
        },
        load() {
            // @return {Array}
            // const state = this.model.toJSON()
            const params = {
                ...this.model.get('listParams'),
                subjectId: this.subjectId,
            }
            return [this.adminGetSubjectContentList(params)]
        },
        prepare(state) {
            // do somethings if you need 自行操作model
            this.model.set({
                subjectName: this.subjectName,
                subjectId: this.subjectId,
                allowOperate: this.allowOperate,
                listParams: {
                    ...this.model.get('listParams'),
                    subjectId: this.subjectId
                }
            }, {
                silent: true
            })
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
            delete params.contentType
            this.adminGetSubjectContentList(params).then((rst) => {
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
        selectContentType(e) {
            this.model.set('queryContentType', +e)

            // 虽然没暴露组件实体，但允许注入state，也有点不规矩...
            // 想改变的子组件的state，一定要在此返回
            return {}
        },
        //删除热门活动
        del(e) {
            const adminDeleteSubjectContent = this.adminDeleteSubjectContent.bind(this)
            const subjectId = this.subjectId
            confirm({
                title: '确定将该条内容从专题中移出吗？',
                okText: '确定',
                cancelText: '取消',
                onOk() {
                    return adminDeleteSubjectContent({ postId: e.row.postId, subjectId })
                },
                onCancel() { },
            });
        },
        query(e) {
            this.tableReload(e)
        },
        adminGetSubjectContentList(params = {}) {
            return servicePromise.adminGetSubjectContentList(params).then((response) => {
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
        adminDeleteSubjectContent(params = {}) {
            const tableReload = this.tableReload.bind(this)
            return servicePromise.adminDeleteSubjectContent(params).then((response) => {
                Modal.success({ title: '移出专题成功！', })
                tableReload()
            },(error) => {
                Modal.error({ title: error,  })
            })
        },
        modalChange(e) {
            const { visible = false } = e
            let modalTitle = '添加专题内容'
            this.model.set({
                modalTitle,
                addVisible: visible,
            })
        },
        resultModalChange(e) {
            const { visible = false } = e
            this.model.set({
                resultModalVisible: visible,
            })
        },
        adminAddSubjectContent(params) {
            const idCount = params.postIdList.split(',').length
            service.addSubjectContent({
                ...params
            }, (response) => {
                if (response.rs) {
                    const { succCount = 0, failCount = 0, failIdList = '' } = response.resultMessage || {}
                    const { rsdesp = 'id不存在或已在该专题中！' } = response || {}
                    if(idCount > 1) {
                        this.model.set({
                            success: failCount === 0,
                            resultModalVisible: true,
                            succCount,
                            failCount,
                            failIdList: failIdList.lastIndexOf(',') === failIdList.length - 1 ? failIdList.substr(0, failIdList.length - 1) : failIdList,
                            rsdesp,
                        })
                    } else {
                        if(failCount === 1) {
                            Modal.error({ title: rsdesp })
                        } else {
                            Modal.success({ title:'添加成功！' })
                        }
                    }
                    this.modalChange({
                        visible: false,
                    })
                    this.tableReload()
                } else {
                    Modal.error({ title: response.rsdesp, })
                }
            })
            // servicePromise.adminAddSubjectContent({
            //     ...params
            // }).then((result) => {
            //     const { succCount = 0, failCount = 0, failIdList = '', rsdesp = 'id不存在或已在该专题中！' } = result || {}
            //     if(idCount > 1) {
            //         this.model.set({
            //             success: failCount === 0,
            //             resultModalVisible: true,
            //             succCount,
            //             failCount,
            //             failIdList: failIdList.lastIndexOf(',') === failIdList.length - 1 ? failIdList.substr(0, failIdList.length - 1) : failIdList,
            //             rsdesp,
            //         })
            //     } else {
            //         if(failCount === 1) {
            //             Modal.error({ title: rsdesp })
            //         } else {
            //             Modal.success({ title:'添加成功！' })
            //         }
            //     }
            //     this.modalChange({
            //         visible: false,
            //     })
            //     this.tableReload()
            // },(error) => {
            //     Modal.error({ title: error, })
            // })
        },
    }
}

const subjectContent = ComponentGenerator(componentProps)

export {
    subjectContent
}