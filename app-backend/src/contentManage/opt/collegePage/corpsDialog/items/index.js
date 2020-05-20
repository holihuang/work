import tpl from './tpl.html';

const Model = Backbone.Model.extend({
    defaults: {
        resultList: [],
        checkedList: [],
    }
});

const Items = Backbone.View.extend({
    initialize(options) {
        const {resultList, checkedList} = options;
        this.model = new Model();
        this.model.set({resultList, checkedList});
        this.render();
    },

    destroy() {
        this.$el.empty();
        this.undelegateEvents();
    },

    format(data) {
        const {resultList, checkedList} = data;
        resultList.forEach(item => {
            item.activeClass = checkedList.indexOf(item.code) != -1 ? 'checked' : '';
        })

        return {resultList};
    },

    render() {
        const data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}
