import {Dialog} from '../../../../components/dialog/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        resultList: null
    }
});

var View = Backbone.View.extend({
    initialize: function(options) {
        let {resultList} = options;
        this.model = new Model();
        this.model.set({resultList});
        this.render();
    },

    format(data) {
        let {resultList} = data;
        resultList.forEach((item, index) => {
            item.index = index + 1;
            switch (item.operatorDesc) {
                case 'insert':
                    item.operatorDescText = '创建';
                    break;
                case 'update':
                    item.operatorDescText = '更新';
                    break;
                case 'delete':
                    item.operatorDescText = '删除';
                    break;
            }
        })
        return data;
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

var OperationLogDialog = function(options) {
    this.view = new View(options);
    this.show();
}

OperationLogDialog.prototype.show = function() {
    this.d = new Dialog({
        title: '操作日志',
        content: this.view.$el,
        type: 4
    });
}

export {OperationLogDialog}