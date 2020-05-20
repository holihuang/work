import {service} from '../../../common/service';
import {common} from '../../../common/common';

import _ from 'lodash'

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    initialize: function() {

    }
});

var Modal = Backbone.View.extend({

    className: 'modal-dialog',

    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set(options);
    },

    events: {
        'click #addSubmit': 'handleAddSubmit',
        'click #configSubmit': 'handleConfigSubmit'
    },

    handleAddSubmit: function() {
        var params = common.getFormData({
            formId: 'form',
            hasCheckbox: true,
            checkboxName: 'roles'
        });

        const { userAccount, roles = [] } = params;

        if (/[\uff00-\uffff]/.test(decodeURIComponent(userAccount))) {
            alert('263账号中包含全角字符，请重新输入~');
            return;
        }

        // 4-班主任 11-值班老师 26-客诉老师
        if (_.intersection(['4', '12', '46'], roles).length > 1) {
            alert('一个用户只能拥有学院--班主任、学院值班老师、学院投退老师的一个权限，请重试！');
            return
        }

        service.addBackendAuthorityByUserAccount(params, (response) => {
            if (response.rs) {
                alert('新增成功');
                $('#closeModalBtn').trigger('click');
            } else {
                alert(response.rsdesp);
            }
        })
    },

    handleConfigSubmit: function() {
        var params = common.getFormData({
            formId: 'form',
            hasCheckbox: true,
            checkboxName: 'roles'
        });
        var {onConfigSuccess} = this.model.toJSON();

        const roles = params.roles || []

        // 4-班主任 11-值班老师 26-客诉老师
        if (_.intersection(['4', '12', '46'], roles).length > 1) {
            alert('一个用户只能拥有学院--班主任、学院值班老师、学院投退老师的一个权限，请重试！');
            return
        }

        service.configBackendAuthorityByUserAccount(params, (response) => {
            if (response.rs) {
                if (typeof onConfigSuccess == 'function') {
                    onConfigSuccess(params.status);
                }
                alert('修改成功');
                $('#closeModalBtn').trigger('click');
            } else {
                alert(response.rsdesp);
            }
        })
    },

    format(data) {
        var {operateType, roles, status, userAccount} = this.model.toJSON();
        var operate = operateType ? '新增' : '编辑';  //为1表示新增，为0表示编辑
        var readonly = operateType ? '' : 'readonly';  //编辑是263账号只读
        var submitName = operateType ? 'addSubmit' : 'configSubmit';

        if (status != undefined) {
            var activate = status ? 'checked' : ''; //status为1时为激活，0时为禁用
            var forbidden = status ? '' : 'checked';
        } else {
            var activate = 'checked';  //默认状态下为激活状态
            var forbidden = '';
        }

        roles.forEach((item, index) => {
            item.checked = item.flag ? 'checked' : '';
        });

        return {operate, readonly, activate, forbidden, roles, submitName, userAccount}
    },

    render: function() {
        var data = this.format(this.model.toJSON());

        this.$el.html(tpl(data));
        return this;
    }
})

export {Modal}
