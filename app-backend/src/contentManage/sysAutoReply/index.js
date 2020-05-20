import {service} from '../../common/service';
import {common} from '../../common/common';
import {Items} from './items/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var SysAutoReply = Backbone.View.extend({
    initialize: function(options) {
        this.render();
    },

    render: function() {
        this.$el.html(tpl());
        new Items({el: this.$el.find('tbody')[0]});        
    }
})

export {SysAutoReply}