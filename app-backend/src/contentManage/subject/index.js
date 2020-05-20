/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:38 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-02-26 15:45:06
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
import { router } from '../../router';

const confirm = Modal.confirm;

const componentProps = {
    defaults: {
        dataSource: [],
        listParams: {
            userType: 0,
            status: 0,
            pageSize: 10,
            pageNo: 1,
        },
        subjectInfo: {
            subjectName: '',
            subjectAbstract: '',
            subjectImageUrl: '',
            subjectWeight: 0,
            college: '',
            family: '',
            roundIds: '',
            corps: '',
        },
        previewVisible: false,  //图片预览modal
        userType: 1,
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
            return [this.adminGetSubjectList(params)]
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
            this.adminGetSubjectList(params).then((rst) => {
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
        //查看
        view(e) {
            this.adminGetSubjectById(e.row.subjectId, 'view')
        },
        //编辑
        edit(e) {
            this.adminGetSubjectById(e.row.subjectId, 'update')
        },
        //下线
        offline(e) {
            const adminOfflineSubject = this.adminOfflineSubject.bind(this)
            confirm({
                title: '确认下线该专题吗？下线后该专题下的内容均不可见！请谨慎操作！',
                okText: '确定下线',
                cancelText: '取消',
                onOk() {
                    return adminOfflineSubject({ subjectId: e.row.subjectId })
                },
                onCancel() { },
            });
        },
        editContent(e) {
            const { subjectId, subjectName, status } = e.row
            const routHash = `subjectContent/${subjectId}/${subjectName}/${status}`
            location.hash = routHash
            // router.navigate(routHash, {
            //     trigger: true
            // });
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

        adminGetSubjectList(params = {}) {
            return servicePromise.adminGetSubjectList(params).then((response) => {
                let { resultList, totalCount } = response
                return {
                    dataSource: resultList,
                    total: +totalCount,
                }
            }, (error) => {
                Modal.error({
                    title: error,
                })
            })
        },
        adminOfflineSubject(params = {}) {
            const tableReload = this.tableReload.bind(this)
            return servicePromise.adminOfflineSubject(params).then((response) => {
                Modal.success({
                    title: '下线成功！',
                    content: '',
                })
                tableReload()
            }, (error) => {
                Modal.error({
                    title: error,
                })
            })
        },
        
        modalChange(e) {
            const { type, visible = false, subjectInfo = {}, others = {} } = e
            let modalTitle = '新增专题'
            if (type === 'update') {
                modalTitle = '更新专题'
                this.getSelectedFamilyList({ type: 'select', collegeName: '', collegeSelectedList: others.collegeSelectedList })
            } else if (type === 'view') {
                modalTitle = '查看专题'
            }
            this.model.set({
                modalType: type,                    //弹窗类型  add 新增，update 更新，view 查看
                modalTitle,                         //弹窗标题
                addVisible: visible,                //弹窗的显示隐藏
                collegeSelectedList: [],            //付费用户-选中的学院
                famlilySelectedList: [],            //付费用户-选中的家族
                checkedCorps: [],                   //免费用户-选中的归属
                userType: 1,                        //受众类型：1全部用户 2付费用户 3免费用户
                subjectInfo,
                subjectId: '', //保证新增时清空subjectId
                ...others
            })
        },
        //获取专题详情
        adminGetSubjectById(subjectId, type = '') {
            servicePromise.adminGetSubjectById({
                subjectId
            }).then((response) => {
                const { userType, college, family, corps } = response
                this.modalChange({
                    type,
                    visible: true,
                    subjectInfo: response,
                    others: {
                        userType,
                        collegeSelectedList: college.split(','),
                        famlilySelectedList: family.split(','),
                        checkedCorps: corps.split(','),
                        subjectId,
                    }
                })
            }, (error) => {
                Modal.error({
                    title: error,
                    content: '',
                })
            })
        },
        adminAddSubject(params) {
            servicePromise.adminAddSubject({
                ...params
            }).then((response) => {
                this.modalChange({
                    visible: false,
                    others: {
                        reset: true
                    }
                })
                Modal.success({
                    title: '新增成功！'
                })
                this.tableReload()
            }, (error) => {
                Modal.error({
                    title: error,
                    content: '',
                })
            })
        },
        adminUpdateSubject(params) {
            servicePromise.adminUpdateSubject({
                ...params
            }).then((response) => {
                this.modalChange({
                    visible: false,
                    others: {
                        reset: true
                    }
                })
                Modal.success({
                    title: '更新成功！'
                })
                this.tableReload()
            }, (error) => {
                Modal.error({
                    title: error,
                    content: '',
                })
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

const subject = ComponentGenerator(componentProps)

export {
    subject
}