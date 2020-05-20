/*
* @file: 优质案例库
* @author: huanghaolei
* @date: 2018-09-13
* */
import { ComponentGenerator } from 'common/ReactBackbone'
import { global } from 'common/global'
import component from './component/CaseHub'
import service from './service'
import optionCfg from './cfg/optionCfg'

const DEFAULT_PAGE_SIZE = 50

const componentProps = {
    defaults: {
        pageNo: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        province: '',
        academy: '',
        majorList: [],
        majorName: '',
        education: '',
        sex: '',
        age: '',
        career: '',
        startTime: '',
        endTime: '',
        postId: '',
        studentId: '',
        // identityLabel: '',
        contentLabel: '',
        postSource: '',
        timeOrderFlag: 1,
        log: {
            showLog: false,
        },
        table: {},
        logList: [],
        careerList: optionCfg.careerList,
        publishState: -1,
        id: '',
        title: '',
        productType: -1,
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        hash: 'caseHub',
        load() {
            return [this.getMajorList()]
        },
        initBehavior() {
            return this.onQuery()
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
            }, reject => {
                alert(reject)
            })
        },
        onChangeProvince(opt) {
            const { province } = opt
            this.model.set({
                province,
            })
        },
        onChangeAcademy(opt) {
            const { academy } = opt
            this.model.set({
                academy,
            })
        },
        onChangeMajor(opt) {
            const { majorName } = opt
            this.model.set({
                majorName,
            })
        },
        onChangeEducation(opt) {
            const { education } = opt
            this.model.set({
                education,
            })
        },
        onChangeSex(opt) {
            const { sex } = opt
            this.model.set({
                sex,
            })
        },
        onChangeAge(opt) {
            const { age } = opt
            this.model.set({
                age,
            })
        },
        onChangeRangePicker(opt) {
            const { e: { value } } = opt
            const [startTime, endTime] = value
            this.model.set({
                startTime,
                endTime,
            })
        },
        onChangePostId(opt) {
            const { postId } = opt
            this.model.set({
                postId,
            })
        },
        onChangeTitle(opt) {
            this.model.set({
                ...opt,
            })
        },
        onChangeStudentId(opt) {
            const { studentId } = opt
            this.model.set({
                studentId,
            })
        },
        onChangeStudentName(opt) {
            const { studentName } = opt
            this.model.set({
                studentName,
            })
        },
        onChangeIdentityLabel(opt) {
            const { identityLabel } = opt
            this.model.set({
                identityLabel,
            })
        },
        onChangeContentLabel(opt) {
            const { contentLabel } = opt
            this.model.set({
                contentLabel,
            })
        },
        onChangePostSource(opt) {
            const { postSource } = opt
            this.model.set({
                postSource,
            })
        },
        onChangeProductType(opt) {
            this.model.set({ ...opt })
        },
        onChangeCareer(opt) {
            const { career } = opt
            let list = []
            let selectedCareer = ''
            if (career.includes('待定')) {
                list = optionCfg.careerList.slice(0, 1)
                selectedCareer = ['待定']
            } else {
                list = optionCfg.careerList
                selectedCareer = career
            }
            if (Array.isArray(selectedCareer) && !selectedCareer.length) {
                selectedCareer = ''
            }
            this.model.set({
                career: selectedCareer,
                careerList: list,
            })
        },

        onChangePublishState(opt) {
            const { publishState } = opt
            this.model.set({ publishState })
        },

        getLogList(params) {
            service.adminGetLog(params).then(response => {
                const logList = response
                this.model.set({
                    logList,
                })
            }, reject => {
                alert(reject)
            })
        },

        onClickLog(opt) {
            const { index, closeLogModal = false } = opt
            if (!closeLogModal) this.getLogList({ postId: index })
            // !closeLogModal && this.getLogList({ postId: index })
            this.model.set({
                log: { showLog: !closeLogModal },
            })
        },

        onClickDelete(opt) {
            const { index } = opt
            if (confirm('确定要删除吗？')) {
                service.adminDelPost({ postId: index }).then(response => {
                    alert('删除成功!')
                    this.onQuery()
                }, reject => {
                    alert(reject)
                })
            }
        },

        // 导出参数
        pickOutExportParams(opt) {
            const { filterFields = [] } = optionCfg
            const params = {}
            filterFields.forEach(item => {
                if (({}).hasOwnProperty.call(opt, item)) {
                    params[item] = opt[item]
                }
            })

            // 对rangePicker单独处理下，转化成startTime， endTime
            const { rangePicker = [] } = opt
            const [startTime, endTime] = rangePicker
            const { postId, studentId } = params
            return {
                ...params,
                startTime,
                endTime,
                postId: postId || -1,
                studentId: studentId || -1,
                timeOrderFlag: 1,
            }
        },

        // 主动的数据注入
        injectParams() {
            global.pageParams.caseHub = {
                ..._.pick(
                    this.model.toJSON(),
                    'pageNo',
                    'pageSize',
                    'province',
                    'academy',
                    'majorList',
                    'majorName',
                    'education',
                    'sex',
                    'age',
                    'startTime',
                    'endTime',
                    'postId',
                    'studentId',
                    'identityLabel',
                    'contentLabel',
                    'timeOrderFlag',
                    'table',
                    'log',
                    'logList',
                ),
            }
        },

        onClickEdit(opt) {
            const { index, id } = opt
            this.injectParams()
            window.location.hash = `/caseHub/add/edit/${index}/${id}`
        },

        onOrder(opt) {
            const { order = 'descend', pageNo, pageSize } = opt
            this.model.set({
                pageNo,
                pageSize,
                timeOrderFlag: order === 'ascend' ? 0 : 1,
            })
            this.onQuery()
        },

        onPageChange(opt) {
            this.model.set({ ...opt })
            this.onQuery()
        },

        onPageSizeChange(opt) {
            this.model.set({ ...opt })
            this.onQuery()
        },

        forTableList(arr = []) {
            const list = []
            arr.forEach(item => {
                const { postId } = item
                const isOnline = window.location.hostname.includes('am.sunlands.com')
                const luntanUrl = isOnline ? `http://luntan.sunlands.com/community-pc-war/#post/${postId}`
                    : `http://172.16.140.50:8000/community-pc-war/#post/${postId}`
                list.push({ ...item, luntanUrl })
            })
            return list
        },

        deleUselessParams(params) {
            const uselessParams = ['majorList', 'table', 'log', 'logList', 'dispatch', 'careerList']
            uselessParams.forEach(item => {
                if (({}).hasOwnProperty.call(params, item)) delete params[item]
            })
        },

        setDefaultValue(arr) {
            const defaultNumber = -1
            const obj = {}
            const model = this.model.toJSON()
            arr.forEach(item => {
                if (typeof model[item] === 'string' && !model[item].length) {
                    obj[item] = defaultNumber
                }
            })
            return obj
        },

        onQuery(opt = {}) {
            const { isQueryAll = false } = opt
            // const { hash } = window.location
            const params = {
                ...this.model.toJSON(),
            }

            const defaultNumberObj = this.setDefaultValue(['postId', 'studentId', 'id'])

            this.deleUselessParams(params)

            // 路由中有pageSize, pageNo
            let tempParams = params

            // 查询永远查全部
            if (isQueryAll) {
                tempParams = { ...tempParams, pageNo: 1, pageSize: 50 }
            }
            // 单独对pageSize处理
            if (!('pageSize' in tempParams) || !tempParams.pageSize) {
                tempParams.pageSize = DEFAULT_PAGE_SIZE
            }
            return service.adminFindPostInfo({ ...tempParams, ...defaultNumberObj }).then(response => {
                const {
                    countPerPage,
                    totalCount, pageCount,
                    pageIndex, resultList,
                } = response
                const formattedList = this.forTableList(resultList)
                this.model.set({
                    pageNo: pageIndex,
                    table: {
                        pageSize: countPerPage,
                        resultList: formattedList,
                        totalCount,
                        pageCount,
                    },
                })
            }, reject => {
                alert(reject)
            })
        },

        // 导出
        onExport(opt = {}) {
            const params = this.pickOutExportParams(opt)
            return service.exportGoodPost(params).then(response => {
                window.open(response)
            })
        },
        // id change
        onChangeId(opt = {}) {
            this.model.set({
                ...opt,
            })
        },
        // title change
        onChangeCaseTitle(opt = {}) {
            this.model.set({
                ...opt,
            })
        },
    },
}

const CaseHub = ComponentGenerator(componentProps)
export { CaseHub }

