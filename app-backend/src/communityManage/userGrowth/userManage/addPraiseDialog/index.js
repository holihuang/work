import {Dialog} from '../../../../components/dialog/index';
import {service} from '../../../../common/service';
import {Item} from './item/index.js';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        formNums: 1 //默认为一条
    }
});

var View = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.render();
        this.addItem({
            isFirst: true
        });
    },

    events: {
        'click .add-form-item': 'handleClickAddItem',
        'click .del-form-item': 'handleClickDelItem'
    },

    handleClickAddItem() {
        let {formNums} = this.model.toJSON();
        this.addItem({
            formId: `form${formNums}`
        })

        this.model.set({formNums: ++formNums});
    },

    handleClickDelItem(e) {
        let delFormId = $(e.currentTarget).attr('del');
        let index = delFormId.substr(4);
        this.$el.find(`#${delFormId}`).remove();

        let {formNums, items} = this.model.toJSON();
        items.splice(index, 1);
        this.model.set({formNums: --formNums, items});
    },

    addItem(options = {}) {
        let {formId = 'form0', isFirst = false} = options;
        let item = new Item({
            formId,
            isFirst
        });
        this.$el.append(item.$el);

        let {items = []} = this.model.toJSON();
        items.push(item);
        this.model.set({items});
    },

    //获取数据
    getData() {
        let {formNums, items} = this.model.toJSON();
        let userInfos = [];
        for (let i = 0; i < formNums; i++) {
            let param = items[i].getData();
            if (param) {
                userInfos.push(param);
            } else {
                return false;
            }
        }

        return userInfos;
    },

    render: function() {
        this.$el.html(tpl());
    }
});

var AddPraiseDialog = function(options) {
    let {onSuccess} = options;
    this.onSuccess = onSuccess;
    this.view = new View();
    this.show();
}

AddPraiseDialog.prototype.show = function() {
    let that = this;
    this.d = new Dialog({
        title: '新增',
        content: this.view.$el,
        type: 4,
        ok: function() {
            let userInfos = that.view.getData();
            if (userInfos) {
                service.addSunlandAmount({
                    userInfos
                }, (response) => {
                    if (response.rs) {
                        alert('新增成功！');
                        if (typeof that.onSuccess === 'function') {
                            that.onSuccess();
                        }
                        this.closeDialog();
                    } else {
                        alert(response.rsdesp);
                    }
                })
            }
        }
    })
}

export {AddPraiseDialog}

