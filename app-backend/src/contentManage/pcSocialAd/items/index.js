import {Dialog} from '../../../components/dialog/index';
import {service} from '../../../common/service';
import {common} from '../../../common/common';

var tpl = require('./tpl.html');
var updateTpl = require('../dialogTpl/update.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Items = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set(options);
    },

    events: {
        'click .update': 'update',  //更新
        'click .preview': 'preview',  //预览
        'click .delete': 'm_delete' //删除
    },

    //更新
    update(e) {  
        var that = this;
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var itemModel = resultList[index];

        var d = new Dialog({
            title: 'PC社区广告-更新素材',
            type: 2,
            content: updateTpl(itemModel),
            hasUploadPicBtn: true,
            uploadArr: [
                {
                    uploadPicBtnId: 'file',
                    imgUrlHolder: 'adImage',
                    fileNameHolder: 'fileName',
                    imgHolder: 'showPic'
                }
            ],
            ok: function() {
                var params = common.getFormData({formId: 'form'});
                params.skipType = 3;
                params.skipName = params.adLink;

                service.updatePcSocialAd(params, $.proxy(function(response) {
                    if (response.rs) { //更新成功
                        alert('更新成功');
                        that.initTableList();
                        this.closeDialog();
                    } else {
                        alert(response.rsdesp);
                    }
                }, this));
            }
        })
    },

    //预览
    preview(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var url = resultList[index].adImage;
        var d = new Dialog({
            title: '预览素材',
            type: 2,
            content: `<img src="${url}">`
        });
    },

    //删除
    m_delete(e) {
        var {resultList} = this.model.toJSON();
        var index = $(e.currentTarget).attr('index');
        var adId = resultList[index].adId;
        var params = {adId: adId, adType: 1};  //adType为1表示首页广告

        var that = this;

        if (confirm('确定要删除该素材吗？')) {
            service.deletePcSocialAd(params, function(response) {
                if (response.rs) {
                    alert('删除成功！');
                    //刷新列表
                    that.initTableList();
                } else {
                    alert('删除失败！');
                }
            })
        }
    },

    initTableList() {
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

    format(data) {
        var {resultList} = data;
        resultList.forEach((item, index) => {
            var status = item.status;
            switch (status) {
                case 0:
                    item.statusText = '展示结束';
                    break;
                case 1:
                    item.statusText = '展示中';
                    break;
                case 2:
                    item.statusText = '待展示';
                    break;
                default:
                    break;
            }

            item.index = index;
        })

        return {resultList}
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}
