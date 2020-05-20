import {service} from '../../../common/service';
import {Pager} from '../../../components/pager/index';
import {Items} from './items/index';
import {ProdDialog} from './prodDialog/index';
import {OperationLogDialog} from './operationLogDialog/index';
import {SellPeopleDialog} from './sellPeopleDialog/index';
import {Dialog} from '../../../components/dialog/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var ShangdeyuanManage = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change:pageNo', this.renderPager);
        this.listenTo(this.model, 'change:pageSize', this.renderPager);
        this.listenTo(this.model, 'change:resultList', this.renderResultList);
        this.render();
        this.getProductList();
    },

    events: {
        'click .update': 'updateProduct',
        'click .preview': 'previewProduct',
        'click #addProductBtn': 'addProduct',
        'click .check-sell-people': 'checkSellPeople',
        'click .checklog': 'checkLog'
    },

    addProduct() {
        let {pageSize, pageNo} = this.model.toJSON();
        new ProdDialog({
            type: 'add',
            onSuccess: () => {
                this.getProductList({pageSize, pageNo});
            }
        });
    },

    updateProduct(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList, pageSize, pageNo} = this.model.toJSON();
        new ProdDialog({
            type: 'update',
            prodInfo: resultList[index],
            onSuccess: () => {
                this.getProductList({pageSize, pageNo});
            }
        });
    },

    checkLog(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        let recordId = resultList[index].prodId;

        service.getOperationLog({
            operatorFunc: 'product',
            recordId
        }, (response) => {
            if (response.rs) {
                new OperationLogDialog({
                    resultList: response.resultMessage
                });
            } else {
                alert(response.resultMessage);
            }
        })
    },

    checkSellPeople(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        let {prodId} = resultList[index];
        service.getProductSellPeople({
            prodId
        }, (response) => {
            if (response.rs) {
                let {resultMessage} = response
                new SellPeopleDialog(resultMessage);
            } else {
                alert(response.rsdesp);
            }
        })
    },

    previewProduct(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        let {prodImage} = resultList[index];

        new Dialog({
            title: '商品图片',
            content: `<img src="${prodImage}">`,
            type: 2
        });
    },

    renderResultList() {
        let {resultList} = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({
            el: this.$el.find('#tableBoxContainer')[0],
            resultList
        })
    },

    renderPager() {
        let {pageNo, pageSize, pageCount} = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer')[0],
            pageNo,
            pageSize,
            pageCount,
            onChange: this.getProductList.bind(this)
        })
    },

    getProductList: function(options = {}) {
        let {pageNo = 1, pageSize = 25} = options;
        service.listProductByManage({
            pageNo,
            pageSize
        }, (response) => {
            if (response.rs) {
                let {resultList, pageIndex, pageCount, countPerPage} = response.resultMessage;
                this.model.set({
                    resultList,
                    pageNo: pageIndex,
                    pageCount,
                    pageSize: countPerPage
                })
            } else {
                alert(response.rsdesp);
            }
        })
    },

    render: function() {
        this.$el.html(tpl());
    }
})

export {ShangdeyuanManage}