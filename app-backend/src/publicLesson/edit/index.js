/**
* @file 公开课新增|更新
* @author huanghaolei
* @date 2018-01-11
*
* */
import { ComponentGenerator } from '../../common/ReactBackbone'
import _ from 'lodash'
import moment from 'moment'

import service from '../service'
import component from './PublicLessonEdit'

const componentProps = {
    defaults: {
        dataSource: [],
        courseTagId: [], // 标签选中Id
        courseTagName: [], // 标签选中name
        courseRelatedList: [{
            label: '企业家直播课程',
            field: '',
            type: 'choseButton',
            btnText: '选择',
            choseType: 'liveCourse',
            choseValue: '',
            required: true,
        }, {
            label: '课程名称',
            field: 'lessonName',
            type: 'input',
            upperLimitWordNumber: '40',
            placeholder: '不超过40个字符',
            choseValue: '',
            required: true,
        }, {
            //label: '课程封面',
            //field: 'lessonCover',
            //type: 'upload',
            //uploadTxtArr: ['上传列表页封面', '上传播放页封面'],
            //lengthWidthRatioArr: ['(690*300,<60k)', '(690*388,<60k)'],
            //choseValue: ['',''],
            //required: true,
            //previewImageFirst: '',
            //previewImageSecond: '',
            //fileListFirst: [],
            //fileListSecond: [],

            label: '课程封面',
            field: 'lessonCover',
            type: 'upload',
            uploadTxtArr: ['上传封面'],
            lengthWidthRatioArr: ['(690*386,<60k)'],
            previewImage: '',
            fileList: [],
            choseValue: '',
            required: true,
        }, {
            label: '课程标签',
            field: 'labelName',
            type: 'choseTagButton',
            btnText: '选择',
            choseType: 'courseTag',
            choseValue: '',
        }, /*{
            label: '课程一句话介绍',
            field: 'lessonOneRemark',
            type: 'input',
            upperLimitWordNumber: '20',
            placeholder: '不超过20个字符',
            choseValue: '',
            required: true,
        }, */{
            label: '课程详情介绍',
            field: 'lessonDetailType',
            type: 'radio2',
            radioGroupVal: 1,
            radioTxtArr: ['文本形式', '包含图片形式'],
            choseValue: 1,
            required: true,
        }, {
            label: '上传图片',
            field: 'lessonDetailUrl',
            type: 'upload',
            uploadTxtArr: ['上传'],
            lengthWidthRatioArr: ['(750*任意,<150k)'],
            previewImage: '',
            fileList: [],
            choseValue: '',
            required: true,
            isShow: false,
        }, {
            label: '你可以得到',
            field: 'lessonHarvest',
            type: 'textarea',
            upperLimitWordNumber: '200',
            placeholder: '请说明通过该课程学员可以得到的帮助，不超过200个字符，支持空格和换行符',
            choseValue: '',
            required: true,
        }, {
            label: '课程简介',
            field: 'lessonRemark',
            type: 'textarea',
            upperLimitWordNumber: '1000',
            placeholder: '请输入对课程的介绍，不超过1000个字符，支持空格和换行符',
            choseValue: '',
            required: true,
        }, {
            label: '课程系列',
            field: 'lessonSeries',
            type: 'input',
            upperLimitWordNumber: '25',
            placeholder: '不超过25个字符',
            choseValue: '',
            required: true,
        }, {
            label: '课程来源',
            field: 'lessonSource',
            type: 'select',
            defaultValue: '请选择课程来源的学院',
            choseValue: '',
            required: true,
        }, {
            label: '讲师姓名',
            field: 'teacherName',
            type: 'input',
            upperLimitWordNumber: '10',
            placeholder: '不超过10个字符',
            choseValue: '',
            required: true,
        }, {
            label: '讲师头像',
            field: 'teacherImgUrl',
            type: 'upload',
            uploadTxtArr: ['上传'],
            lengthWidthRatioArr: ['(160*160,<40k)'],
            previewImage: '',
            fileList: [],
            choseValue: '',
            required: true,
        }, {
            label: "讲师一句话介绍",
            field: 'teacherOneRemark',
            type: 'input',
            upperLimitWordNumber: '20',
            placeholder: '不超过20个字符',
            choseValue: '',
        }, {
            label: '讲师简介',
            field: 'teacherRemark',
            type: 'textarea',
            upperLimitWordNumber: '100',
            placeholder: '请输入对讲师的介绍，不超过100个字符，支持空格和换行符',
            choseValue: '',
            required: true,
        }],
        courseContentList: [{
            label: '开课日期',
            field: 'lessonDate',
            type: 'dateInput',
            placeholder: '年/月/日',
            choseValue: '',
            required: true,
        },{
            label: '开课时间',
            field: 'lessonTime',
            type: 'dateTimeRange',
            placeholder: ['--:--','--:--'],
            choseValue: ['', ''],
            required: true,
        }, {
            label: '供应商',
            field: 'liveProvider',
            type: 'radio2',
            //radioGroupVal: 1,
            radioTxtArr: ['欢拓', '展视互动'],
            choseValue: '',
            required: true,
        }, {
            label: '课程直播间ID',
            field: 'liveWebcastid',
            type: 'numberInput',
            choseProviderVal: 1,
            placeholder: '欢拓填主播ID',
            choseValue: '',
            required: true,
            key: '',
        }],
        weixinShareList: [{
            label: '二维码跳转类型',
            field: 'codeJumpType',
            type: 'select',
            jumpToTypeList: ['小程序','H5'],
            defaultValue: '小程序',
            choseValue: '小程序',
            required: true,
        },{
            label: '分享配图',
            field: 'shareUrl',
            type: 'upload',
            uploadTxtArr: ['上传'],
            lengthWidthRatioArr: ['(550*880,<70k)'],
            previewImage: '',
            fileList: [],
            choseValue: '',
            required: true,
        }],
        lessonDate: '',
        lessonName: '',
        teacherName: '',
        choseLessonName: '',
        courseSourceList: [],
        listLoading: false, // 第一次Init的load 不出此loading
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        preInit(options) {},
        load() {
            // @return {Array}
            const type = this._options.type
            const id  = this._options.id
            this.model.set({ type, id })
            //return [this.getLessonsList(), this.getCourseSourceList(), (id && this.getUpdateData())]
            if(id) {
                return [/*this.getLessonsList(), */this.getCourseSourceList(), this.getUpdateData({id})]
            }
            return [/*this.getLessonsList(), */this.getCourseSourceList()]
        },
        prepare() {
            // do somethings if you need 自行操作model

        },
        preRender() {
          // do somethings if you need
        },
        // 类似did mout
        initBehavior()  {
          // do somethings if you need
        },
        getListParams() {
            return _.pick(
                this.model.toJSON(),
                'lessonDate',
                'lessonName',
                'teacherName'
            )
        },
        getLessonsList() {
            const params = this.getListParams()
            return service.getLiveLessonList(params).then((response) => {
                return {
                    dataSource: response
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
                listLoading: true, // 显示loading
            })

            // 请求
            service.getLiveLessonList(params).then((response) => {
                // set new params in model
                this.model.set({
                    dataSource: response,
                    listLoading: false,
                })
            })
        },
        query(e) {
            const listParams = {
                ...this.getListParams(),
                ..._.pick(e, 'lessonDate', 'lessonName', 'teacherName'),
            }
            //验空
            const { lessonDate, lessonName, teacherName } = listParams
            if(!lessonDate || !lessonName || !teacherName) {
                alert('请填写所有的查询条件，以保证能快速找到正确的课程')
                return
            }

            this.tableRefresh(listParams)
        },
       reDisplayUpdateData(updateInfo) {
           const { courseRelatedList, courseContentList, weixinShareList, } = this.model.toJSON()
           const listRelated = _.cloneDeep(courseRelatedList)
           const listContent = _.cloneDeep(courseContentList)
           const listWeixin = _.cloneDeep(weixinShareList)

           const strRelated = JSON.stringify(listRelated)
           const strContent = JSON.stringify(listContent)
           const strWeixin = JSON.stringify(listWeixin)

           let reg
           for(let key in updateInfo) {
               reg = new RegExp(`{[^}]*"field":"${key}"[^}]*}`, 'g')
               if(reg.test(strRelated)) {
                   listRelated.filter(item => item.field == key)[0].choseValue = updateInfo[key]
               }
               if(reg.test(strContent)) {
                   listContent.filter(item => item.field == key)[0].choseValue = updateInfo[key]
               }
               if(reg.test(strWeixin)) {
                   listWeixin.filter(item => item.field == key)[0].choseValue = updateInfo[key]
               }
           }
           const {liveId, id, labelName, labelId} = updateInfo

            //标签回填
           const courseTagId = []
           if(labelId.length) {
               if(labelId.indexOf(',') > -1) {
                   labelId.split(',').forEach(item => {
                       courseTagId.push({
                           value: +item,
                       })
                   })
               } else {
                   courseTagId.push({value: +labelId})
               }
           }
           let courseTagName
           if(labelName.length) {
               if(labelName.indexOf(',') > -1) {
                   courseTagName = labelName.split(',')
               } else {
                   courseTagName = [labelName]
               }
           }

            this.model.set({
                updateReturn: { liveId, id },
                courseTagId,
                courseTagName,
                courseRelatedList: listRelated,
                courseContentList: listContent,
                weixinShareList: listWeixin
            })
       },
        //更新拉取回填数据
        getUpdateData(params) {
            const { id } = params
            service.getPublicLessonById({id}).then(response => {
                const updateInfo = response
                this.reDisplayUpdateData(this.formatUpdateList(updateInfo))
            })
        },

        formatUpdateList(obj) {
            let { liveProvider, lessonDetailType, beginTime, endTime, imgUrl = '', playImgUrl = '', codeJumpType } = obj
            liveProvider = liveProvider == 'rye-teach' ? 1 : 2
            beginTime = moment(beginTime).format('HH:mm')
            endTime = moment(endTime).format('HH:mm')

            const lessonTime = [beginTime, endTime]
            // const lessonCover = [imgUrl, playImgUrl]
            const lessonCover = imgUrl
            lessonDetailType = +lessonDetailType
            codeJumpType = +codeJumpType === 1 ? 'H5' : '小程序'
            return {...obj, liveProvider, lessonTime, lessonDetailType, lessonCover, codeJumpType}
        },

        //获取课程来源列表
        getCourseSourceList() {
            service.getCourseSource({}).then(response => {

                this.model.set({
                    courseSourceList: ['请选择课程来源的学院'].concat(response)
                })
            })
        },
        liveCourseListRadioChecked(arr) {
            this.model.set({ dataSource: arr })
        },
        //选择直播课程
        getChoseCourse(params) {
            let { courseRelatedList, courseContentList } = this.model.toJSON()
            const list = _.cloneDeep(courseRelatedList)
            const arr = _.cloneDeep(courseContentList)
            const { choseTeacherName, choseLessonName, choseLiveProvider, choseLiveWebCastId, choseLiveId, choseLessonDate, choseBeginTime, choseEndTime } = params
            list.forEach(item => {
                if(item.label == '企业家直播课程') {
                    item.btnText = '修改'
                    item.choseValue = choseLessonName
                } else if(item.label == '讲师姓名') {
                    item.choseValue = choseTeacherName
                } else if(item.label == '课程名称') {
                    item.choseValue = choseLessonName
                }
            })
            arr.forEach(item => {
                if(item.label == '供应商') {
                    const liveProviderVal = choseLiveProvider == 'rye-teach' ? 1 : 2
                    item.choseValue = liveProviderVal
                } else if(item.label == '课程直播间ID') {
                    item.choseValue = choseLiveWebCastId
                } else if(item.label == '开课日期') {
                    item.choseValue = choseLessonDate
                } else if(item.label == '开课时间') {
                    item.choseValue = [choseBeginTime, choseEndTime]
                }
            })
            //list.filter(item => item.label == '企业家直播课程')[0].btnText = '修改'
            this.model.set({...params, courseRelatedList: list, courseContentList: arr, choseAddLiveId: choseLiveId})
        },
        //获取课程标签列表
        getCourseTag(params) {
            service.getLabelList(params).then(respose => {
                this.model.set({ courseTagList: respose })
            })
        },

        /*
        *  @setCourseTagSelected {function} 选中标签数组
        *
        * */
        setCourseTagSelected(params) {
            const { e, list } = params
            const arr = _.cloneDeep(list)
            //arr.filter(item => item.label == '课程标签')[0].btnText = '修改'
            const obj = arr.filter(item => item.label == '课程标签')[0]
            obj.btnText = '修改'
            const str = e.reduce((res, item, index) => {
                return res += `${item.label},`
            }, '')
            const courseTagName = e.map(item => {
                return item.label
            })
            const idStr = e.reduce((res, item, index) => {
                return res += `${item.value},`
            }, '')
            const courseTagId = e
            obj.choseValue = str.slice(0, str.length - 1)
            const labelId = idStr.slice(0, idStr.length - 1)
            this.model.set({
                courseTagName,
                courseTagId,
                courseRelatedList: arr,
                labelId,
            })
        },

        //更改input框的值同步修改数据
        changeIptVal(params) {
            const { label, val } = params
            const { courseRelatedList } = this.model.toJSON()
            const list = _.cloneDeep(courseRelatedList)
            list.filter(item => item.label == label)[0].choseValue = val
            this.model.set({ courseRelatedList: list })
        },
        //更改upload2-课程封面 previewUrl
        changeUpload2PreviewUrl(params) {
            const { first, second, name } = params
            const { courseRelatedList } = this.model.toJSON()
            const arr = _.cloneDeep(courseRelatedList)
            first && (arr.filter(item => item.label == name)[0].previewImageFirst = first)
            second && (arr.filter(item => item.label == name)[0].previewImageSecond = second)
            this.model.set({ courseRelatedList: arr })
        },
        //更改upload2 fileList
        changeUpload2FileList(params) {
            const { first, second, name } = params
            const { courseRelatedList } = this.model.toJSON()
            const list = _.cloneDeep(courseRelatedList)
            first && (list.filter(item => item.label == name)[0].fileListFirst = first)
            second && (list.filter(item => item.label == name)[0].fileListSecond = second)
            this.model.set({ courseRelatedList: list })
        },
          //更改upload1 previewUrl
         changeUpload1PreviewUrl(params) {
             const { previewImage, name, filterList } = params
             const { courseRelatedList } = this.model.toJSON()
             let list
             if(filterList) {
                 list = _.cloneDeep(filterList)
             } else {
                 list = _.cloneDeep(courseRelatedList)
             }
             list.filter(item => item.label == name)[0].previewImage = previewImage
             !filterList && this.model.set({ courseRelatedList: list })
             filterList && this.model.set({ weixinShareList: list })
         },
        //更改upload1 fileList
        changeUpload1FileList(params) {
            const { fileList, name, filterList } = params
            const { courseRelatedList } = this.model.toJSON()
            let list
            if(filterList) {
                list = _.cloneDeep(filterList)
            } else {
                list = _.cloneDeep(courseRelatedList)
            }
            list.filter(item => item.label == name)[0].fileList = fileList
            !filterList && this.model.set({ courseRelatedList: list })
            filterList && this.model.set({ weixinShareList: list })
        },
        // 删除upload2图片
        handleRemoveUpload2(params) {
            const { name, index } = params
            const { courseRelatedList } = this.model.toJSON()
            const list = _.cloneDeep(courseRelatedList)
            list.filter(item => item.label == name)[0].choseValue[index] = ''
            this.model.set({ courseRelatedList: list })
        },
        //删除upload1图片
        handleUpload1Remove(params) {
            const { name } = params
            const { courseRelatedList, courseContentList, weixinShareList } = this.model.toJSON()
            const reg = new RegExp(`{[^}]*"label":"${name}"[^}]*}`, 'g')

            const listRelated = _.cloneDeep(courseRelatedList)
            const listContent = _.cloneDeep(courseContentList)
            const listWeixinShare = _.cloneDeep(weixinShareList)

            const strRelated = JSON.stringify(listRelated)
            const strContent = JSON.stringify(listContent)
            const strWeixinShare = JSON.stringify(listWeixinShare)

            if(reg.test(strRelated)) {
                listRelated.filter(item => item.label == name)[0].choseValue = ''
            }
            if(reg.test(strContent)) {
                listContent.filter(item => item.label == name)[0].choseValue = ''
            }
            if(reg.test(strWeixinShare)) {
                listWeixinShare.filter(item => item.label == name)[0].choseValue = ''
            }
            this.model.set({ courseRelatedList: listRelated, courseContentList: listContent, weixinShareList: listWeixinShare })
        },
        //upload成功上传回调
        /*
        * @ type {Number} 上传类型 1: upload1, 2: upload2
        * @ index {Number} upload2上传图片索引 0,1
        * */
        uploadSuccessCallBack(params) {
            const { height, width, linkUrl, name, type, index, } = params
            const { courseRelatedList, courseContentList, weixinShareList } = this.model.toJSON()
            const reg = new RegExp(`{[^}]*"label":"${name}"[^}]*}`, 'g')

            const listRelated = _.cloneDeep(courseRelatedList)
            const listContent = _.cloneDeep(courseContentList)
            const listWeixin = _.cloneDeep(weixinShareList)

            const strRelated = JSON.stringify(listRelated)
            const strContent = JSON.stringify(listContent)
            const strWeixin = JSON.stringify(listWeixin)

            if(reg.test(strRelated)) {
                if(type == 1) {
                    listRelated.filter(item => item.label == name)[0].choseValue = linkUrl
                } else if(type == 2) {
                    listRelated.filter(item => item.label == name)[0].choseValue[index] = linkUrl
                }
            }
            if(reg.test(strContent)) {
                if(type == 1) {
                    listContent.filter(item => item.label == name)[0].choseValue = linkUrl
                } else if(type == 2) {
                    listRelated.filter(item => item.label == name)[0].choseValue[index] = linkUrl
                }
            }
            if(reg.test(strWeixin)) {
                if(type == 1) {
                    listWeixin.filter(item => item.label == name)[0].choseValue = linkUrl
                } else if(type == 2) {
                    listWeixin.filter(item => item.label == name)[0].choseValue[index] = linkUrl
                }
            }

            this.model.set({ courseRelatedList: listRelated, courseContentList: listContent, weixinShareList: listWeixin })
        },

        //切换radio
        /*
        *  @name {String} 'courseDetailDes', 'provider'
        *  @radioGroupVal {String} 1:文本，2：图片
        *  @radioGroupVal {String} 1:欢拓，2：展视互动
        *
        * */
        toggleCourseDetailDesRadio(params) {
            const { choseValue, name } = params
            const oldChoseValue = this.model.toJSON().courseContentList[2].choseValue
            if(name === '供应商') {
                if (choseValue === oldChoseValue) {
                    return
                }
            }
            const { courseRelatedList, courseContentList } = this.model.toJSON()
            //const list = _.cloneDeep(courseRelatedList)
            let list
            if(name == '课程详情介绍'){
                list = _.cloneDeep(courseRelatedList)
            } else if(name == '供应商') {
                list = _.cloneDeep(courseContentList)
            }
            list.filter(item => item.label == name)[0].choseValue = choseValue
            if(name == '供应商') {
                //list.filter(item => item.label == '课程直播间ID')[0].choseProviderVal = choseValue
                const liveWebcastid = list.filter(item => item.label == '课程直播间ID')[0]
                liveWebcastid.choseProviderVal = choseValue
                oldChoseValue === 0 || (liveWebcastid.choseValue = '')
            }

            if(name =='课程详情介绍') {
                list.forEach(item => {
                    if(+choseValue == 1) {
                        //文本
                        if(item.label == '上传图片') {
                            item.isShow = false
                        }
                        if(item.label == '你可以得到' || item.label == '课程简介' || item.label == '讲师头像' || item.label == '讲师简介') {
                           item.isShow = true
                        }
                    } else if(+choseValue == 2) {
                        //图片
                        if(item.label == '上传图片') {
                            item.isShow = true
                        }
                        if(item.label == '你可以得到' || item.label == '课程简介' || item.label == '讲师头像' || item.label == '讲师简介') {
                            item.isShow = false
                        }
                    }
                })
            }
            if(name == '课程详情介绍') {
                this.model.set({ courseRelatedList: list })
            } else if(name == '供应商') {
                this.model.set({ courseContentList: list })
            }
        },

        /*
        *  @courseSourceSelectChange {function} 下拉框
        * */
        courseSourceSelectChange(params) {
            const { choseValue, name } = params
            const { courseRelatedList, courseContentList, weixinShareList } = this.model.toJSON()
            const reg = new RegExp(`{[^}]*"label":"${name}"[^}]*}`, 'g')
            const listRelated = _.cloneDeep(courseRelatedList)
            const listContent = _.cloneDeep(courseContentList)
            const listWeixin = _.cloneDeep(weixinShareList)

            const strRelated = JSON.stringify(listRelated)
            const strContent = JSON.stringify(listContent)
            const strWeixin = JSON.stringify(listWeixin)

            if(reg.test(strRelated)) {
                listRelated.filter(item => item.label == name)[0].choseValue = choseValue
            }
            if(reg.test(strContent)) {
                listContent.filter(item => item.label == name)[0].choseValue = choseValue
            }
            if(reg.test(strWeixin)) {
                listWeixin.filter(item => item.label == name)[0].choseValue = choseValue
            }

            this.model.set({ courseRelatedList: listRelated, courseContentList: listContent, weixinShareList: listWeixin })
        },

        /*
        *  @value {String} 课程直播间ID
        *
        * */
        changeCourseLiveId(params) {
            const { value, name } = params
            const { courseContentList } = this.model.toJSON()
            const list = _.cloneDeep(courseContentList)
            list.filter(item => item.label == name)[0].choseValue = value
            this.model.set({ courseContentList: list })
        },

        /*
        *  @timeStr {String} 开课日期
        *
        * */
        changeCourseDate(params) {
            const { timeStr, name } = params
            const { courseContentList } = this.model.toJSON()
            const list = _.cloneDeep(courseContentList)
            list.filter(item => item.label == name)[0].choseValue = timeStr
            this.model.set({ courseContentList: list })
        },

        /*
        *  @timeStr {String} 开课时间
        * */
        changeCourseTime(params) {
            const { timeStr, name, idx } = params
            const { courseContentList } = this.model.toJSON()
            const list = _.cloneDeep(courseContentList)
            list.filter(item => item.label == name)[0].choseValue[idx] = timeStr
            this.model.set({ courseContentList: list })
        },

        /*
        *  @value {String} textArea文本值
        *
        * */
        handleTxtAreaValue(params) {
            const { name, value } = params
            const { courseRelatedList } = this.model.toJSON()
            const list = _.cloneDeep(courseRelatedList)
            list.filter(item => item.label == name)[0].choseValue = value
            this.model.set({ courseRelatedList: list })
        },

        validateEmpty(obj) {
            for(let key in obj) {
                for(let i = 0; i < obj[key].length; i++) {
                    let { choseValue, label, required } = obj[key][i]
                    if(!required) {
                        continue
                    }
                    if(choseValue instanceof Array) {
                        for(let j = 0; j < choseValue.length; j++) {
                            if(!choseValue[j]) {
                                alert(`${label}不能为空`)
                                return true
                            }
                        }
                    } else {
                        if(!choseValue) {
                            alert(`${label}不能为空`)
                            return true
                        }
                    }

                }
            }
            return false
        },

        formatValidateList() {
            const {type, courseRelatedList, courseContentList, weixinShareList,} = this.model.toJSON()
            let relatedList = _.cloneDeep(courseRelatedList)
            let contentList = _.cloneDeep(courseContentList)
            let weixinList = _.cloneDeep(weixinShareList)

            const { choseValue } = relatedList.filter(item => item.label == '课程详情介绍')[0]
            if(choseValue == 1) {
                relatedList = relatedList.filter(item => item.label !== '上传图片')
            } else if(choseValue == 2) {
                relatedList = relatedList.filter(item => item.label !== '你可以得到' && item.label !== '课程简介' && item.label !== '讲师头像'
                    && item.label !== '讲师简介')
            }
            //更新时，过滤掉企业家直播课程
            relatedList = type == 'edit' ? relatedList.slice(1) : relatedList

            return { relatedList, contentList, weixinList }
        },

        getSubmitParams() {
            const params = {}
            const { courseRelatedList, courseContentList, weixinShareList, updateReturn={}, choseAddLiveId, labelId } = this.model.toJSON()
            const { userAccount } = window.userInfo
            const { liveId, id } = updateReturn
            courseRelatedList.forEach((item, index) => {
                const { field, choseValue } = item
                params[field] = choseValue
            })
            courseContentList.forEach((item, index) => {
                const { field, choseValue } = item
                params[field] = choseValue
                if(field === 'liveProvider') {
                    params[field] = choseValue === 1 ? 'rye-teach' : 'gensee'
                }
            })
            weixinShareList.forEach((item, index) => {
                const { field, choseValue } = item
                params[field] = choseValue
                if(field === 'codeJumpType') {
                    params[field] = choseValue === 'H5' ? 1 : 2
                }
            })

            //单独处理 课程封面 && 开课时间
            const {lessonCover, lessonTime, lessonDate} = params
            // const [imgUrl, playImgUrl] = lessonCover
            const imgUrl = lessonCover
            let [beginTime, endTime] = lessonTime
            if(!_.isEmpty(updateReturn)) {
                //更新
                Object.assign(params, { liveId, id, })
            } else {
                //新增
                Object.assign(params, { liveId: choseAddLiveId })
            }
            beginTime = moment(`${lessonDate} ${beginTime}`).format('YYYY-MM-DD HH:mm:00')
            endTime = moment(`${lessonDate} ${endTime}`).format('YYYY-MM-DD HH:mm:00')
            Object.assign(params, { imgUrl, /*playImgUrl,*/ beginTime, endTime, operator: userAccount, labelId })

            const {lessonDetailType} = params
            const submitParams = _.cloneDeep(params)
            if(lessonDetailType === 1) {
                delete submitParams.lessonDetailUrl
            } else if(lessonDetailType === 2) {
                delete submitParams.lessonHarvest
                delete submitParams.lessonRemark
                delete submitParams.teacherImgUrl
                delete submitParams.teacherRemark
            }

            return submitParams
        },

        //提交
        questSubmit(options) {
            const params = this.getSubmitParams()
            const {type, id, courseRelatedList, courseContentList, weixinShareList, } = this.model.toJSON()

            const questUrl = type == 'edit' ? 'getUpdateCourse': 'getAddCourse'
            const tip = type == 'edit' ? '更新成功' : '新增成功'
            const {relatedList, contentList, weixinList} = this.formatValidateList()

            //验空
            const hasEmpty = this.validateEmpty({relatedList, contentList, weixinList})
            //开课时间需小于开课结束时间
            const listContent = _.cloneDeep(courseContentList)
            const [beginTime, endTime] = listContent.filter(item => item.label == '开课时间')[0].choseValue
            if(beginTime && endTime) {
                const beginTimeArr = beginTime.split(':')
                const endTimeArr = endTime.split(':')
                if(beginTimeArr[0] > endTimeArr[0]) {
                    alert('开始时间需小于结束时间')
                    return
                } else if(beginTimeArr[0] == endTimeArr[0]) {
                    if(beginTimeArr[1] >= endTimeArr[1]) {
                        alert('开始时间需小于结束时间')
                        return
                    }
                }
            }

            if(!hasEmpty) {
                service[questUrl](params).then(() => {
                    alert(tip)
                    window.location.hash = '#publicLesson'
                }, () => {

                })
            }
        },
    }
}

const PublicLessonEdit = ComponentGenerator(componentProps)

export {
    PublicLessonEdit
}
