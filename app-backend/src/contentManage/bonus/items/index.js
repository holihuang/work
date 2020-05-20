import {service} from '../../../common/service';
import {BonusDialog} from '../dialog/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Items = Backbone.View.extend({
    initialize: function(options) {
        let {resultList} = options;
        this.model = new Model();
        this.listenTo(this.model, 'change:resultList', this.render);
        this.model.set({resultList});
    },

    events: {
        'click .update': 'update',
        'click .delete': 'del'
    },

    getIdByIndex(index) {
        let {resultList} = this.model.toJSON();
        return resultList[index].annId;
    },

    update(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();

        new BonusDialog({
            type: 'update',
            item: resultList[index],
            callback: this.refresh.bind(this)
        });
    },

    del(e) {
        if (confirm('确定要删除该素材吗？')) {
            let index = +$(e.currentTarget).attr('index');
            let annId = this.getIdByIndex(index);
            
            service.deleteAnnouncement({annId}, (response) => {
                if (response.rs) {
                    alert('删除成功！');
                    this.refresh();
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    refresh() {
        service.listAnnouncement({
            annType: 'WELFARE',
            queryType: 'ALL'
        }, (response) => {
            if (response.rs) {
                let resultList = response.resultMessage;
                this.model.set({resultList});
            } else {
                alert(response.rsdesp);
            }
        })
    },

    format(data) {
        let {resultList = []} = data;
        resultList.forEach((item, index) => {
            switch(item.status) {
                case 0:
                    item.statusText = '展示结束';
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

            switch(item.userType) {
                case 0:
                    item.userTypeText = '免费用户';
                    break;
                case 1:
                    item.userTypeText = '付费用户';
                    break;
                case 2:
                    item.userTypeText = '全部用户';
                    break;
                default:
                    break;
            }

            item.index = index;
        })
        return {resultList};
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}