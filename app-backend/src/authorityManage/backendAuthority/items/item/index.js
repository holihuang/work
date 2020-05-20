import {Modal} from '../../modal/index';
import {service} from '../../../../common/service';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Item = Backbone.View.extend({
    tagName: 'tr',

    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set(options);
    },

    events: {
        'click .configBtn': 'config'
    },

    //弹出修改弹窗
    config: function() {
        var operateType = 0;  //表示编辑操作
        var userAccount = this.model.get('userAccount');
        var status = this.model.get('status');
        var userAccount = this.model.get('userAccount');
        //获取角色列表
        service.getRolesList({
            userAccount: userAccount
        }, response => {
            var roles = response.resultMessage;
            var modal = new Modal({operateType, roles, status, userAccount, onConfigSuccess: this.update.bind(this)});
            $('#myModal').children().length && $('#myModal').children().remove();
            $('#myModal').append(modal.render().el);
            $('#myModal').modal('toggle');
        })
    },

    //回调成功更新状态
    update: function(status) {
        this.model.set('status', status);
    },

    format(data) {
        var {status} = data;
        data['statusText'] = parseInt(status) ? '激活' : '禁用';

        return data;
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
        return this;
    }
})

export {Item}