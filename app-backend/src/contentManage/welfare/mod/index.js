/*
* @file: edit
* @author: gushouchuang
* @date: 2018-09-18
* */
import { ComponentGenerator } from 'common/ReactBackbone'
import component from './WelfareEdit'
import service from '../service'

const componentProps = {
    defaults: {
        content: '',
        coverImageUrl: '',
        listImageUrl: '',
        effectTime: '',
        stuName: '',
        title: '',
        type: '',
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        hash: 'commonwealEdit(/:projectId)',
        preInit(options) {
            const { projectId = '' } = options
            this.__projectId = projectId
        },
        load() {
            if (this.__projectId) {
                return [this.getProjectDetail()]
            }
            return []
        },
        getProjectDetail(options = {}) {
            const params = {
                projectId: this.__projectId,
            }

            return service.getProjectDetail(params).then(response => {
                const {
                    content,
                    coverImageUrl,
                    listImageUrl,
                    effectTime,
                    stuName,
                    title,
                    type,
                } = response || {}
                this.model.set({
                    content,
                    coverImageUrl,
                    listImageUrl,
                    effectTime,
                    stuName,
                    title,
                    type,
                })
            }, reject => {
                alert(reject)
            })
        },
        submitEdit(e) {
            const {
                title,
                stuName,
                coverImageUrl,
                listImageUrl,
                content,
                effectTime,
            } = e

            const params = {
                projectId: this.__projectId || '', // 有值 则为编辑，为空 则为新建
                title,
                stuName,
                coverImageUrl: coverImageUrl[0].url || coverImageUrl,
                listImageUrl: listImageUrl[0].url || listImageUrl,
                content,
                type: effectTime.type,
                effectTime: effectTime.time ? `${effectTime.time}:00`.replace(/\//g, '-') : '', // 帮后端兼容时间格式
            }

            service.saveProject(params).then(response => {
                // 跳转到列表页
                window.location.hash = 'commonweal'
            }, reject => {
                alert(reject)
            })
        },
    },
}

const WelfareEdit = ComponentGenerator(componentProps)
export { WelfareEdit }
