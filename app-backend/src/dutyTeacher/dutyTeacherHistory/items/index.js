import {Messages} from '../messages/index';
import {common} from '../../../common/common';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({

});

var Items = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set({resultList: options.resultList});
    },

    events: {
        'click .show-history-message-btn': 'showHistoryMessage'
    },

    showHistoryMessage: function(e) {
        var formId = $(e.target).attr('targetForm');
        var params = common.getFormData({formId: formId});
        //获取与该老师的聊天记录
        var reqTime = common.getTime();
        params = {
            ...params,
            reqTime: reqTime,
            pageSize: 300,
            pageNo: 1,
            direction: 1,
            curMaxMessageId: 0
        };

        new Messages(params);
        // service.getChatMessagesByOnDutyTeacher(params, function(response) {
        //     if (response.rs) {
        //         var messageList = response.resultMessage.resultList;

        //         if (messageList.length) {
        //             var messages = new Messages({messageList});
        //             $('#myModal').children().length && $('#myModal').children().remove();
        //             $('#myModal').append(messages.render().el);
        //             $('#myModal').modal('toggle');
        //         } else {
        //             //无聊天记录
        //             alert('暂时没有任何聊天记录~');
        //         }
        //     }
        // })
    },

    format: function(data) {
        var index = 0;
        var {resultList} = data;
        for (var i = 0, len = resultList.length; i < len; i++) {
            var {teacherInfos, studentUserId} = resultList[i];
            for (var j = 0, len1 = teacherInfos.length; j < len1; j++) {
                teacherInfos[j].index = index++;
                teacherInfos[j].studentUserId = studentUserId;
            }
        }
        return data;
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}