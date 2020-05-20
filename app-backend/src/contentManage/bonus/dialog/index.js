import {Dialog} from '../../../components/dialog/index';
import {service} from '../../../common/service';
import {common} from '../../../common/common';
require('datepicker/js/bootstrap-datetimepicker.js');

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var View = Backbone.View.extend({
    initialize: function(options = {}) {
        this.model = new Model();
        this.model.set({...options});
        this.render();
    },

    events: {
        'click #startTime': 'showSTDatepicker',
        'click #endTime': 'showETDatepicker'
    },

    showSTDatepicker() {
        $('#startTime').datetimepicker({
            format: 'yyyy-mm-dd hh:ii:00',
            autoclose: true,
            todayBtn: true,
            minView: 'hour'
        });
        $('#startTime').datetimepicker('show');
    },

    showETDatepicker() {
        $('#endTime').datetimepicker({
            format: 'yyyy-mm-dd hh:ii:00',
            autoclose: true,
            todayBtn: true,
            minView: 'hour'
        });
        $('#endTime').datetimepicker('show');
    },

    format(data) {
        let {userType, annId} = data;
        switch(userType) {
            case 0: //免费用户
                data.freeUserChecked = 'checked';
                break;
            case 1: //vip
                data.vipUserChecked = 'checked';
                break;
            case 2: //all
                data.allUserChecked = 'checked';
                break;
            default:
                data.allUserChecked = 'checked';  //默认受众对象为全部用户
                break;
        }

        if (annId) {
            //说明是对已有素材进行更新
            data.readonly = 'readonly';
            data.disabled = 'disabled';
        }

        return data;
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

var BonusDialog = function(options = {}) {
    let {type, item = {}, callback} = options;
    this.type = type;
    this.callback = callback;
    if (type == 'update') {
        //说明是更新
        this.view = new View({...item});
    } else {
        //说明是新增
        this.view = new View();
    }
    this.show();
}
BonusDialog.prototype.show = function() {
    var that = this;
    var d = new Dialog({
        title: '福利活动',
        content: that.view.$el,
        type: 4,
        ok: function() {
            let data = common.getFormData({
                formId: 'form'
            });
            //提交
            let req = that.type == 'update' ? 'updateAnnouncement' : 'insertAnnouncement';
            service[req](data, (response) => {
                if (response.rs) {
                    alert('操作成功！');
                    //新增成功
                    if (typeof that.callback == 'function') {
                        that.callback();
                    }
                    this.closeDialog();
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    });
}

export {BonusDialog}