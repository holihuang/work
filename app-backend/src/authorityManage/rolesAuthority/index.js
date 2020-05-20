import {service} from '../../common/service';
import {Dialog} from '../../components/dialog/index';
import {Item} from './item/index';
import {Modal} from './modal/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var RolesAuthority = Backbone.View.extend({
    initialize: function() {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        service.getRolesList({}, (response) => {
            this.model.set({resultList: response.resultMessage});
        })
    },

    events: {
        'click #addRoleBtn': 'addRole'
    },

    updateList: function() {
        this.clearList(); //首先清空列表
        service.getRolesList({}, (response) => {
            this.model.set({resultList: response.resultMessage});
        })
    },

    clearList: function() {
        var childList = $('tbody').children();
        for (var i = childList.length; i > 1; ) {
            childList.eq(--i).remove();
        }
    },

    //弹出新增模态框
    addRole: function() {
        var operateType = 1;
        service.getMenuListByRoleId({
            roleId: ''
        }, response => {
            if (response.rs) {
                var modal = new Modal({operateType, menuList: response.resultMessage, onAddSubmitSuccess: this.updateList.bind(this)});
                $('#myModal').children().length && $('#myModal').children().remove();
                $('#myModal').append(modal.render().el);
                $('#myModal').modal('toggle');
            }
        })
    },

    format(data) {
        return data;
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        var {resultList} = data;
        this.$el.html(tpl());

        for (var i = 0, len = resultList.length; i < len; i++) {
            this.$el.find('tbody').append((new Item(resultList[i])).render().el);
        }
    }
})

export {RolesAuthority}