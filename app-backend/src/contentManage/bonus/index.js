import {Items} from './items/index';
import {BonusDialog} from './dialog/index';
import {service} from '../../common/service';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Bonus = Backbone.View.extend({
    initialize: function() {
        this.model = new Model();
        this.listenTo(this.model, 'change:resultList', this.renderTable);
        this.render();
        this.getData(); //获取数据
    },

    events: {
        'click #addBonusBtn': 'addBonus'
    },

    addBonus() {
        new BonusDialog({
            callback: this.getData.bind(this)
        });
    },

    getData() {
        service.listAnnouncement({
            annType: 'WELFARE', //福利活动
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

    //渲染列表数据
    renderTable() {
        let {resultList} = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({el: this.$el.find('tbody')[0], resultList});
    },

    render() {
        this.$el.html(tpl());
    }
})

export {Bonus}