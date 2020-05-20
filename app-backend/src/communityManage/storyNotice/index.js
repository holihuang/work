/*
** @file: storyNotice
** @author: huanghaolei
** @date: 2019-10-15
*/
import { ComponentGenerator } from 'common/ReactBackbone'
import component from './StoryNotice'
import service from './service'
import paramsKeyCfg from './cfg/paramsKeyCfg'

const { addParamsKeyArr, queryParamsKeyArr } = paramsKeyCfg

const DEFAULT_PAGE_SIZE = 25

const addFilterDefatuls = {
    pushTitle_Add: '',
    pushContent_Add: '',
    contentType_Add: 1,
    contentId_Add: '',
    channel_Add: 'sharepush',
    file_Add: '',
    pushTime_Add: '',
    remark_Add: '',
}

const componentProps = {
    defaults: {
        pushTitle: '',
        operator: '',
        pushTimeStart: '',
        pushTimeEnd: '',
        channel_Add: 'sharepush',
        pageNo: 1,
        defaultPageSize: DEFAULT_PAGE_SIZE,
        pageSize: DEFAULT_PAGE_SIZE,
        ...addFilterDefatuls,
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        hash: 'storyNotice',
        load() {
            return []
        },
        initBehavior() {
            return this.getList()
        },

        getParams(str = 'query') {
            const model = this.model.toJSON()
            const params = {
                operator: window.userInfo.userAccount,
            }
            const mapSet = {
                query: queryParamsKeyArr,
                add: addParamsKeyArr,
            }
            mapSet[str].forEach(item => {
                const { key, needTrim = false } = item
                if (key in model) {
                    if (str === 'add') {
                        const [itm] = key.split('_')
                        params[itm] = needTrim ? model[key].trim() : model[key]
                    } else {
                        params[key] = needTrim ? model[key].trim() : model[key]
                    }
                }
            })
            return params
        },

        getList(opt = {}) {
            const params = this.getParams()
            return service.queryPushTask({ ...params, ...opt }).then(res => {
                const { pageIndex, countPerPage } = res
                this.model.set({
                    ...res,
                    pageNo: pageIndex,
                    pageSize: countPerPage,
                })
            }).catch(e => {
                alert(e)
            })
        },
        onChangePushTitle(opt = {}) {
            this.model.set(opt)
        },
        onChangeOperator(opt = {}) {
            this.model.set(opt)
        },
        onQuery(opt = {}) {
            this.getList(opt)
        },
        onChangeRangePicker(opt = {}) {
            this.model.set(opt)
        },
        onChangePager(opt = {}) {
            this.getList(opt)
        },
        onAdd(opt = {}) {
            this.model.set(opt)
        },
        onCloseCreateModal(opt) {
            this.model.set(opt)
        },
        onChangeAddFilter(opt = {}) {
            const { fields, value } = opt
            this.model.set({
                [fields]: value,
            })
        },
        onChangeAddSelectLinkage(opt = {}) {
            this.model.set(opt)
        },
        // 清除
        onClickDel(opt = {}) {
            return service.deletePushTask(opt).then(res => {
                alert('推送通知已删除')
                this.getList()
            }).catch(e => {
                alert(e)
            })
        },
        // 清除新建filter参数
        resetAddFilterParams(opt = {}) {
            this.model.set(addFilterDefatuls)
        },
        onChangeFile(opt = {}) {
            this.model.set(opt)
        },
        // 新建-发布|取消按钮组
        onCreateFormSubmit(opt = {}) {
            const model = this.model.toJSON()
            const params = this.getParams('add')
            // 验空
            for (let i = 0; i < addParamsKeyArr.length; i += 1) {
                const { isRequired, key, text } = addParamsKeyArr[i]
                const [fields] = key.split('_')
                if (isRequired) {
                    if (!params[fields]) {
                        alert(`${text}不能为空！`)
                        return
                    }
                }
            }
            const data = new FormData()
            Object.entries(params).forEach(arr => {
                const [key, value] = arr
                if (key === 'file') {
                    data.append(key, value, model.fileName)
                } else {
                    data.append(key, value)
                }
            })
            $.ajax({
                url: '/community-manager-war/server/post/createPushTask.action',
                type: 'post',
                data,
                dataType: 'json',
                processData: false,
                cache: false,
                contentType: false,
            }).done(res => {
                if (res.rs) {
                    this.onCloseCreateModal({ showCreateModal: false })
                    this.resetAddFilterParams()
                    this.getList()
                } else {
                    alert(res.rsdesp)
                }
            }).fail((jqXHR, textStatus) => {
                alert(jqXHR.responseText)
            })
        },
    },
}

const StoryNotice = ComponentGenerator(componentProps)

export { StoryNotice }
