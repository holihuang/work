var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        resultList: ''
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
        resultList.forEach((item) => {
            let {type} = item;
            switch(type) {
                case 'id':
                    item.typeText = '用户id';
                    item.user = item.userId;
                    break;
                case 'mobile':
                    item.typeText = '手机号';
                    item.user = item.mobile;
                    break;
                case 'nickname':
                    item.typeText = '昵称';
                    item.user = item.userNickName;
                    break;
                default:
                    break;
            } 
        })
        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

export {Items}