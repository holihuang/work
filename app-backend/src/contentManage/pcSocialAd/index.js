import {service} from '../../common/service';
import {common} from '../../common/common';
import {Dialog} from '../../components/dialog/index';
import {Items} from './items/index';

var tpl = require('./tpl.html');
var addTpl = require('./dialogTpl/add.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
})

var PcSocialAd = Backbone.View.extend({
    initialize: function() {
        this.render();
        this.model = new Model();
        this.listenTo(this.model, 'change:resultList', this.renderTableList);
        this.initTableList();
    },

    events: {
        'click #addSocialAd': 'addSocialAd'
    },

    addSocialAd: function() {
        var that = this;

        var d = new Dialog({
            title: '新增社区广告',
            content: addTpl(),
            type: 2,
            hasUploadPicBtn: true,
            uploadArr: [
                {
                    uploadPicBtnId: 'file',
                    imgUrlHolder: 'adImage',
                    fileNameHolder: 'fileName'
                }
            ],
            ok: function() {
                var params = common.getFormData({formId: 'form'});
                params.skipType = 3; //表示跳转到url
                params.skipName = params.adLink;
                service.addPcSocialAd(params, $.proxy(function(response) {
                    if (response.rs) {
                        alert('添加成功！');
                        that.addSocialAdSubmitSuccess();
                        this.closeDialog();
                    } else {
                        alert(response.rsdesp);
                    }
                }, this));
            }
        })
    },

    addSocialAdSubmitSuccess: function() {
        this.initTableList();  //新增成功后刷新table list
    },

    //初始化table list
    initTableList: function() {
        //请求数据
        var params = {
            adType: 1,
            queryType: 'all',
            deleteFlag: 0
        };
        var that = this;
        service.getPcSocialAd(params, (response) => {
            if (response.rs) { //返回成功
                var resultMessage = response.resultMessage;
                this.model.set({resultList: resultMessage});
            }
        })
    },

    renderTableList() {
        var {resultList} = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({el: this.$el.find('tbody')[0], resultList});
    },

    render: function() {
        this.$el.html(tpl());
    }
})

export {PcSocialAd}
