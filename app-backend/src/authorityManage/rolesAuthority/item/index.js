import {Modal} from '../modal/index';
import {service} from '../../../common/service';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({

});

var Item = Backbone.View.extend({
    tagName: 'tr',

    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set(options);
    },

    events: {
        'click .configRoleBtn': 'configRole'
    },

    //弹出编辑角色弹窗
    configRole: function() {
        var operateType = 0;  //编辑为0
        var roleId = this.model.get('id');
        var {status, roleName, roleDesc} = this.model.toJSON();

        service.getMenuListByRoleId({
            roleId: roleId
        }, response => {
            if (response.rs) {
                var modal = new Modal({operateType, menuList: response.resultMessage, status, roleDesc, roleName, roleId});
                $('#myModal').children().length && $('#myModal').children().remove();
                $('#myModal').append(modal.render().el);
                $('#myModal').modal('toggle');
            }
        })
    },

    format(data) {
        data['statusText'] = data['status'] ? '启用' : '禁用';

        return data;
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
        return this;
    }
})

export {Item}