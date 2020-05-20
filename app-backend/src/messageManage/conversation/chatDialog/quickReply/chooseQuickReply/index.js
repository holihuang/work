import {Dialog} from '../../../../../components/dialog/index';
import {common} from '../../../../../common/common';
import {service} from '../../../../../common/service';
import {ImgPreview} from '../../../../../components/imgPreview/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        quickReplys: null
    }
});

var ChooseQuickReply = Backbone.View.extend({
    initialize: function(options) {
        let {callback, onClick} = options;
        this.callback = callback;
        this.onClick = onClick;
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.getAllQuickReplys();
    },

    events: {
        'click #editQuickReplyBtn': 'editQuickReply',
        'click .common-phrase-item': 'handleClickItem',
        'click .img-quick-reply-item': 'previewImg',
        'click .send-img-btn': 'sendImg'
    },

    handleClickItem(e) {
        let quickReplyContent = $(e.currentTarget).attr('value');

        this.onClick({type: 1, quickReplyContent});
    },

    sendImg(e) {
        let quickReplyContent = $(e.currentTarget).attr('value');

        this.onClick({type: 3, quickReplyContent});
    },

    getAllQuickReplys() {
        service.getCommonPhraseList({
            teacherAccount: common.getUserInfo().userAccount
        }, (response) => {
            let quickReplys = response.resultMessage;
            this.model.set({quickReplys});
        })
    },

    editQuickReply() {
        if (typeof this.callback === 'function') {
            this.callback();
        }
    },

    previewImg(e) {
        //预览图片
        let imgUrl = $(e.currentTarget).attr('src');
        new ImgPreview({imgUrl});

        return false;
    },

    format(data) {
        let {quickReplys = []} = this.model.toJSON();
        quickReplys.forEach(item => {
            item.richQuickReplyContent = item.type === 2 ? `
									 	<img src="${item.quickReplyContent}" title="点击图片预览" class="img-quick-reply-item">
									 ` : item.quickReplyContent;
            
            if (item.type === 2) {
                item.isImg = true;
            }
        })
        
        return data;
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

export {ChooseQuickReply}
