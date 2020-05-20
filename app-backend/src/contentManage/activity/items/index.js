import {service} from '../../../common/service';
import {common} from '../../../common/common';
import {Dialog} from '../../../components/dialog/index';
import {ConfigActivityDialog} from '../dialog/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {}
})

var Items = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set(options);
    },

    events: {
        'click .preview': 'preview',
        'click .update': 'update'
    },

    preview(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var url = resultList[index].bannerImage;

        var d = new Dialog({
            title: '素材预览',
            type: 2,
            content: `<img src="${url}">`
        });
    },

    update(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var item = resultList[index];
    
        new ConfigActivityDialog({
            type: 'update',
            onSuccess: this.getTodayMotto.bind(this),
            ...item
        })
    },

    getTodayMotto() {
        var params = {
            userId: '',
            queryType: 'all',
            deleteFlag: 0
        };

        service.getTodayMotto(params, (response) => {
            if (response.rs) {
                var resultList = [];
                var data = response.resultMessage;
                for (var i = 0, len = data.length; i < len; i++) {
                    if (data[i].bannerType == 2) {  //1为一句话, 2为每日活动
                        resultList.push(data[i]);
                    }
                }

                this.model.set({resultList});
            }
        })
    },

    format(data) {
        var {resultList} = this.model.toJSON();
        resultList.forEach((item, index) => {
            var status = item.status;
            var userType = item.userType;
            switch (status) {
                case 0:
                    item.statusText = '展示结束';
                    item.canUpdate = false;
                    break;
                case 1:
                    item.statusText = '展示中';
                    item.canUpdate = true;
                    break;
                case 2:
                    item.statusText = '待展示';
                    item.canUpdate = true;
                    break;
                default:
                    break;
            }
            switch (userType) {
                case 0:
                    item.user = '免费';
                    break;
                case 1:
                    item.user = '付费';
                    break;
                case 2:
                    item.user = '全部';
                    break;
                default:
                    item.user = '全部';
                    break;
            }

            item.index = index;
        })

        return {resultList};
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}
