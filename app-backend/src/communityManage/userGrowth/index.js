import {UserManage} from './userManage/index';
import {ShangdeyuanManage} from './shangdeyuanManage/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        type: 0  //默认为用户管理, 为0表示用户管理，为1表示尚德元商城管理
    }
});

var UserGrowth = Backbone.View.extend({
    initialize: function(options) {
        let {type} = options;
        this.model = new Model();
        this.model.set({type});
        this.render();
    },

    renderUserManage() {
        new UserManage({
            el: this.$el.find('#contentContainer')[0]
        })
    },

    renderShangdeyuanManage() {
        new ShangdeyuanManage({
            el: this.$el.find('#contentContainer')[0]
        })
    },

    format(data) {
        let {type} = data;
        switch(type) {
            case "0":
                data.userManageActiveClass = 'active';
                data.showUserManage = true;
                break;
            case "1":
                data.shangdeyuanManageActiveClass = 'active';
                data.showShangdeyuanManage = true;
                break;
        }

        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));

        if (data.showUserManage) {
            this.renderUserManage();
        } else if (data.showShangdeyuanManage) {
            this.renderShangdeyuanManage();
        }
    }
})

export {UserGrowth}