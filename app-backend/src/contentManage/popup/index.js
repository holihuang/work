/**
 * @file 首页弹窗
 * @author hualuyao
 */
import {service} from '../../common/service';
import {common} from '../../common/common';
import {Items} from './items/index';
import {Dialog} from '../../components/dialog/index';
import {PopupDialog} from './dialog/index';

var tpl = require('./tpl.html');
var dialogTpl = require('./dialogTpl/dialog.html');


var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Popup = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change:resultList', this.renderTableList);
        this.render();
        this.getTableListData();
    },

    events: {
        'click #addPopup': 'addPopup',         //新增首页弹窗广告
        'click #college': 'chooseCollege'  //选择学院
    },

    addPopup() {
        new PopupDialog({
            reqUrl: 'addPcSocialAd',
            onSuccess: this.getTableListData.bind(this)
        });
    },

    chooseCollege() {
        $('.college-container').toggleClass('hide');
    },

    getTableListData(pageNo = 1) {
        service.getPcSocialAd({
            adType: 2,  //2表示pc弹窗广告
            queryType: 'ALL',
            deleteFlag: 0
        }, (response) => {
            if (response.rs) {
                let resultList = response.resultMessage;

                this.model.set({resultList});
            }
        })
    },

    renderTableList() {
        var {resultList} = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({el: this.$el.find('tbody')[0], resultList});
    },

    render() {
        this.$el.html(tpl(this.model.toJSON()));
    }
})

export {Popup}