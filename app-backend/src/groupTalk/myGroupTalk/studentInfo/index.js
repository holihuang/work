import {service} from '../../../common/service';
import {common} from '../../../common/common';

let tpl = require('./tpl.html');

let Model = Backbone.Model.extend({
    defaults: {

    }
});

let StudentInfo = Backbone.View.extend({
    initialize(options) {
        this.model = new Model();
        this.model.set(options);
        this.render();
    },

    format(data) {
        data.provinceName = data.provinceName || '无'
        data.cityName = data.cityName || '无'
        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {StudentInfo}
