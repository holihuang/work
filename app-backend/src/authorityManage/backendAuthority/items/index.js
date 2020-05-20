import {Item} from './item/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Items = Backbone.View.extend({

    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set({data: options.resultMessage});
    },

    render: function() {
        this.$el.html(tpl());
        var data = this.model.get('data');
        var item = new Item(data);
        this.$el.find('tbody').append(item.render().el);
    }
})

export {Items}