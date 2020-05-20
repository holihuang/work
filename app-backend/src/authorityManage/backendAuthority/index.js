import {Items} from './items/index';
import {service} from '../../common/service';
import {Modal} from './modal/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({});

var BackendAuthority = Backbone.View.extend({
    initialize: function() {
        this.model = new Model();
        this.listenTo(this.model, 'change:resultMessage', this.renderResultPanel);
        this.render();
    },

    events: {
        'click #searchBtn': 'searchUser',
        'click #addBtn': 'addUser'
    },

    searchUser: function() {
        var userAccount = $('#userAccount').val();
        if (userAccount) {
            service.getBackendAuthorityByUserAccount({
                userAccount: userAccount
            }, (response) => {
                if (response.resultMessage) {
                    this.model.set({resultMessage: response.resultMessage});
                } else {
                    alert('查询用户不存在！');
                }
            })
        } else {
            alert('请输入用户263账号！');
        }
    },

    //弹出新增用户弹窗
    addUser: function() {
        var operateType = 1;  //表示新增操作
        //获取角色列表
        service.getRolesList({}, response => {
            var roles = response.resultMessage;
            var modal = new Modal({operateType, roles});
            $('#myModal').children().length && $('#myModal').children().remove();
            $('#myModal').append(modal.render().el);
            $('#myModal').modal('toggle');
        })
    },

    renderResultPanel: function() {
        var {resultMessage} = this.model.toJSON();
        new Items({resultMessage, el: this.$el.find('#resultList')[0]});
    },

    render: function() {
        this.$el.html(tpl());
    }
})

export {BackendAuthority}