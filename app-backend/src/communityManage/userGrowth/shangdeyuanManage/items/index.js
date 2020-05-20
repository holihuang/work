var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        resultList: null
    }
});

var Items = Backbone.View.extend({
    initialize: function(options) {
        let {resultList} = options;
        this.model = new Model();
        this.model.set({resultList});
        this.render();
    },

    format(data) {
        let {resultList = []} = data;
        resultList.forEach((item, index) => {
            item.index = index;
            let {prodStatus} = item;
            switch (prodStatus) {
                case 0:
                    item.prodStatusText = '待售';
                    break;
                case 1:
                    item.prodStatusText = '在售';
                    break;
                case 2:
                    item.prodStatusText = '已下架';
                    break;
                default:
                    break;
            }

            if (!item.prodInventory) {
                item.noInventory = true;
            }
        })
        return data;
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}