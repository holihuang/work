import {chatInfoModelUtil} from '../chatInfo';
import {RecentMessages} from './recentMessages/index';
import {StudentsList} from './studentsList/index';
import tpl from './tpl.html';

var Model = Backbone.Model.extend({
    defaults: {
        tab: 'recent'  //默认为最近（recent），我的学员（all）
    }
});

var LeftListPanel = Backbone.View.extend({
    initialize: function(options) {
        let {role, send} = options;
        this.send = send;
        this.model = new Model();
        this.listenTo(this.model, 'change:tab', this.handleTabChange);
        this.render();
    },

    events: {
        'click #recentMessagesBtn': 'handleClickRecentBtn',
        'click #allStudentsBtn': 'handleClickAllStudentsBtn',
    },

    handleClickRecentBtn() {
        this.model.set({
            tab: 'recent'
        });
    },

    handleClickAllStudentsBtn() {
        this.model.set({
            tab: 'all'
        });
    },

    handleTabChange() {
        const {tab} = this.model.toJSON();
        switch(tab) {
            case 'recent':
                this.$el.find('#recentMessagesBtn').addClass('active');
                this.$el.find('#allStudentsBtn').removeClass('active');

                this.renderRecentMessages();
                break;
            case 'all':
                this.$el.find('#recentMessagesBtn').removeClass('active');
                this.$el.find('#allStudentsBtn').addClass('active');

                this.renderStudentsList();
                break;
        };
    },

    //最近消息列表
    renderRecentMessages() {
        let {messageList, role} = this.model.toJSON();
        //不要每次都重新new，一个就够了
        if (!this.recentMessages) {
            this.recentMessages = new RecentMessages({
                el: this.$el.find('#recentMessagesContainer')[0],
                role,
                send: this.send
            });
        }

        this.$el.find('#recentMessagesContainer').show();
        this.$el.find('#allStudentsContainer').hide();
    },

    //学员列表
    renderStudentsList() {
        if (!this.studentsList) {
            this.studentsList = new StudentsList({
                el: this.$el.find('#allStudentsContainer')[0],
                send: this.send
            });
        }

        this.$el.find('#recentMessagesContainer').hide();
        this.$el.find('#allStudentsContainer').show();
    },

    format(data) {
        data.isTeacher = chatInfoModelUtil.isTeacher();
        // data.isTeacherEqual = chatInfoModelUtil.isTeacherEqual();

        return data;
    },

    destroy() {
        this.remove();

        this.recentMessages.remove();
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
        //默认打开最近列表页
        this.renderRecentMessages();
    }
})

export {LeftListPanel}
