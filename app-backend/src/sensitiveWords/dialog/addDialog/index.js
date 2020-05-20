import {Dialog} from '../../../components/dialog/index';
import {common} from '../../../common/common';
import {service} from '../../../common/service';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var View = Backbone.View.extend({
    initialize: function(options) {
        let {resultMessage} = options
        this.model = new Model();
        this.model.set({sensitiveTypeList: resultMessage});
        this.render();
    },

    events: {
        'click #type1': 'showTypePanel',
        'click #type2': 'showWordPanel'
    },

    showTypePanel() {
        $('#typePanel').show();
        $('#wordPanel').hide();
    },

    showWordPanel() {
        $('#typePanel').hide();
        $('#wordPanel').show();
    },

    getData() {
        let data = common.getFormData({
            formId: 'form'
        });

        return data;
    },

    render() {
        this.$el.html(tpl(this.model.toJSON()));
    }
})

var AddDialog = function(options) {
    let {onSuccess} = options;
    this.onSuccess = onSuccess;
    this.getTypeList().then((data) => {
        let {resultMessage} = data;
        this.view = new View({resultMessage});
        this.show();
    })
}

AddDialog.prototype.show = function() {
    let that = this;

    let d = new Dialog({
        title: '新增敏感词类目',
        type: 4,
        content: that.view.el,
        ok: function() {
            let data = that.view.getData();
            if (data.type == 1) {
                //敏感词分类
                let {sensitiveTypeName} = data;
                if (!sensitiveTypeName) {
                    alert('请填写敏感词分类名称');
                    return;
                }
                service.addSensitiveType({
                    sensitiveTypeName
                }, (response) => {
                    if (response.rs) {
                        alert('添加成功！');
                        this.closeDialog();
                        if (typeof that.onSuccess == 'function') {
                            that.onSuccess();
                        }
                    } else {
                        alert(response.rsdesp);
                    }
                })
            } else {
                //敏感词
                let {sensitiveName, sensitiveTypeId} = data;
                if (!sensitiveName) {
                    alert('请填写敏感词名称');
                    return;
                }
                if (!sensitiveTypeId) {
                    alert('请选择敏感词分类！');
                    return;
                }
                service.addSensitiveWord({
                    sensitiveName,
                    sensitiveTypeId
                }, (response) => {
                    if (response.rs) {
                        alert('添加成功！');
                        this.closeDialog();
                        if (typeof that.onSuccess == 'function') {
                            that.onSuccess();
                        }
                    } else {
                        alert(response.rsdesp);
                    }
                })
            }
        }
    })
}

AddDialog.prototype.getTypeList = function() {
    return new Promise((resolve, reject) => {
        service.getAllSensitiveType({}, (response) => {
            if (response.rs) {
                let {resultMessage} = response;
                resolve({resultMessage});
            } else {
                alert(response.rsdesp);
            }
        })
    })
}

export {AddDialog}