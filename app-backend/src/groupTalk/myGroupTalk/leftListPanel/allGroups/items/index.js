let tpl = require('./tpl.html');

let Model = Backbone.Model.extend({
    defaults: {
        display: 1
    }
});

let Items = Backbone.View.extend({
    initialize: function(options) {
        let {resultList, activeGroupId} = options;
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set({resultList, activeGroupId});
    },

    format(data) {
        let {resultList = [], activeGroupId} = data;

        resultList.forEach(item => {

            item.currentCheckedClass = item.groupId == activeGroupId ? 'current-checked-item' : '';

            // 由于新增了管理员身份，所以需要知道操作人是管理员（14）还是群主（1）
            item.userIsOwner = item.memberDegree && item.memberDegree.value === 1

            let {display = 1} = item;
            item.display = display;
        })

        return data;
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

export {Items}