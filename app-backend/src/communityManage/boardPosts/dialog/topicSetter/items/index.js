var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        selectTopics: [], //选中的话题
        topicList: null  //所有话题
    }
})

var Items = Backbone.View.extend({
    initialize: function(options) {
        let {topicList, selectTopics} = options;
        
        this.model = new Model();
        this.model.set({topicList, selectTopics});
        this.render();
    },

    format(data) {
        let {topicList, selectTopics = []} = data;
        topicList.forEach((item, index) => {
            item.activeClass = '';
            selectTopics.forEach((selectTopic) => {
                if (selectTopic.topicId == item.topicId) {
                    item.activeClass = 'checked';
                }
            })
        });

        return {topicList};
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}