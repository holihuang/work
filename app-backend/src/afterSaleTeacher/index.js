/**
 * @file 投退老师管理
 *
 * @auth gushouchuang
 * @date 2018-2-28
 */
 
import { ComponentGenerator } from 'common/ReactBackbone'
import _ from 'lodash'
import validate from 'common/core/validations'
import component from './afterSaleTeacher'

import service from './service'
import {service as commonService} from 'common/service';

const componentProps = {
    defaults: {
        // 学院/家族 (全部) 通用。
        collegeList: [],
        familyList: [],
        // edit相关
        editType: '',
        editIndex: 0,
        editFamilyList: [], // 编辑modal的
        // filter相关
        teacherAccount: '',
        deleteFlag: -1,
        familyName: '',
        familyId: '',
        schoolId: '',
        schoolName: '',
        filterFamilyList: [], // filter
        // 列表相关 可抽象
        dataSource: [],
        pageSize: 25,
        pageNo: 1,
        loading: false, // 第一次Init的load 不出此loading
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        load() {
            return [this.getTeacherList()]
        },
        initBehavior() {
            // 获取 学院/家族信息 - 非页面必要数据，做懒加载
            this.getAllColleges()
            this.getAllFamily()
        },
        getListParams() {
            return _.pick(
                this.model.toJSON(),
                'deleteFlag', 'teacherAccount', 'familyName', 'familyId', 'schoolName', 'schoolId', 'pageSize', 'pageNo',
            )
        },
        getTeacherList() {
            const params = this.getListParams()

            return service.getTeacherList(params).then((response) => {
                
                let { totalCount, resultList } = response
                return {
                    dataSource: resultList,
                    total: +totalCount,
                }
            })
        },
        // 刷新列表
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
            service.getTeacherList(params).then(response => {
                // set new params in model
                let { totalCount, resultList } = response
                this.model.set({
                    dataSource: resultList,
                    total: +totalCount,
                    loading: false,
                })
            })
        },
        pageChange(e) {
            const listParams = {
                ...this.getListParams(),
                pageSize: e.pageSize,
                pageNo: e.current,
            }

            this.tableRefresh(listParams)
        },
        add() {
            this.model.set({
                editType: 'add',
                // 将家族回填成全部。
                editFamilyList: [...this.model.get('familyList')]
            })
        },
        edit(e) {
            const { editFamilyList, familyList } = this.model.toJSON()
            // 请求一次当前学院下的家族
            if (e.row.schoolName) {
                // 通过学院名label去校验
                this.handleSchoolNameChange(e.row.schoolId, 'edit', true)
            }

            this.model.set({
                editType: 'edit',
                editIndex: e.index,
                editFamilyList: familyList, // 先置成全部 
            })
        },
        closeEdit() {
            this.model.set({
                editType: '',
            })
        },
        successHanlder() {
            this.closeEdit()
            // refresh
            this.tableRefresh()
        },
        // add/mod的save
        submitEdit(e) {
            const { editType, collegeList, editFamilyList } = this.model.toJSON()
            const params = _.pick(e, 'teacherAccount', 'teacherName')
            // 头像
            params.imgUrl = e.imgUrl[0].url
            // 学院 + 家族
            params.schoolId = e.schoolName
            params.familyId = e.familyName
            params.schoolName = this.getLabelByValue(collegeList, e.schoolName)
            params.familyName = this.getLabelByValue(editFamilyList, e.familyName)

            // 新增
            if (editType === 'add') {
                service.addTeacher(params).then(() => {
                    this.successHanlder()
                }, rst => {
                    rst = rst || '新增失败，请重试'
                    alert(rst)
                })
            } else if (editType === 'edit') {
                const { editIndex, dataSource } = this.model.toJSON()
                params.id = dataSource[editIndex].id

                service.modTeacher(params).then(() => {
                    this.successHanlder()
                }, rst => {
                    rst = rst || '修改失败，请重试'
                    alert(rst)
                })
            }
        },
        // 启用/禁用
        stat(e) {
            const params = {
                id: +e.row.id,
                deleteFlag: (+e.row.deleteFlag + 1) % 2,
                // operator: window.userInfo.userAccount,
            }
            // 由于最初设定的是删除，后pm改需求为状态，后端要复用删除服务，所以成了这样。
            service.delTeacher(params).then(response => {
                // refresh
                this.tableRefresh()
            }, () => {
                alert('删除失败，请重试')
            })
        },
        query(e) {
            const { collegeList, filterFamilyList, familyList } = this.model.toJSON()
            // 学院/家族 从index转成label
            let schoolName = e.schoolName || ''
            let schoolId = ''
            if (schoolName) {
                schoolId = schoolName
                schoolName = this.getLabelByValue(collegeList, schoolName)
            }
            let familyName = e.familyName || ''
            let familyId = ''
            // 有value，就要找到对应的label，没value表示全部，直接走空字符串。
            if (familyName) {
                familyId = familyName
                familyName = this.getLabelByValue(filterFamilyList, familyName)
            }
            const listParams = {
                ...this.getListParams(),
                ..._.pick(e, 'teacherAccount', 'deleteFlag'),
                familyName,
                familyId,
                schoolName,
                schoolId,
                // 每次搜索 页码都重置回1
                pageNo: 1
            }

            // 加邮箱格式校验
            if (!validate.isEmail(listParams.teacherAccount).rst) {
                alert('客诉老师263账号不符合邮件格式')
                return
            }

            this.tableRefresh(listParams)
        },
        // 针对学院/家族没有后端id，仅前端index，前端要做频繁的转译。
        getLabelByValue(source = [], value) {
            const target = source.find(item => item.value === value)

            return target ? target.label : ''
        },
        getValueByLabel(source = [], label) {
            const target = source.find(item => item.label === label)

            return target ? target.value : ''
        },
        // 格式化 学院/家族信息 => select.options
        formatOptions(list = []) {
            return list.map((item, index) => {
                return {
                    value: item.id, // id
                    label: item.value, // name
                }
            })
        },
        // 切换学院 => 家族变更
        handleSchoolNameChange(e, type = 'filter', isLabel = false) {
            const key = type === 'edit' ? 'editFamilyList' : 'filterFamilyList'
            
            // 选择了全部的学院 - 业务上不会出现'全部'，做个兼容吧
            if (['', '全部'].indexOf(e) > -1) {
                this.model.set({ // 走前端缓存，不再请求。
                    [key]: [...this.model.get('familyList')]
                })
            } else {
                // const collegeList = this.model.get('collegeList')
                // const targetLabel = isLabel
                //     ? e // 传进来的就是label
                //     : this.getLabelByValue(collegeList, e)

                service.listFamilyByCollege({
                    // schoolName: targetLabel
                    schoolId: e
                }).then(response => {
                    this.model.set({
                        [key]: [{
                            value: '',
                            label: type === 'filter' ? '全部' : '请选择家族'
                        },
                        ...this.formatOptions(response)]
                    })
                })
                
            }
            // 更新Filter里家族的state值 重置成'0'，filter cfg中的onchangecb也要return。
            return {
                familyName: ''
            }
        },
        //获取所有学院
        getAllColleges() {
            service.listAllCollege({}).then(response => {
                this.model.set({
                    collegeList: [...this.formatOptions(response)]
                })
            })
        },
        //获取所有家族
        getAllFamily() {
            service.listAllFamily({}).then(response => {
                const allFamilyList = [...this.formatOptions(response)]
                this.model.set({
                    familyList: allFamilyList,
                    filterFamilyList: allFamilyList,
                })
            })
        },
    }
}

const AfterSaleTeacher = ComponentGenerator(componentProps)

export { 
    AfterSaleTeacher
}