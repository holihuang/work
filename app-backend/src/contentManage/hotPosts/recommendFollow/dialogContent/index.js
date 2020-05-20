/*
 * @Author: zhangpengyu 
 * @Date: 2017-12-25 14:28:50 
 * @Last Modified by:   zhangpengyu 
 * @Last Modified time: 2017-12-25 14:28:50 
 */

import tpl from './tpl.html';

const Model = Backbone.Model.extend({
    defaults: {
    }
});

const DialogContent = Backbone.View.extend({
    initialize(options) {
        const { noPayTab, update, userId, status } = options
        this.model = new Model()
        this.model.set({noPayTab, update, userId, status})
        this.render()
        
    },

    events: {
        'click #hasRecommend': 'setPositionAbled',
    },

    setPositionAbled() {
        const ele = this.$el.find('#position');
        ele.prop('disabled',!ele.prop('disabled'))
    },

    format(data) {
        const { status, noPayTab } = data
        data.hasRecommendChecked = status === 1 ? 'checked' : ''
        data.selectDisabled =  noPayTab ? (status === 1 ? '' : 'disabled') : ''
        return data;
    },

    render() {
        const data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

export { DialogContent }
