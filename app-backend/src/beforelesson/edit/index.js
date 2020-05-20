/**
 * @file 体验前置
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */
 
import { ComponentGenerator } from 'common/ReactBackbone'
import component from './BeforelessonEdit'

import { message } from 'antd';

import cfg from './cfg'
import service from '../service'

const LIST_FIELD = ['qa', 'teacher', 'class', 'region', 'subject', 'school']

let DEFAULT_KEYS = {}
// 初始化所有的列表属性
LIST_FIELD.forEach(item => {
    DEFAULT_KEYS[item] = {
        editType: '',
        editIndex: 0,
        detailType: '',
        detailIndex: 0, // 查看详情（视频）
        dataSource: [],
        total: 0,
        pageSize: 30,
        pageNo: 1,
    }
})

const componentProps = {
    defaults: {
        // majorId: 123, // 专业id
        // typeId: 2, // 分类id 1-研究生 2-本科 3-专科 4-资格
        type: 'basic', // 默认基础信息模块
        basic: {
            editType: 'edit', // 无add
        },
        ...DEFAULT_KEYS,
        loading: false,
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        load() {
            // 路由中的参数
            const { majorId, typeId } = this._options
            // 初始化的一部分
            this.model.set({
                majorId: +majorId,
                typeId: +typeId,
            })
            return [this.getBasic()]
        },
        initBehavior() {
            // 由于地域、科目依赖班型是否为空，所以初始化结束后主动请求班型的数据。
            this.tableRefresh({
                type: 'class'
            })
        },
        // get参数
        getGetReqParams(type) {
            const { majorId } = this.model.toJSON()
            type || (type = this.model.get('type'))
            const state = this.model.get(type)
            const { pageSize, pageNo } = state

            return {
                majorId,
                pageSize,
                pageNo,
            }
        },
        // del参数
        getDelReqParams(e) {
            const { type } = this.model.toJSON()
            const params = {}

            switch (type) {
                case 'qa': 
                    params.videoId = e.row.videoId
                    break
				case 'teacher':
                    params.teacherId = e.row.teacherId
					break
				case 'class':
                    params.majorId = this.model.get('majorId')
                    params.classId = e.row.classId
					break
                case 'school':
                    params.schoolId = e.row.schoolId
                    break
                default:
                    break
            }

            return params
        },
        // add edit参数
	    getEditReqParams(e, editType) {
            const { type, majorId, typeId } = this.model.toJSON()
            let params = {}
            let source = {}

            if (editType === 'add') {
                params.majorId = majorId // add 需要专业id
                
            } else if (editType === 'edit' && type !== 'basic') {
                const { dataSource, editIndex } = this.model.get(type)
                source = dataSource[editIndex]
            }

            switch (type) {
                case 'basic': 
                    params = {
                        majorId,
                        typeId,
                        majorName: e.majorName,
                        logoUrl: e.logoUrl[0].url,
                        majorFeature: e.majorFeature,
                        lessonFeatureUrl: e.lessonFeatureUrl && e.lessonFeatureUrl.length ? e.lessonFeatureUrl[0].url : '',
                        learnPlanUrl: e.learnPlanUrl && e.learnPlanUrl.length ? e.learnPlanUrl[0].url : '',
                        postIds: e.postIds,
                        operator: window.userInfo.userAccount,
                    }
                    // 研究生
                    if (typeId === 1) {
                        params.condition = e.condition
                        params.learnYears = e.learnYears
                        params.majorProperty = e.majorProperty
                        params.examTime = e.examTime
                    // 本科 专科
                    } else if ([2, 3].indexOf(typeId) > -1) {
                        params.degreeType = e.degreeType
                    // 资格
                    } else if (typeId === 4) {
                        params.introduction = e.introduction
                        params.condition = e.condition
                        params.examTime = e.examTime
                    }
                    break
                case 'qa': 
                    params = {
                        ...params,
                        title: e.title,
                        description: e.description,
                        coverUrl: e.coverUrl[0].url, // 视频封面
                        videoUrl: e.videoUrl[0].videoUrl, // 视频本身
                        videoImgUrl: e.videoUrl[0].url, // 视频第一帧
                    }
                    editType === 'edit' && (params.videoId = +source.videoId)
                    break
				case 'teacher':
					params = {
                        ...params,
						teacherName: e.teacherName,
                        feature: e.feature,
                        imageUrl: e.imageUrl[0].url,
					}
                    editType === 'edit' && (params.teacherId = +source.teacherId)
					break
                case 'class':
                    params = {
                        ...params,
                        majorId,
                        weight: +e.weight,
                        classFeature: e.classFeature,
                    }
                    editType === 'add' && (params.classId = +e.classId)
		            editType === 'edit' && (params.classId = +source.classId)
                    break
                case 'region':
                    params = {
                        ...params,
                        majorId,
						majorCode: e.majorCode,
			            examTime: e.examTime,
		            	school: e.school,
                    }
                    editType === 'edit' && (params.regionId = +source.regionId)
                    break
                case 'subject':
                    params = {
                        ...params,
                        majorId,
						courseDesc: e.courseDesc,
                    }
                    editType === 'edit' && (params.courseId = +source.courseId)
                    break
                case 'school':
                    params = {
                        ...params,
                        schoolName: e.schoolName,
                        schoolLogo: e.schoolLogo[0].url,
                        schoolUrl: e.schoolUrl[0].url,
                        introduction: e.introduction[0].url,
                    }
                    editType === 'edit' && (params.schoolId = +source.schoolId)
                    break
                default:
                    break
            }

            return params
        },
        // 切换模块页面
        modulChange(type) {
            this.model.set({
                type
            })
            // 地域、科目依赖班型，若班型为空，地域和科目不需要发送请求
            if (['region', 'subject'].indexOf(type) > -1 && this.model.get('class').dataSource.length === 0) {
                this.model.set({
                    [type]: {
                        ...this.model.get(type),
                        dataSource: [], // 直接置空
                    }
                })
            } else {
                // 除了基础信息，都要刷新列表
                type !== 'basic' && this.tableRefresh()
            }
        },
        // basic info
        getBasic() {
            const { typeId, majorId } = this.model.toJSON()
            const params = {
                typeId,
                majorId,
            }
            // 请求
            return service[cfg.serviceMap.basic.get](params).then(response => {
                // set new params in model
                const state = this.model.get('basic')
                return {
                    basic: {
                        ...state,
                        ...response,
                    },
                }
            })
        },
        // 刷新并回填请求参数到model
        tableRefresh(params = {}) {
            const type = params.type || this.model.get('type')

            params = {
                ...this.getGetReqParams(type),
                ...params,
            }

            const state = {
                ...this.model.get(type),
                ...params,
                type: this.model.get('type'), // fix携带type的case
            }

            // 无论触发源是啥，都在此统一更新请求参数到model
            this.model.set({
                [type]: state,
                loading: true, // 显示loading
            })

            // 请求
            service[cfg.serviceMap[type].get](params).then(response => {
                // set new params in model
                const { totalCount, resultList } = response
                const source = this.model.get(type)
                source.dataSource = resultList
                source.total = +totalCount

                const state = {
                    [type]: source,
                    loading: false,
                }

                if (type === 'class') {
                    // 需明示班型数据是否为空
                     state.classIsNone = resultList.length ? false : true
                }

                this.model.set(state)
            })
        },
        del(e) {
            const type = this.model.get('type')
            const params = this.getDelReqParams(e)
            if (confirm(cfg.delMap[type])) {
                service[cfg.serviceMap[type].del](params).then(response => {
                    // refresh
                    this.tableRefresh()
                }, () => {
                    alert('删除失败，请重试')
                })
            }
        },
        edit(e) {
            this.togEdit('edit')
            const type = this.model.get('type')
            const state = this.model.get(type)
            state.editIndex = e.index

            this.model.set({
                [type]: state
            })
        },
        detail(e) {
            this.togDetail('detail')
            const type = this.model.get('type')
            const state = this.model.get(type)
            state.detailIndex = e.index

            this.model.set({
                [type]: state
            })
        },
        submitEdit(e, editCompnent) {
            const type = this.model.get('type')
            const state = this.model.get(type)
		    const editType = state.editType
            const params = this.getEditReqParams(e, editType)

            if (editType === 'add') {
                // 新增
                service[cfg.serviceMap[type].add](params).then(response => {
                    this.togEdit('')
                    // refresh
                    this.tableRefresh()
                }, rst => {
                    console.error('新增失败，请重试')
                    alert(rst)
                })
            } else if (editType === 'edit') {
                // 编辑
                service[cfg.serviceMap[type].mod](params).then(response => {
                    if (type === 'basic') {
                        const { illegalIds, rightIds } = response
                        if (illegalIds.length) {
                            alert('以下id有重复/不存在/已删除/已屏蔽，已自动过滤：\n' + illegalIds.join(','))
                            // 我真的真的真的不想这么做~~ 还是要给业务低头
                            editCompnent.setState({
                                edit: {
                                    ...editCompnent.state.edit,
                                    postIds: rightIds.join(',')
                                }
                            })
                        } else { // 全部成功
                            message.info('编辑成功')
                        }

                    } else {
                        this.togEdit('')
                        // refresh
                        this.tableRefresh()
                    }
                }, rst => {
                    console.error('编辑失败，请重试')
                    alert(rst)
                })
            }
        },
        pageChange(e) {
            const listParams = {
                ...this.getGetReqParams(),
                pageSize: e.pageSize,
                pageNo: e.current,
            }

            this.tableRefresh(listParams)
        },
        // 列表的编辑tog
        togEdit(value) {
            const type = this.model.get('type')
            // 需要更新的模块信息
            const stateChange = {
                ...this.model.get(type)
            }

            stateChange.editType = value

            this.model.set({
                [type]: stateChange
            })
        },
        togDetail(value) {
            const type = this.model.get('type')
            // 需要更新的模块信息
            const stateChange = {
                ...this.model.get(type)
            }

            stateChange.detailType = value

            this.model.set({
                [type]: stateChange
            })
        },
    }
}

const BeforelessonEdit = ComponentGenerator(componentProps)

export { 
    BeforelessonEdit
}