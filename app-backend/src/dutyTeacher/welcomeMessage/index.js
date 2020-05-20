/**
 * @file 值班老师账号管理
 * @author hualuyao
 */
import {Search} from './search/index';
import {Items} from './items/index';
import {service} from '../../common/service';
import {Pager} from '../../components/pager/index';
import {WelcomeMessageDialog} from './welcomeMessageDialog/index';

const PAGE_SIZE = 25;

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var WelcomeMessage = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change:resultList', this.renderTable);
        this.listenTo(this.model, 'change:pageNo', this.renderPager);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.render();
        this.searchItem = new Search({el: this.$el.find('#searchPanel')[0]});
        this.items = new Items({el: this.$el.find('#tableContainer')[0], tip: '请选择查询条件进行查询~'});
    },

    events: {
        'click #searchBtn': 'search',
        'click #addWelcomeMessageBtn': 'addWelcomeMessage'
    },

    search() {
        //改变查询条件重新查询时，默认为第一页
        let params = this.searchItem.getSearchParams();  //获取查询参数
        service.listWelcomes({
            ...params,
            pageNo: 1,
            channelCode: 'CS_BACKGROUND',
            pageSize: PAGE_SIZE
        }, (response) => {
            if (response.rs) {
                let {resultList, countPerPage, pageIndex, pageCount} = response.resultMessage;
                this.model.set({
                    resultList,
                    pageSize: countPerPage,
                    pageCount,
                    pageNo: pageIndex
                });
            } else {
                alert(response.rsdesp);
            }
        })
    },

    addWelcomeMessage() {
        let {pageSize = PAGE_SIZE, pageNo = 1} = this.model.toJSON();
        new WelcomeMessageDialog({
            type: 'add',
            callback: () => {
                this.getPostListData({
                    pageSize,
                    pageNo
                });
            }
        })
    },

    renderTable() {
        let searchParams = this.searchItem.getSearchParams();
        let {resultList, pageSize, pageNo} = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({
            el: this.$el.find('#tableContainer')[0],
            resultList,
            pageSize,
            pageNo: 1,
            ...searchParams
        });
    },

    renderPager() {
        var {pageNo, pageSize, pageCount} = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer')[0],
            onChange: this.getPostListData.bind(this),
            pageNo,
            pageSize,
            pageCount
        });
    },

    getPostListData(options = {pageSize: PAGE_SIZE, pageNo: 1}) {
        let {pageSize, pageNo} = options;
        let searchParams = this.searchItem.getSearchParams();

        let params = {
            pageSize,
            pageNo,
            channelCode: 'CS_BACKGROUND',
            ...searchParams
        };

        service.listWelcomes({
            ...params
        }, (response) => {
            if (response.rs) {
                let {resultList, countPerPage, pageIndex, pageCount} = response.resultMessage;
                this.model.set({
                    resultList,
                    pageSize: countPerPage,
                    pageCount,
                    pageNo: pageIndex
                });
            } else {
                alert(response.rsdesp);
            }
        })
    },

    render: function() {
        this.$el.html(tpl());
    }
})

export {WelcomeMessage}