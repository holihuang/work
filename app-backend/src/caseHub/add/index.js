/*
* @file: add
* @author: huanghaolei
* @date: 2018-09-18
* */
import { ComponentGenerator } from 'common/ReactBackbone'
import { global } from 'common/global'
import component from '../component/CaseHubAdd'
import service from '../service'
import validateAddCfg from '../cfg/validateAddCfg'
import optionCfg from '../cfg/optionCfg'
import { EMOTION, EMOTION1 } from '../../common/emotionUtil'

const newPicStyleLong = 'style="width:100%;height:auto!important;"'
const previousStepTip = '编辑前请先设置案例关联的帖子id'
// 接口请求参数中不需要的字段
const commonUselessArrInAdd = ['majorList', 'table', 'log', 'logList', 'dispatch', 'pageNo', 'pageSize', 'careerList', 'identityLabel', 'identity', 'activeKey']
const componentProps = {
    // ！注意：在model添加数据时，onSave接口不相关参数记得同步到commonUselessArrInAdd中，方便保存时统一删除
    defaults: {
        pageNo: 1,
        pageSize: 50,
        province: '',
        academy: '',
        majorName: '',
        education: '',
        title: '',
        sex: '',
        age: '',
        postCreateTime: '',
        postId: '',
        studentId: '',
        studentName: '',
        // identityLabel: '',
        contentLabel: '',
        postSource: '',
        majorList: [],
        career: '',
        careerList: optionCfg.careerList,
        activeKey: '1',
        coverUrl: '',
        content: '', // 富文本
        productType: -1,
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        hash: 'caseHub/edit',
        load() {
            const caseHub = global.pageParams.caseHub || {}

            return [this.getMajorList(), this.onQuery({
                pageSize: caseHub.pageSize || 50,
                pageNo: caseHub.pageNo || 1,
            })]
        },
        deleteUselessParams(...args) {
            const [targetObj, uselessArr] = args
            uselessArr.forEach(item => {
                if (({}).hasOwnProperty.call(targetObj, item)) delete targetObj[item]
            })
        },
        transImgToAttr(...args) {
            const [imgStr, matchTag = 'pic'] = args
            const srcAttrReg = matchTag === 'pic' ? /^src=('|")?http/ : /^src=('|")?\.\/images/
            const tailTagReg = /\s?\/?>$/
            const tailTag = ' />'
            let isExtenalPicTag = false
            let isEmotionTag = false
            let srcAttr = ''
            const str = imgStr.replace(tailTagReg, tailTag)
            str.split(' ').forEach(item => {
                if (srcAttrReg.test(item)) {
                    srcAttr = item
                    if (matchTag === 'pic') {
                        // 外链图片
                        isExtenalPicTag = true
                    } else if (matchTag === 'emotion') {
                        isEmotionTag = true
                    }
                }
            })
            return {
                isExtenalPicTag,
                isEmotionTag,
                itm: str,
                srcAttr,
            }
        },
        addStyleAttr(...args) {
            const [str] = args
            const beReplacedStyle = newPicStyleLong
            const arr = str.trim().split(' ')
            arr.splice(arr.length - 1, 0, beReplacedStyle)
            let outStr = ''
            arr.forEach(item => {
                outStr += ` ${item}`
            })
            return outStr
        },
        transPicToFixedWidth(html) {
            const reg = /<img[^>]*>/
            const regWithGlobal = /<img[^>]*>/g
            const regStyle = /style="[^<>]*"/
            let output = html
            let oldPicArr = []
            const oldExternalPicArr = []
            const newPicArr = []
            if (reg.test(html)) {
                oldPicArr = [...html.match(regWithGlobal)]
                oldPicArr.forEach(item => {
                    const { isExtenalPicTag } = this.transImgToAttr(item)
                    if (isExtenalPicTag) {
                        let newPicItm = ''
                        const hasOldStyle = regStyle.test(item)
                        if (hasOldStyle) {
                        // 原有字符串有样式，做替换
                            const matchedStyle = item.match(regStyle)[0]
                            const beReplacedStyle = newPicStyleLong
                            newPicItm = item.replace(matchedStyle, beReplacedStyle)
                        } else {
                        // 原有字符串没样式，统一添加
                            newPicItm = this.addStyleAttr(item)
                        }
                        newPicArr.push(newPicItm)
                        oldExternalPicArr.push(item)
                    }
                })
                oldExternalPicArr.forEach((item, index) => {
                    output = output.replace(item, newPicArr[index])
                })
            }
            return output
        },
        transEmotionTxtWithEmotionPic(cnt) {
            // eslint-disable-next-line no-useless-escape
            const reg = /\[[^\[\]]*\]/
            // eslint-disable-next-line no-useless-escape
            const regGlobal = /\[[^\[\]]*\]/g
            const matchedEmotionArr = cnt.match(regGlobal) || []
            const newEmotionArr = []
            let str = cnt
            if (reg.test(str)) {
                matchedEmotionArr.forEach(item => {
                    const txt = item.slice(1, -1)
                    if (EMOTION[txt]) {
                        newEmotionArr.push(`<img src="./images/emotion-small/${EMOTION[txt]}.png">`)
                    }
                })
                newEmotionArr.forEach((item, index) => {
                    str = str.replace(matchedEmotionArr[index], item)
                })
            }
            return str
        },
        transEnterLineBreakTojsMode(cnt) {
            const reg = /\n/
            const regGlobal = /\n/g
            let str = cnt
            if (reg.test(cnt)) {
                const matchedEnterLineBreakArr = cnt.match(regGlobal)
                matchedEnterLineBreakArr.forEach(item => {
                    str = str.replace(item, '<br/>')
                })
            }
            return str
        },
        transToRichTxt(opt) {
            const { content, isRichText, externalLinks } = opt
            let cnt = ''
            let imgStr = ''
            if (Array.isArray(externalLinks)) {
                externalLinks.forEach(item => {
                    imgStr += `<img src=${item} style="width:100%;margin-bottom:10px;"><br>`
                })
            }
            if (isRichText) {
                cnt = content
            } else {
                cnt = `<p>${content}</p><br>${imgStr}`
            }
            // 兼容历史图片数据
            const decodedCnt = cnt.includes('<') ? cnt : decodeURIComponent(cnt)
            cnt = this.transPicToFixedWidth(decodedCnt)
            // 替换表情
            cnt = this.transEmotionTxtWithEmotionPic(cnt)
            // 过滤回车换行符
            cnt = this.transEnterLineBreakTojsMode(cnt)
            // 暂时通过'<'判断是否是加密过的
            return cnt.includes('<') ? cnt : decodeURIComponent(cnt)
        },
        onQuery(options = {}) {
            const params = {
                ...this.model.toJSON(),
                ...options,
            }
            let { postId = '', studentId = '' } = this.model.toJSON()
            const { hash } = window.location

            if (!postId.length) {
                postId = -1
            }

            if (!studentId.length) {
                studentId = -1
            }
            this.deleteUselessParams(params, commonUselessArrInAdd)

            if (!hash.includes('edit')) {
                return
            }

            postId = this.getIdFromUrl(2)

            return service.adminGetOnePostInfo({ ...params, postId, studentId }).then(response => {
                // 选中的数据回显
                const { content = '', isRichText = 1, externalLinks } = response
                const editData = {
                    ...response,
                    content: this.transToRichTxt({ content, isRichText, externalLinks }),
                }
                const { careerLabel = [] } = response
                if (careerLabel.includes('待定')) editData.careerList = ['待定'] // 职业-待定标签与其他标签互斥，回显项中包含待定的，单独处理下列表
                this.model.set({
                    ...editData,
                    career: careerLabel.includes('待定') ? ['待定'] : careerLabel,
                })
            }, reject => {
                alert(reject)
            })
        },
        formatMajorList(list = []) {
            return list.map(item => ({
                label: item,
                value: item,
            }))
        },
        getMajorList() {
            const params = {}
            return service.getMajorList(params).then(response => {
                const majorList = this.formatMajorList(response)
                this.model.set({
                    majorList,
                })
            })
        },

        transEmotionToZh(content) {
            const reg = /<img[^>]*>/
            const regWithGlobal = /<img[^>]*>/g
            let cnt = content
            if (reg.test(content)) {
                const imgArr = content.match(regWithGlobal)
                const emotionArr = []
                const emotionZhArr = []
                imgArr.forEach(item => {
                    const { isEmotionTag, srcAttr } = this.transImgToAttr(item, 'emotion')
                    if (isEmotionTag) {
                        emotionArr.push(item)
                        const [emotionEn] = srcAttr.split('/')[srcAttr.split('/').length - 1].split('.')
                        emotionZhArr.push(EMOTION1[emotionEn])
                    }
                })
                emotionArr.forEach((item, index) => {
                    cnt = cnt.replace(item, `[${emotionZhArr[index]}]`)
                })
            }
            return cnt
        },

        decodeEmotion(content) {
            const cnt = this.transEmotionToZh(content)
            return encodeURIComponent(cnt)
        },

        getParams() {
            const { content } = this.model.toJSON()
            const params = {
                ...this.model.toJSON(),
                content: this.decodeEmotion(content),
            }
            return params
        },

        onBlured(opt) {
            const content = this.transToRichTxt(opt)
            const {
                title,
                postCreateTime,
                studentId,
                postId,
                id,
            } = opt
            this.model.set({
                title,
                postCreateTime,
                studentId,
                postId,
                id,
                content,
            })
        },

        /*
        *@ flag: number
        *@ 1: caseId
        *@ 2: postId
        */
        getIdFromUrl(flag) {
            const { location: { hash } } = window
            const hashParamsArr = hash.includes('/') ? hash.split('/') : []
            return +hashParamsArr[hashParamsArr.length - `${flag}`]
        },

        onSave(opt) {
            const { tip, isTempSave = 0 } = opt
            const { userAccount = '' } = window.userInfo
            const { location: { hash = '' } } = window
            const { activeKey } = this.model.toJSON()
            const caseId = hash.includes('edit') ? this.getIdFromUrl(1) : -1
            const params = {
                ...this.getParams(),
                flag: window.location.hash.includes('edit') ? 0 : 1,
                isTempSave,
                teacherAccount: userAccount,
                id: caseId,
            }
            // // step 1 暂存：content强制置为空
            // if (isTempSave) {
            //     params = +activeKey === 1 ? { ...params, content: '' } : params
            // }
            this.deleteUselessParams(params, commonUselessArrInAdd)
            // 验空
            const modelJson = this.model.toJSON()
            const validateList = Object.keys(validateAddCfg) || []
            // 暂存不验空
            if (!+isTempSave) {
                for (let i = 0; i < validateList.length; i += 1) {
                    const key = validateList[i]
                    const {
                        isRequired, text, step = 1, defaultValue = 0,
                    } = validateAddCfg[key]
                    if (isRequired) {
                        // “请选择”有可能是-1
                        const isEmptyValue = +modelJson[key] === +defaultValue
                        if (Array.isArray(modelJson[key])) {
                            if (!modelJson[key].length) {
                                alert(`${text}必填`)
                                this.onChangeEditTabs({ key: `${step}` })
                                return
                            }
                        }
                        if (isEmptyValue) {
                            alert(`${text}必填`)
                            this.onChangeEditTabs({ key: `${step}` })
                            return
                        }
                    }
                }
            }

            // 暂存只需单独验帖子id不为空
            if (isTempSave) {
                if (!+modelJson.postId) {
                    alert('编辑前请先设置案例关联的帖子id')
                    return
                }
            }
            service.adminAddPost(params).then(response => {
                alert(tip)
                if (+isTempSave) {
                    // 暂存完step 1，跳转到step 2
                    if (+activeKey === 1) {
                        this.onChangeEditTabs({ key: '2' })
                    }
                } else {
                    window.location.hash = '/caseHub'
                }
            }, reject => {
                alert(reject)
            })
        },
        onSaveTableToModel(opt) {
            const { table } = opt
            this.model.set({ table })
        },
        onChangeProvinceAdd(opt) {
            const { province } = opt
            this.model.set({
                province,
            })
        },
        onChangeAcademyAdd(opt) {
            const { academy } = opt
            this.model.set({
                academy,
            })
        },
        onChangeMajorAdd(opt) {
            const { majorName } = opt
            this.model.set({
                majorName,
            })
        },
        onChangeEducationAdd(opt) {
            const { education } = opt
            this.model.set({
                education,
            })
        },
        onChangeSexAdd(opt) {
            const { sex } = opt
            this.model.set({
                sex,
            })
        },
        onChangeAgeAdd(opt) {
            const { age } = opt
            this.model.set({
                age,
            })
        },
        onChangeRangePickerAdd(opt) {
            const { e: { value } } = opt
            this.model.set({
                postCreateTime: value,
            })
        },
        onChangePostIdAdd(opt) {
            const { postId } = opt
            this.model.set({
                postId,
            })
        },
        onChangeTitleAdd(opt) {
            this.model.set({
                ...opt,
            })
        },
        onChangeStudentIdAdd(opt) {
            const { studentId } = opt
            this.model.set({
                studentId,
            })
        },
        onChangeStudentNameAdd(opt) {
            const { studentName } = opt
            this.model.set({
                studentName,
            })
        },
        onChangeCareerAdd(opt) {
            const { career } = opt
            let careerSelected = ''
            let list = []
            if (career.includes('待定')) {
                careerSelected = '待定'
                list = optionCfg.careerList.slice(0, 1)
            } else {
                careerSelected = career
                list = optionCfg.careerList
            }
            this.model.set({
                career: careerSelected,
                careerList: list,
            })
        },
        onChangeIdentityLabelAdd(opt) {
            const { identityLabel } = opt
            this.model.set({
                identityLabel,
            })
        },
        onChangeContentLabelAdd(opt) {
            const { contentLabel } = opt
            this.model.set({
                contentLabel,
            })
        },
        onChangePostSourceAdd(opt) {
            const { postSource } = opt
            this.model.set({
                postSource,
            })
        },
        onChangeProductTypeAdd(opt) {
            this.model.set({ ...opt })
        },
        onDataShowInEdit(opt) {
            const { data } = opt
            this.model.set({
                ...data,
            })
        },
        onChangeEditTabs(opt) {
            const { key } = opt
            const { postId } = this.model.toJSON()
            if (!+postId) {
                alert(previousStepTip)
                return
            }
            this.model.set({
                activeKey: key,
            })
        },
        onChangeRichText(opt) {
            const { content } = opt
            this.model.set({
                content,
            })
        },
        onUploadedCoverUrl(opt) {
            this.model.set({
                ...opt,
            })
        },
    },
}

const CaseHubAdd = ComponentGenerator(componentProps)
export { CaseHubAdd }
