import {Dialog} from '../../../../components/dialog/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var View = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.model.set(options);
        this.render();
    },

    format(data) {
        let {prodSellPeople} = data;
        switch (prodSellPeople) {
            case 0:
                data.isAllUser = true;
                break;
            case 1:
                data.isVipUser = true;
                break;
            case 2:
                data.isCollegeUser = true;
                let {schoolFamilys} = data;
                schoolFamilys.forEach((item, index) => {
                    let {familyNames} = item;
                    item.familyNames = familyNames.join(',') || '全部';
                })
                break;
            case 3:
                data.isUserId = true;
                let {userIds} = data;
                data.userIds = userIds.join(',');
                break;
        }
        return data;
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

class SellPeopleDialog {
    constructor(options) {
        this.view = new View(options);
        this.show();
    }

    show() {
        this.d = new Dialog({
            title: '售卖人群',
            content: this.view.$el,
            type: 4
        });
    }
}

export {SellPeopleDialog}