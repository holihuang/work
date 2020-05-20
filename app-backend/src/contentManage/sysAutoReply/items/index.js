import {service} from '../../../common/service';
import {common} from '../../../common/common';
import {Dialog} from '../../../components/dialog/index';

var tpl = require('./tpl.html');
var logTpl = require('../dialogTpl/log.html');
var editTpl = require('../dialogTpl/edit.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Items = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.getAllAutoReplys();
    },

    events: {
        'click .checklog': 'checklog',  //查看
        'click .edit': 'edit',  //编辑
        'click .delete': 'deleteItem'  //删除
    },

    getAllAutoReplys() {
        var userAccount = common.getUserInfo().userAccount;
        service.getAllAutoReplys({
            account: userAccount
        }, (response) => {
            if (response.rs) {
                this.model.set({resultList: response.resultMessage});
            } else {
                alert(response.rsdesp);
            }
        })
    },

    checklog(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var item = resultList[index];
        var {rank} = item;

        service.viewAutoReplyLog({
            account: common.getUserInfo().userAccount,
            rank
        }, (response) => {
            if (response.rs) {
                var resultList = response.resultMessage;
                if (resultList.length) {
                    resultList.forEach((item, index) => {
                        item.order = index + 1;
                    });

                    new Dialog({
                        title: '操作日志',
                        type: 2,
                        content: logTpl({resultList})
                    })
                } else {
                    alert('该话术暂无更新信息~');
                }
            }
        })
    },

    edit(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var item = resultList[index];

        var that = this;

        new Dialog({
            title: '编辑自动回复话术',
            type: 2,
            content: editTpl(item),
            ok: function() {
                var autoReplyContent = $('#autoReplyContent').val();
                var contentLength = common.getCharNums(autoReplyContent);

                //按字节数来算
                if (contentLength > 400) {
                    alert('字数不能超过200字~')
                    return false;
                }

                var params = common.getFormData({
                    formId: 'form'
                });

                service.editAutoReply({
                    account: common.getUserInfo().userAccount,
                    ...params
                }, $.proxy((response) => {
                    if (response.rs) {
                        alert('编辑成功');
                        that.getAllAutoReplys();
                        this.closeDialog();
                    }
                }, this))
            }
        })
    },

    deleteItem(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var item = resultList[index];
        var {rank} = item;

        if (confirm('确定要删除该素材吗？')) {
            service.delAutoReply({
                account: common.getUserInfo().userAccount,
                rank
            }, (response) => {
                if (response.rs) {
                    alert('删除成功！');
                    this.getAllAutoReplys();
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    format(data) {
        var {resultList} = data;
        resultList.forEach((item, index) => {
            item.order = index + 1;
            item.index = index;
        })

        return {resultList}
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

export {Items}