import {service} from '../../../common/service'
import {Pager} from '../../../components/pager/index'
import {ContentItems} from './contentItems/index'
import tpl from './tpl.html'

const PAGE_SIZE = 25

const Model = Backbone.Model.extend({
    defaults: {

    }
})

const DeleteRecord = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model()
        this.listenTo(this.model, 'change:resultList', this.renderResultList)
        this.listenTo(this.model, 'change:pageNo', this.renderPager)
        this.listenTo(this.model, 'change:pageSize', this.renderPager)
        this.render()
        this.getPageData()
    },

    events: {
        'click #downloadBtn': 'downloadImg'
    },

    downloadImg() {

    },

    getPageData(options = {}) {
        let {pageNo = 1, pageSize = PAGE_SIZE} = options
        service.listPicDelete({
            pageNo,
            pageSize
        }, (response) => {
            if (response.rs) {
                const {pageIndex, pageCount, countPerPage, resultList} = response.resultMessage
                this.model.set({
                    pageNo: pageIndex,
                    pageSize: countPerPage,
                    pageCount,
                    resultList
                })
            } else {
                alert(response.rsdesp)
            }
        })
    },

    renderResultList() {
        const {resultList} = this.model.toJSON()
        this.ContentItems && this.ContentItems.destory();
        this.ContentItems = new ContentItems({
            el: this.$el.find('#tableContainer'),
            resultList
        })
    },

    renderPager() {
        let {pageSize, pageNo, pageCount} = this.model.toJSON()
        this.pager && this.pager.undelegateEvents()
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer'),
            pageSize,
            pageNo,
            pageCount,
            onChange: this.getPageData.bind(this)
        })
    },

    render: function() {
        this.$el.html(tpl())
    }
})

export {DeleteRecord}