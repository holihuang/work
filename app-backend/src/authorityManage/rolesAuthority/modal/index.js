import {service} from '../../../common/service';
import {common} from '../../../common/common';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({

});

var Modal = Backbone.View.extend({
    className: 'modal-dialog',

    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set(options);
    },

    events: {
        'click #addRoleSubmitBtn': 'handleAddRoleSubmit',
        'click #configRoleSubmitBtn': 'handleConfigRoleSubmit'
    },

    handleAddRoleSubmit: function() {
        var params = common.getFormData({
            formId: 'form',
            hasCheckbox: true,
            checkboxName: 'menuList'
        });

        if (!params.roleName) {
            alert('请填写角色名称！');
            return;
        }
        if (!params.roleDesc) {
            alert('请填写角色描述！');
            return;
        }

        var onAddSubmitSuccess = this.model.get('onAddSubmitSuccess');

        service.addRoleByUserAccount({
            userAccount: common.getUserInfo().userAccount,
            ...params
        }, response => {
            if (response.rs) {
                alert('新增成功');
                $('#closeModalBtn').trigger('click');

                if (typeof onAddSubmitSuccess == 'function') {
                    onAddSubmitSuccess();  //新增成功回调函数
                }
            }
        })
    },

    handleConfigRoleSubmit: function() {
        var params = common.getFormData({
            formId: 'form',
            hasCheckbox: true,
            checkboxName: 'menuList'
        });

        service.configRoleByUserAccount({
            userAccount: common.getUserInfo().userAccount,
            ...params
        }, response => {
            if (response.rs) {
                alert('修改成功');
                $('#closeModalBtn').trigger('click');
            }
        })
    },

    format(data) {
        var {operateType, status, menuList} = data;
        var operate = operateType ? '新增' : '编辑'; //为1表示新增，为0表示编辑
        var readonly = operateType ? '' : 'readonly';
        var submitName = operateType ? 'addRoleSubmitBtn' : 'configRoleSubmitBtn';

        var activate,
            forbidden;

        if (status == undefined) {
            //新增
            //默认启用
            activate = 'checked';
            forbidden = '';
        } else {
            //编辑
            activate = status ? 'checked' : '';
            forbidden = status ? '' : 'checked';
        }

        menuList.forEach((item, index) => {
            if (item.funcId == 1) {//根节点默认选中
                item.flag = 1;
                item.disabledStatus = 'disabled';
            }
            item['checked'] = item.flag ? 'checked' : '';
        })

        return {operate, readonly, activate, forbidden, menuList, submitName, ...data};
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
        return this;
    }
})

export {Modal}