import { RecentGroups } from './recentGroups/index'
import { AllGroups } from './allGroups/index'

const tpl = require('./tpl.html')

const Model = window.Backbone.Model.extend({
    defaults: {
    },
})

const LeftListPanel = window.Backbone.View.extend({
    initialize(options) {
        const { send, activeGroupId, updateModelAndTs } = options
        this.send = send
        this.updateModelAndTs = updateModelAndTs
        this.model = new Model()
        this.model.set({ activeGroupId })
        this.render()
        this.renderRecentGroups()
        // this.renderAllGroups();
        this.switchToRecentGroups()
    },

    events: {
        'click #recentGroups': 'switchToRecentGroups',
        'click #allGroups': 'switchToAllGroups',
    },

    update(data) {
        // 更新最近消息列表
        this.recentGroups.update(data)
    },

    getSearchGroupListRs(data) {
        if (data.tab === 1) { // 最近
            this.recentGroups.getSearchGroupListRs(data)
        } else if (data.tab === 2) { // 全部
            this.allGroups.getSearchGroupListRs(data)
        }
    },

    // 透传给全部view的回调
    getGroupListRs(data) {
        this.allGroups.getGroupListRs(data)
    },

    // 透传给最近view的回调
    // getOldMessagesRs(data) {
    //     this.recentGroups.getOldMessagesRs(data)
    // },

    // 置顶透传给最近回调
    setTopOrNotRs(data) {
        this.recentGroups.setTopOrNotRs(data)
    },

    switchToRecentGroups() {
        this.$el.find('#allGroups').removeClass('active')
        this.$el.find('#recentGroups').addClass('active')

        this.$el.find('#recentGroupsContainer').removeClass('hide')
        this.$el.find('#allGroupsContainer').addClass('hide')
    },

    switchToAllGroups() {
        this.$el.find('#allGroups').addClass('active')
        this.$el.find('#recentGroups').removeClass('active')

        this.$el.find('#recentGroupsContainer').addClass('hide')
        this.$el.find('#allGroupsContainer').removeClass('hide')

        this.renderAllGroups()
    },

    renderRecentGroups() {
        this.recentGroups = new RecentGroups({
            el: this.$el.find('#recentGroupsContainer')[0],
            send: this.send,
            updateModelAndTs: this.updateModelAndTs,
        })
    },

    renderAllGroups() {
        if (!this.allGroups) {
            const { activeGroupId } = this.model.toJSON()
            this.allGroups = new AllGroups({
                el: this.$el.find('#allGroupsContainer')[0],
                send: this.send,
                activeGroupId,
            })
        }
    },

    format(data) {
        const { role } = data
        if (role === 'teacher') {
            // 班主任有群发和学院列表
            data.isTeacher = true
        }

        return data
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
        return this
    },
})

export { LeftListPanel }
