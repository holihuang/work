import {service} from '../../common/service';
import {common} from '../../common/common';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        isUploading: true  //初始化默认为图片正在上传状态，待图片上传完成后置为false
    }
});

var ImgSender = Backbone.View.extend({
    el: '#dialogContainer',

    initialize: function(options) {
        this.model = new Model();
        this.options = options || {};
        this.listenTo(this.model, 'change', this.render);
        this.render();
        this.setBodyStyle();
    },

    events: {
        'click .btn-submit': 'handleSubmit',
        'click .close-dialog-btn': 'closeDialog'
    },

    setBodyStyle() {
        $('body').addClass('dialog-show');
    },

    handleSubmit: function() {
        var {ok} = this.options;
        if (typeof ok === 'function') {
            let {url, isUploading} = this.model.toJSON();
            let checkIpt = this.$el.find('#ifNeedSendWxInDialog');
            let ifNeedSendWx;
            if (checkIpt) {
                ifNeedSendWx = checkIpt.prop('checked') ? 1 : 0;
            }
            if (!isUploading) {
                ok.call(this, url, ifNeedSendWx);
            } else {
                alert('图片正在上传，请耐心等待');
            }
        } else {
            this.closeDialog();
        }
    },

    closeDialog() {
        this.undelegateEvents();
        this.$el.empty();
        $('body').removeClass('dialog-show');
    },

    setModel(options) {
        this.model.set({...options});
    },

    format(data) {

        return data;
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {ImgSender}