var Model = Backbone.Model.extend({
    defaults: {
        'createTime': '创建时间',
        'modifyTime': '最后一次操作时间'
        'startTime': '开始时间',
        'endTime': '结束时间',
        'creater': '创建人'
    }
})

var Template = Backbone.View.extend({
    initialize: function(options) {
        let {title, tip = '', list = [], addCfg, updateCfg, delCfg} = options;
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set({title, tip, list, addCfg, updateCfg, delCfg});
    },

    render: function() {
        
    }
})

export {Template}