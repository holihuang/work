import { service } from '../../../common/service'
import { common } from '../../../common/common'
import { Pager } from '../../../components/pager/index'
import { CfgOptDialog } from '../cfgOptDialog/index'
import { ContentItems } from '../contentItems/index'
import cfg from '../cfg'
import tpl from './tpl.html'

const PAGE_SIZE = 25

const datepickerCfg = {
    format: 'yyyy-mm-dd hh:ii:00',
    autoclose: true,
    todayBtn: true,
}

const stateList = [
    {
        value: 0,
        text: '审核失败',
    }, {
        value: 1,
        text: '待审核',
    }, {
        value: 2,
        text: '等待上线',
    }, {
        value: 3,
        text: '上线展示',
    }, {
        value: 4,
        text: '已下线',
    },
]

const Model = Backbone.Model.extend({
    defaults: {
        infoType: 1, // 类型，1-首页banner；2-app开屏；3-首页弹窗
        resultList: [],
        searchParams: {},
    },
})

const Opt = Backbone.View.extend({
    initialize(options = {}) {
        const { infoType } = options

        this.model = new Model()
        infoType && this.model.set({ infoType })

        this.listenTo(this.model, 'change:resultList', this.renderResultList)
        this.listenTo(this.model, 'change:pageCount', this.renderPager)
        this.render()
        this.getOptList()
    },

    events: {
        'click #collegeTab': 'goToCollegePage',
        'click #contentTab': 'goToCotentPage',
        'click #searchBtn': 'search',
        'click #clearBtn': 'clear',
        'click #addNewBtn': 'add',
        'focus #showTime': 'showDatetimepicker',
    },

    showDatetimepicker(e) {
        $(e.currentTarget).datetimepicker(datepickerCfg)
        $(e.currentTarget).datetimepicker('show')
    },

    goToCollegePage() {
        const { infoType } = this.model.toJSON()
        location.hash = `#opt/${infoType}/2`
    },

    goToCotentPage() {
        const { infoType } = this.model.toJSON()
        location.hash = `#opt/${infoType}/1`
    },

    getOptList(params = {}) {
        const { infoType, searchParams } = this.model.toJSON()

        const { pageSize = PAGE_SIZE, pageNo = 1 } = params
        service.adminGetOptList({
            infoType,
            pageSize,
            pageNo,
            ...searchParams,
        }, response => {
            if (response.rs) {
                const {
                    countPerPage, pageIndex, pageCount, totalCount, resultList,
                } = response.resultMessage

                this.model.set({
                    pageSize: countPerPage,
                    pageNo: pageIndex,
                    pageCount,
                    resultList,
                })
            } else {
                alert(response.rsdesp)
            }
        })
    },

    search() {
        const params = common.getFormData({
            formId: 'form',
        })

        this.model.set({
            searchParams: params,
        })

        const { pageSize, pageNo } = this.model.toJSON()

        this.getOptList({
            pageSize,
            pageNo,
        })
    },

    clear() {
        this.$el.find('.form')[0].reset()
    },

    add() {
        const { infoType, firstProject } = this.model.toJSON()

        new CfgOptDialog({
            infoType,
            callback: () => {
                const { pageSize, pageNo } = this.model.toJSON()
                this.getOptList({
                    pageSize,
                    pageNo,
                })
            },
        })
    },

    renderResultList() {
        const { resultList, infoType } = this.model.toJSON()

        this.contentTable && this.contentTable.destroy()
        this.contentTable = new ContentItems({
            resultList,
            infoType,
            refresh: () => {
                const { pageSize, pageNo } = this.model.toJSON()
                this.getOptList({
                    pageSize,
                    pageNo,
                })
            },
        })

        this.$el.find('#tableContainer').html(this.contentTable.$el)
    },

    renderPager() {
        const { pageSize, pageNo, pageCount } = this.model.toJSON()

        this.pager && this.pager.undelegateEvents()
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer')[0],
            pageSize,
            pageNo,
            pageCount,
            onChange: options => {
                const { pageNo, pageSize } = options
                this.getOptList({
                    pageNo,
                    pageSize,
                })
            },
        })
    },

    format(data) {
        const { infoType } = data
        // switch(+infoType) {
        //    case 1:
        //        data.title = '首页banner管理';
        //        break;
        //    case 2:
        //        data.title = 'APP开屏管理';
        //        break;
        //    case 3:
        //        data.title = '首页弹窗管理';
        //        break;
        //    default:
        //        break;
        // }

        data.title = cfg.title[infoType]

        data.stateList = [
            {
                text: '请选择内容状态',
                value: '',
            },
        ].concat(stateList)

        return data
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
    },
})

export { Opt }
