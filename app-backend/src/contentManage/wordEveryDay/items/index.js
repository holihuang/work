import {Dialog} from '../../../components/dialog/index';
import {common} from '../../../common/common';
import {service} from '../../../common/service';
import {ConfigWordEveryDayDialog} from '../dialog/index';

var tpl = require('./tpl.html');
var updateTpl = require('../dialogTpl/update.html');

var Model = Backbone.Model.extend({

})

var Items = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set(options);
    },

    events: {
        'click .update': 'update',
        'click .preview': 'preview'
    },

    //更新素材
    update(e) {
        var {resultList} = this.model.toJSON();
        var index = $(e.currentTarget).attr('index');
        var item = resultList[index];

        new ConfigWordEveryDayDialog({
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
            var data = response.resultMessage;
            var resultList = [];
            for (var i = 0, len = data.length; i < len; i++) {
                if (data[i].bannerType == 1) {  //1为一句话
                    resultList.push(data[i]);
                }
            }

            this.model.set({resultList});
        })
    },

    preview(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var url = resultList[index].bannerImage;

        var d = new Dialog({
            title: '素材预览',
            content: `<img src="${url}">`,
            type: 2
        });
    },

    format(data) {
        var {resultList} = data;
        resultList.forEach((item, index) => {
            let status = item.status;
            //let userType = item.userType;
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

            // switch (userType) {
            //     case 0:
            //         item.user = '免费';
            //         break;
            //     case 1:
            //         item.user = '付费';
            //         break;
            //     case 2:
            //         item.user = '全部';
            //         break;
            //     default:
            //         item.user = '全部';
            //         break;
            // }

            //添加索引
            item.index = index;
        })
        return {resultList};
    },

    render() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}