/*
* @file: 公益项目
* @author: gushouchuang
* @date: 2019-12-09
* */
import { ComponentGenerator } from 'common/ReactBackbone'
import _ from 'lodash'
import { global } from 'common/global'
import { envCfg } from 'common/envCfg'
import component from './Welfare'
import service from './service'

const DEFAULT_PAGE_SIZE = 20

const componentProps = {
    defaults: {
        pageNo: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        list: [],
        logList: [],
        totalCount: 0,
        showLog: false,
    },
    view: {
        el: document.getElementById('react-container'),
        Component: component,
        hash: 'welfare',
        load() {
            return [this.getProjectList()]
        },
        initBehavior() {},
        add() {
            window.location.hash = 'commonwealEdit'
        },
        getProjectList(options = {}) {
            const {
                pageNo,
                pageSize,
            } = this.model.toJSON()
            const params = {
                countPerPage: pageSize,
                pageIndex: pageNo,
                ...options,
            }

            this.model.set({
                pageSize: params.countPerPage,
                pageNo: params.pageIndex,
            })

            return service.getProjectList(params).then(response => {
                this.model.set({
                    list: response.data,
                    totalCount: response.totalCount,
                })
            }, reject => {
                alert(reject)
            })
        },

        // 下线
        offline(projectId = '') {
            if (!projectId) {
                alert('操作失败。')
                return
            }

            const params = {
                projectId,
            }

            service.offlineProject(params).then(response => {
                this.getProjectList({
                    pageNo: 1,
                })
            }, reject => {
                alert(reject)
            })
        },
        // 预览 => 复制到剪切板
        preview(projectNo = '') {
            if (!projectNo) {
                alert('操作失败。')
                return
            }
            const oInput = document.createElement('input')
            oInput.style.position = 'absolute' // 避免在页面上显示出来，display: none会失效
            oInput.style.left = '-3000px'
            oInput.value = `${envCfg.communityH5}/community-pc-war/m/index.html?#/publicBenefitDetail/${projectNo}?isPreload=true` // 区分环境和前端理由
            document.body.appendChild(oInput)
            oInput.select() // 选择对象
            if (document.execCommand) {
                document.execCommand('Copy') // 执行浏览器复制命令
                alert('您已成功复制预览链接，请到手机中打开查看')
            } else {
                alert('对不起，您的浏览器不支持复制特性。')
            }
        },
        // 日志
        log(projectId = '') {
            if (!projectId) {
                alert('操作失败。')
                return
            }

            const params = {
                projectId,
            }

            service.getOperateLog(params).then(response => {
                this.model.set({
                    logList: response,
                    showLog: true,
                })
            }, reject => {
                alert(reject)
            })
        },

        closeLogModal() {
            this.model.set({
                showLog: false,
            })
        },

        // 主动的数据注入
        injectParams() {
            global.pageParams.caseHub = {
                ..._.pick(
                    this.model.toJSON(),
                    'pageNo',
                    'pageSize',
                    'pageSlistize',
                    'totalCount',
                    'showLog',
                    'logList',
                ),
            }
        },
    },
}

const Welfare = ComponentGenerator(componentProps)
export { Welfare }

