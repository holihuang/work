import {transferEmotionTextToImg} from '../../../../common/emotionUtil';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Items = Backbone.View.extend({
    initialize: function(options) {
        let {resultList} = options
        this.model = new Model();
        this.model.set({resultList});
        this.render();
    },

    format(data) {
        let {resultList = []} = data;
        resultList.forEach((item, index) => {
            let {fromUserId, content} = item;
            if (fromUserId) {
                //只有学员才有id
                item.itemClass = 'item-student';
            } else {
                //说明是老师发送的
                item.itemClass = 'item-teacher';
            }

            item.content = transferEmotionTextToImg(content);
        })
        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}