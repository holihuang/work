import {transferEmotionTextToImg} from '../../../common/emotionUtil';
import {Dialog} from '../../../components/dialog/index';
import {service} from '../../../common/service';
import {Items} from './items/index';
import {Pager} from '../../../components/pager/index';

const PAGE_SIZE = 25;

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({

});

var View = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.model.set(options);
        this.listenTo(this.model, 'change:resultList', this.renderResultList);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.render();
        this.getMessagesList();
    },

    getMessagesList(options = {}) {
        this.$el.find('.img-container').show();

        let {pageSize = PAGE_SIZE, pageNo = 1} = options;
        //获取值班老师与学员的聊天记录
        let {userId, chatUserAccount} = this.model.toJSON();
        let params = {
            channelCode: 'CS_BACKGROUND',
            userId,
            chatUserAccount,
            pageSize,
            pageNo
        }
        service.listRecordByDutyTeacher(params, (response) => {
            if (response.rs) {
                let {countPerPage, pageCount, pageIndex, resultList} = response.resultMessage;
                this.model.set({
                    pageSize: countPerPage,
                    pageNo: pageIndex,
                    pageCount,
                    resultList
                });
            } else {
                alert(response.rsdesp);
            }
            this.$el.find('.img-container').hide();
        })
    },

    renderResultList() {
        let {resultList} = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({
            el: this.$el.find('#messageListPanel')[0],
            resultList
        })
    },

    renderPager() {
        let {pageSize, pageCount, pageNo} = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer')[0],
            pageSize,
            pageCount,
            pageNo,
            onChange: this.getMessagesList.bind(this)
        })
    },

    render: function() {
        this.$el.html(tpl());
    }
})

var Messages = function(params) {
    this.view = new View(params);
    this.show();
}
Messages.prototype.show = function() {
    this.d = new Dialog({
        title: '聊天记录',
        content: this.view.$el,
        type: 4,
        showFooter: false
    });
}

export {Messages}