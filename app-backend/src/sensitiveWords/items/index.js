import {common} from '../../common/common';
import {service} from '../../common/service';
import {Dialog} from '../../components/dialog/index';

var tpl = require('./tpl.html');
var updateTpl = require('../dialog/update.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Items = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        var {resultList, pageSize, pageNo} = options;
        this.model.set({resultList, pageSize, pageNo});
    },

    events: {
        'click .update': 'update', //更新
        'click .delete': 'deleteItem'
    },

    update(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var itemModel = resultList[index];

        var that = this;

        var d = new Dialog({
            title: '修改敏感词',
            type: 2,
            content: updateTpl(itemModel),
            ok: function() {
                var params = common.getFormData({formId: 'form'});

                service.updateSensitiveWord(params, $.proxy(function(response) {
                    if (response.rs) {
                        alert("更新成功！");
                        that.refreshData();
                        this.closeDialog();
                    } else {
                        alert(response.rsdesp);
                    }
                }, this));
            }
        })
    },

    deleteItem(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        let {sensitiveId, sensitiveName} = resultList[index];

        if (confirm(`确定要删除敏感词：${sensitiveName}吗？`)) {
            service.deleteSensitiveWord({
                sensitiveId
            }, (response) => {
                if (response.rs) {
                    alert('删除成功！');
                    this.refreshData();
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    //刷新列表
    refreshData() {
        var {pageSize, pageNo} = this.model.toJSON();

        var userAccount = common.getUserInfo().userAccount;

        var params = {
            pageSize,
            pageNo,
            userAccount
        };

        service.getAllSensitiveDictionary(params, (response) => {
            if (response.rs) {
                var resultList = response.resultMessage.resultList; 
                this.model.set({resultList});
            } else {
                alert('请求数据失败，请稍后重试');
            }
        })
    },

    format(data) {
        var {resultList} = data;
        resultList.forEach((item, index) => {
            item.index = index;
        })
        return {resultList};
    },

    render() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}