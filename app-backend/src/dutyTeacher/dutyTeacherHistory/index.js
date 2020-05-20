import {Items} from './items/index';
import {service} from '../../common/service';
import {common} from '../../common/common';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({

});

var DutyTeacherHistory = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.render();
        this.listenTo(this.model, 'change:resultList', this.renderResultList);
    },

    events: {
        'click #searchBtn': 'search',
        'input #studentPhone': 'checkInput'
    },

    checkInput() {

        var val = $('#studentPhone').val();

        if(val) {
            if (parseInt(val)) {
                $('#studentPhone').val(parseInt(val));
            } else {
                $('#studentPhone').val('');
            }
        }
    },

    search: function() {

        var params = common.getFormData({
            formId: 'form'
        });

        params['userAccount'] = common.getUserInfo().userAccount;
        params['userRole'] = common.getUserInfo().userRole;
        params.channelCode = 'CS_BACKGROUND';
        params.userRole = common.getUserInfo().userRole;

        if (!params.studentPhone && !params.studentName) {
            alert('请输入学员手机号或学员姓名！')
            return;
        }

        service.getHistoryOnDutyMessageList(params, response => {
            if (response.rs) {
                this.model.set({resultList: response.resultMessage});
            }
        })
    },

    renderResultList: function() {
        var {resultList} = this.model.toJSON();

        this.items && this.items.undelegateEvents();

        var items = new Items({el: this.$('#resultPanel')[0], resultList});

        this.items = items;
    },

    format: function(data) {
        return data;
    },

    render: function() {
        this.$el.html(tpl());
    }
})

export {DutyTeacherHistory}