import {Dialog} from '../../../components/dialog/index';
import {service} from '../../../common/service';

let tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var View = Backbone.View.extend({
    initialize: function(options) {
        let {allSensitiveTypes, onSuccess} = options;
        this.model = new Model();
        this.model.set({allSensitiveTypes, onSuccess});
        this.render();
        this.listenTo(this.model, 'change:allSensitiveTypes', this.render);
    },

    events: {
        'click .edit-type': 'editType',
        'click .delete-type': 'deleteType'
    },

    editType(e) {
        let index = +$(e.currentTarget).attr('index');
        let {allSensitiveTypes} = this.model.toJSON();
        let {sensitiveTypeId, sensitiveTypeName} = allSensitiveTypes[index];
        let typesCopy = JSON.parse(JSON.stringify(allSensitiveTypes));
        let that = this;        
        new Dialog({
            title: '修改敏感词分类',
            content: `
                <form class="form">
                    <div class="form-group">
                        <input value="${sensitiveTypeName}" id="typeName" class="form-input">
                    </div>
                </form>
            `,
            type: 2,
            ok: function() {
                let newSensitiveTypeName = that.model.get('newSensitiveTypeName');
                service.updateSensitiveType({
                    sensitiveTypeId,
                    sensitiveTypeName: newSensitiveTypeName
                }, (response) => {
                    if (response.rs) {
                        alert('修改成功!');
                        this.closeDialog();
                        let {onSuccess} = that.model.toJSON();
                        onSuccess();
                    } else {
                        alert(response.rsdesp);
                    }
                })
            }
        })

        $('#typeName').on('input', function() {
            let val = $(this).val();
            that.model.set({newSensitiveTypeName: val});
        })
    },

    deleteType(e) {
        let index = +$(e.currentTarget).attr('index');
        let {allSensitiveTypes} = this.model.toJSON();
        let {sensitiveTypeId, sensitiveTypeName} = allSensitiveTypes[index];
        let that = this;
        if (confirm(`确定要删除敏感词分类${sensitiveTypeName}吗？`)) {
            let typesCopy = JSON.parse(JSON.stringify(allSensitiveTypes));
            service.deleteSensitiveType({
                sensitiveTypeId,
                sensitiveTypeName: encodeURIComponent(sensitiveTypeName)
            }, (response) => {
                if (response.rs) {
                    alert('删除成功!');
                    typesCopy.splice(index, 1);
                    this.model.set({allSensitiveTypes: typesCopy});
                    let {onSuccess} = that.model.toJSON();
                    onSuccess();
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    format(data) {
        let {allSensitiveTypes} = data;
        allSensitiveTypes.forEach((item, index) => {
            item.index = index;
        })

        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

var AllTypesDialog = function(options = {}) {
    let {allSensitiveTypes, onSuccess} = options;
    this.view = new View({allSensitiveTypes, onSuccess});
    this.show();
}

AllTypesDialog.prototype.show = function() {
    let that = this;
    this.d = new Dialog({
        title: '所有敏感词分类',
        content: that.view.$el,
        type: 4
    })
}

export {AllTypesDialog}