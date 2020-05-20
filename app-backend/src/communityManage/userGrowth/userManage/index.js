import {service} from '../../../common/service';
import {Items} from './items/index';
import {AddPraiseDialog} from './addPraiseDialog/index';
import {Pager} from '../../../components/pager/index';

const PAGE_SIZE = 25;

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var UserManage = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change:resultList', this.renderResultList);
        this.listenTo(this.model, 'change:pageNo', this.renderPager);
        this.listenTo(this.model, 'change:pageSize', this.renderPager);
        this.render();
        this.getPageData();
    },

    events: {
        'click #addPraiseBtn': 'addPraise'
    },

    addPraise() {
        let {pageSize, pageNo} = this.model.toJSON();
        new AddPraiseDialog({
            onSuccess: () => {
                this.getPageData({pageSize, pageNo});
            }
        });
    },

    getPageData(options = {}) {
        let {pageNo = 1, pageSize = PAGE_SIZE} = options;
        service.listSunlandAmountRecord({
            pageNo,
            pageSize
        }, (response) => {
            if (response.rs) {
                let {pageIndex, pageCount, countPerPage, resultList} = response.resultMessage;
                this.model.set({
                    pageNo: pageIndex,
                    pageSize: countPerPage,
                    pageCount,
                    resultList
                });
            } else {
                alert(response.rsdesp);
            }
        })
    },

    renderResultList() {
        let {resultList} = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({
            el: this.$el.find('#resultListContainer')[0],
            resultList
        });
    },

    renderPager() {
        let {pageSize, pageNo, pageCount} = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer')[0],
            pageSize,
            pageNo,
            pageCount,
            onChange: this.getPageData.bind(this)
        })
    },

    render: function() {
        this.$el.html(tpl());
    }
});

export {UserManage}