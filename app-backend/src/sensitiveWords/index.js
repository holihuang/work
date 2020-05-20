import {service} from '../common/service';
import {common} from '../common/common';
import {Items} from './items/index';
import {AddDialog} from './dialog/addDialog/index';
import {Pager} from '../components/pager/index';
import {AllTypesDialog} from './dialog/allTypes/index';

var template = require('./tpl.html');

const PAGE_SIZE = 25;

var Model = Backbone.Model.extend({
    defaults: {}
})

var SensitiveWords = Backbone.View.extend({
    
    initialize: function() {
        this.render();
        this.model = new Model();
        this.listenTo(this.model, 'change:resultList', this.renderTableList);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.listenTo(this.model, 'change:pageNo', this.renderPager);

        this.initTableList();
    },

    events: {
        'click #searchBtn': 'search',
        'click #addSensitive': 'addSensitive',
        'click #getAllSensitiveTypesBtn': 'getAllSensitiveTypes'
    },

    getAllSensitiveTypes() {
        service.getAllSensitiveType({}, (response) => {
            let {resultMessage} = response;
            new AllTypesDialog({allSensitiveTypes: resultMessage, onSuccess: this.initTableList.bind(this)});
        })
    },
    search() {
        const { pageSize } = this.model.toJSON()
        this.getTableData({ pageSize, pageNo: 1 })
    },
    initTableList() {
        var userAccount = common.getUserInfo().userAccount;

        var params = {
            pageSize: PAGE_SIZE,
            pageNo: 1,
            userAccount
        };

        service.getAllSensitiveDictionary(params, (response) => {
            if (response.rs) {
                var {resultList, pageCount, countPerPage, pageIndex} = response.resultMessage;
                this.model.set({
                    pageSize: countPerPage,
                    pageNo: pageIndex,
                    resultList, 
                    pageCount
                });
            } else {
                alert('请求数据失败，请稍后重试');
            }
        })
    },

    getTableData(options) {
        const sensitiveWord = this.$el.find('#sensitiveWord').val().trim()
        var { pageSize, pageNo } = options;
        var userAccount = common.getUserInfo().userAccount;

        var params = {
            pageSize,
            pageNo,
            userAccount
        };
        if(sensitiveWord) {
            params.sensitiveWord = encodeURIComponent(sensitiveWord)
        }
        service.getAllSensitiveDictionary(params, (response) => {
            if (response.rs) {
                var {resultList, countPerPage, pageIndex, pageCount} = response.resultMessage;
                this.model.set({
                    resultList,
                    pageSize: countPerPage,
                    pageNo: pageIndex,
                    pageCount
                });
            } else {
                alert('请求数据失败，请稍后重试');
            }
        })
    },

    renderTableList() {
        var {resultList, pageSize, pageNo} = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({el: this.$el.find('tbody')[0], resultList, pageSize, pageNo});

        $('body').scrollTop(0);
    },

    renderPager() {
        var {pageCount, pageSize, pageNo} = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({el: this.$el.find('#pagerContainer')[0], pageCount, pageNo, pageSize, onChange: this.getTableData.bind(this)});
    },

    addSensitive: function() { //弹出新增窗口
        new AddDialog({
            onSuccess: this.initTableList.bind(this)
        });
    },

    render: function() {
        this.$el.html(template());
    }
})

export {SensitiveWords}