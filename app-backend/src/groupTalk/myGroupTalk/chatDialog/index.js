import moment from 'moment'
// 引入react
import React from 'react'
import { render } from 'react-dom'


import { common } from '../../../common/common'
import { ImgPreview } from '../../../components/imgPreview/index'
import { EmotionBox, formatTextWithEmotion, getNodeText } from '../../../common/emotionUtil'
import { ImgSender } from '../../../components/imgSender/index'
import { Items } from './items/index'
import { GroupSetter } from '../groupSetter/index'
import { MemberList } from '../memberList/index'
import { SentItem } from './sentItem/index'
import { AddMemberDialog } from '../addMemberDialog/index'
import { StuOperatePanel } from '../stuOperatePanel/index'
import { ContextMenu } from '../contextMenu/index'

import { Recorder } from '../../../common/recorder'
import { url } from '../../../common/url'
import { Dialog } from '../../../components/dialog/index'
import util from '../../../common/util'

import Relay from '../relay/Relay'

const tip = '您当前版本过低，请升级至最新版本'

const template = require('./tpl.html')
const failTpl = require('./failTpl.html')


// main model
const Model = window.Backbone.Model.extend({
    defaults: {
        curMinMessageId: 0,
        hasHistoryMessage: false, // 默认没有拉取历史消息
        latestTime: 0, // 当前最新消息的时间
        groupStatus: 1, // 默认为正常
        userIsOwner: false,
        groupForbidden: 1, // 默认是未被群禁
        memberForbidden: 1, // 默认未被单禁
    },
})

const MemberModel = window.Backbone.Model.extend({
    defaults: {
        memberCount: -1,
    },
})

const PAGE_SIZE = 10
// main view
const ChatDialog = window.Backbone.View.extend({
    initialize(options) {
        const { send } = options
        this.send = send
        this.offEnterEvent()
        this.model = new Model()
        this.memberModel = new MemberModel()
        // 分为两块，当前消息和历史消息
        // 当前消息通过ws推送得到，历史消息通过ajax接口拉取得到
        this.listenTo(this.model, 'change:memberForbidden', this.renderMask)
        this.listenTo(this.model, 'change:groupForbidden', this.renderMask)
        this.listenTo(this.model, 'change:messageList', this.renderMessageList)
        this.listenTo(this.model, 'change:historyMessageList', this.renderHistoryMessageList)
        this.listenTo(this.model, 'change:groupId', this.handleGroupChange)
        this.listenTo(this.model, 'change:groupStatus', this.handleGroupStatusChange)
        this.listenTo(this.memberModel, 'change', this.setMemberCount)
    },

    events: {
        'click #groupSettingBtn': 'setGroupInfo',
        'click #sendMessageBtn': 'sendMessage',
        'click .get-more': 'getMoreMessages',
        'click .new-messages-tip': 'scrollToBottom',
        'click #showEmotion': 'showEmotion',
        'click .emotion-list li': 'chooseEmotion',
        'click .emotion-tab': 'chooseEmotionTab',
        'click .emotion-tab-container': 'preventProp',
        'click .send-message-again': 'sendMessageAgain', // 重发消息
        'click .chat-img': 'previewImg',
        'click #toggleMemberListPanelBtn': 'toggleMemberListPanel',
        'click .student-avatar': 'showStudentInfo',
        'click #uploadPicBtn': 'uploadPic',
        'click #sendGifBtn': 'sendGif',
        'click #sendFileBtn': 'sendFile', // 发送文件
        'click #sendAudioBtn': 'sendAudio', // 发送音频
        'click #sendVideoBtn': 'sendVideo', // 发送视频
        click: 'hideMemberList',
        'click #addMemberBtn': 'addMember',
        'click .send-again-btn': 'sendAgain',
        'contextmenu .item-right-click': 'rightMenu',
    },

    // 他人撤回消息
    revokeMsg(data) {
        const revokeNode = this.$el.find(`.chatting-item-${data.messageId}`)

        if (revokeNode.length) { // 将他人撤回的信息，替换为提示信息。
            revokeNode.html(`<div class="revoke-text">${data.chatContent}</div>`)
        } else { // 讲道理，不应该找不到message节点，但万一来个惊喜呢
            this.model.set({
                messageList: [
                    {
                        ...data,
                    },
                ],
            })
        }
    },

    // 关于userIsOwner
    updateGroupInfo(obj) {
        this.model.set(obj)
    },

    // 当接收到服务器端推送时，刷新消息
    update(data) {
        if (data) {
            const {
                groupId,
                userNickname,
                userUrl,
                groupStatus,
                groupName,
                memberCount,
                messageList,
                groupType,
                groupForbidden, // 群禁言
                memberForbidden, // 单人禁言
            } = data
            const hasMore = !(messageList.length < 20)
            // 是群主，不是管理员
            const userIsOwner = data.memberDegree && data.memberDegree.value === 1

            this.model.set({
                groupId,
                groupStatus,
                hasMore, // 是否有更多消息，其实只是在刚进入某个群时需要该字段，为了方便，这里每次都处理了
                groupName,
                teacherNickname: userNickname,
                teacherUrl: userUrl,
                groupType,
                groupForbidden,
                memberForbidden,
                userIsOwner,
            })

            if (+memberCount !== +this.memberModel.get('memberCount')) {
                this.memberModel.set({
                    memberCount,
                })
            }

            this.model.set({ messageList })
            this.removeLoading()
        }
    },

    // 处理消息是否发送成功
    handleMessageSuccess(data) {
        const {
            groupId, uniqueKey, successFlag, messageId, imUserId,
        } = data

        if (this[`sentItem${uniqueKey}`]) {
            this[`sentItem${uniqueKey}`].update({
                status: successFlag ? 1 : 2,
                uniqueKey,
                imUserId,
                messageId,
            })
        }
        // 如果该条消息是该群的第一条消息，则设置curMinMessageId
        const _groupId = this.model.get('groupId')
        const curMinMessageId = this.model.get('curMinMessageId')
        if ((_groupId === groupId) && (!curMinMessageId)) {
            this.model.set({ curMinMessageId: messageId })
        }
    },

    // 监听禁言状态
    renderMask() {
        const {
            userIsOwner, groupForbidden, memberForbidden,
        } = this.model.toJSON()

        const forbiddenSend = !userIsOwner && (+groupForbidden === 2 || +memberForbidden === 2)
        const maskNode = this.$el.find('.edit-message-mask')

        // tpl可能未加载maskNode
        if (maskNode.length === 0) {
            if (forbiddenSend) {
                this.$el.find('.edit-message-panel').prepend('<div class="edit-message-mask"></div>')
            }
        } else {
            console.log(forbiddenSend)
            if (forbiddenSend) {
                maskNode.show()
            } else {
                maskNode.hide()
            }
        }
    },

    // 渲染当前消息列表
    renderMessageList() {
        const { messageList = [], hasHistoryMessage, latestTime } = this.model.toJSON()

        // this.items && this.items.undelegateEvents()
        if (this.items) {
            this.items.undelegateEvents()
        }
        this.items = new Items({
            messageList,
            latestTime,
        })

        const memberLeftList = messageList.filter(item => +item.messageType === 20)
        const leftNums = memberLeftList && memberLeftList.length
        // 学员主动退群
        if (leftNums) {
            const { memberCount } = this.model.toJSON()
            // this.memberList && this.memberList.update({ memberCount })
            if (this.memberList) {
                this.memberList.update({ memberCount })
            }
        }

        this.$el.find('#messageListPanel').append(this.items.$el)

        if (messageList.length) {
            this.model.set({ latestTime: messageList[0].sendTime })
        }

        // 是否正在查看旧的消息，如果是，则不滚动到底部，而是给出提示
        // 如果否，则保持到底部
        // 保持在底部
        const nscrollHeight = this.$('#messagesPanel')[0].scrollHeight // 代表整个滚动区域的高度
        const { scrollTop } = this.$('#messagesPanel')[0]
        const height = this.$('#messagesPanel').height()

        if ((nscrollHeight - height) > (scrollTop + 400)) {
            // 首次打开不显示提示,可以通过curMinMessageId来判断
            const { curMinMessageId } = this.model.toJSON()
            if (curMinMessageId) {
                this.$('.new-messages-tip').show() // 显示新消息提示
            } else {
                this.scrollToBottom() // 首次打开滑到底部
            }
        } else {
            this.scrollToBottom()
        }

        // 如果没有历史消息,更新最小id；如果有历史消息，curMinMessageId不受影响
        if (!hasHistoryMessage) {
            // 以messageList更新curMinMessageId
            const len = messageList.length
            if (len) {
                const curMinMessageId = messageList[len - 1].messageId
                this.model.set({ curMinMessageId })
            }
        }
    },

    // 渲染历史消息部分
    renderHistoryMessageList() {
        // 显示正常消息
        const { historyMessageList = [], gotAllMessages } = this.model.toJSON()
        if (this.historyItems) {
            this.historyItems.undelegateEvents()
        }
        this.historyItems = new Items({
            messageList: historyMessageList,
            needInsertTimeMsg: true,
        })

        this.$el.find('.get-more').remove()
        this.$el.find('.no-more').remove()
        this.$el.find('#historyMessageListPanel').prepend(this.historyItems.$el)
        if (!gotAllMessages) {
            this.$el.find('#historyMessageListPanel').prepend('<p class="get-more">点击加载更多</p>')
        } else {
            this.$el.find('#historyMessageListPanel').prepend('<p class="no-more">没有更多了~</p>')
        }

        // 如果历史消息不为空，按历史消息更新最小messageId
        const len = historyMessageList.length
        if (len) {
            const curMinMessageId = historyMessageList[len - 1].messageId
            this.model.set({ curMinMessageId })
        }
    },

    // 获取更多之前的消息
    getMoreMessages() {
        this.$el.find('.get-more').remove()
        this.getHistoryGroupMessages()
    },

    forbiddenRs(data) {
        if (data.from === 'memberList') {
            this.memberList.forbiddenRs(data)
        } else if (data.from === 'stuOperatePanel') {
            this.stuOperatePanel.forbiddenRs(data)
        }
    },

    getMembListRs(data) {
        if (data.from === 'groupSetter') {
            this.groupSetter.getTeacherListRs(data)
        } else if (data.from === 'aiteMemberListGet') {
            this.aiteMemberList.listGetRs(data)
        } else if (data.from === 'memberListGet') {
            this.memberList.listGetRs(data)
        } else if (data.from === 'aiteMemberListSearch') {
            this.aiteMemberList.listSearchRs(data)
        } else if (data.from === 'memberListSearch') {
            this.memberList.listSearchRs(data)
        }
    },

    chooseTeacherRs(data) {
        this.groupSetter.chooseTeacherRs(data)
    },

    deleteUserRs(data) {
        if (data.from === 'memberList') {
            this.memberList.deleteUserRs(data)
        } else if (data.from === 'stuOperatePanel') {
            this.stuOperatePanel.deleteUserRs(data)
        }
    },

    setCadreUserRs(data) {
        this.stuOperatePanel.setCadreUserRs(data)
    },

    getStudentDetailRs(data) {
        this.stuOperatePanel.getStudentDetailRs(data)
    },

    addNewMembersRs(data) {
        this.addMemberDialog.addNewMembersRs(data)
    },

    getGroupDetailsRs(data) {
        this.groupSetter.getGroupDetailsRs(data)
    },

    getGroupStatusRs(data) {
        this.groupSetter.getGroupStatusRs(data)
    },

    getGroupAnnounceRs(data) {
        this.groupSetter.getGroupAnnounceRs(data)
    },

    updateGroupDetailsRs(data) {
        this.groupSetter.updateGroupDetailsRs(data)
    },

    deleteRs(data) {
        this.groupSetter.deleteRs(data)
    },

    deleteGroupAnnounceRs(data) {
        this.groupSetter.deleteGroupAnnounceRs(data)
    },

    updateGroupAnnounceRs(data) {
        this.groupSetter.updateGroupAnnounceRs(data)
    },

    updateGroupStateRs(data) {
        this.groupSetter.updateGroupStateRs(data)
    },

    msgHideRs(data) {
        this.contextMenu.msgHideRs(data)
    },

    // 获取群聊历史聊天内容
    getHistoryGroupMessagesRs(data) {
        const response = data

        if (response.rs) {
            const resultList = response.resultMessage

            if (!resultList.length) {
                this.model.set({ gotAllMessages: true })
            }

            this.model.set({ historyMessageList: resultList, hasHistoryMessage: true })
        } else {
            alert(`获取数据失败${response.rsdesp}`)
        }
    },

    // 获取历史消息
    getHistoryGroupMessages() {
        const { groupId, curMinMessageId } = this.model.toJSON()
        // let userAccount = common.getUserInfo().userAccount;
        const { userAccount } = common.getUserInfo()

        this.send({
            command: 'GET_HISTORY_GROUP_MSG',
            data: {
                imUserId: common.getUserInfo().imIdForGroup,
                groupId,
                userAccount,
                number: PAGE_SIZE,
                messageId: curMinMessageId,
            },
        })
    },

    // 当选择群组变化时，重置各种状态
    handleGroupChange() {
        this.render()

        if (this.memberList) {
            this.memberList.destroy()
        }
        this.memberList = null
        if (this.aiteMemberList) {
            this.aiteMemberList.destroy()
        }
        this.aiteMemberList = null

        this.model.set({
            curMinMessageId: 0,
            messageList: [],
            historyMessageList: [],
            hasHistoryMessage: false, // 默认为没有历史消息
            gotAllMessages: false, // 默认没有加载完所有消息
        })

        this.memberModel.set({
            memberCount: -1,
        })

        if (this.stuOperatePanel) {
            this.stuOperatePanel.close()
        }
        if (this.contextMenu) {
            this.contextMenu.close()
        }
        const temp = setTimeout(() => {
            $('#message').focus()
            clearTimeout(temp)
        }, 200)
    },

    handleGroupStatusChange() {
        const { groupStatus } = this.model.toJSON()
        if (+groupStatus === 2) {
            // 解散
            // 隐藏设置、添加群成员，和输入框
            this.$el.find('#groupSettingBtn').hide()
            this.$el.find('#addMemberBtn').hide()
            this.$el.find('.edit-message-panel').hide()
            this.$el.find('#messagesPanel').css({
                bottom: 0,
            })

            // 成员列表不能再对成员进行设置，只能查看
            if (this.memberList) {
                this.memberList.disable()
            }
        }
    },

    setGroupInfo() {
        const {
            groupId, groupType, userIsOwner, groupForbidden, memberForbidden,
        } = this.model.toJSON()

        this.groupSetter = new GroupSetter({
            groupId,
            groupType,
            userIsOwner,
            send: this.send,
            groupForbidden,
            memberForbidden,
            deleteGroupCallback: () => {
                this.model.set({ groupStatus: 2 })
            },
            updateGroupDetailCallback: data => {
                const groupName = decodeURIComponent(data.groupName)
                this.$el.find('#groupName').html(groupName)
                // $('.current-checked-item').find('.groupname-panel').html(groupName)
            },
        })
    },

    toggleMemberListPanel() {
        this.$el.find('#memberListContainer').toggleClass('hide')
        if (!this.memberList) {
            const {
                groupId, groupType, groupStatus, userIsOwner, groupForbidden, memberForbidden,
            } = this.model.toJSON()
            this.memberList = new MemberList({
                el: this.$el.find('#memberListContainer')[0],
                source: 'memberList',
                send: this.send,
                groupId,
                oldGroupType: groupType,
                userIsOwner,
                groupForbidden,
                memberForbidden,
                canOperate: +groupStatus !== 2,
                memberModel: this.memberModel,
            })
        }

        return false
    },

    hideMemberList() {
        this.$el.find('#memberListContainer').addClass('hide')
        if (this.stuOperatePanel) {
            this.stuOperatePanel.close()
        }
        if (this.contextMenu) {
            this.contextMenu.close()
        }

        this.$el.find('.emotion-box').hide()

        this.isEmotionHide = true
    },

    showStudentInfo(e) {
        const {
            groupId, groupType, groupName, userIsOwner, groupForbidden, memberForbidden,
        } = this.model.toJSON()
        // 身份为管理员，且群已经被群禁言(单禁)，不允许任何操作
        if (!userIsOwner && (+groupForbidden === 2 || +memberForbidden === 2)) {
            alert('您已被禁言，不支持该操作')
            return
        }

        const userId = $(e.currentTarget).attr('userid')
        const imUserId = $(e.currentTarget).attr('imuserid')
        const clientX = $(e.currentTarget)[0].x + 25
        const clientY = $(e.currentTarget)[0].y + 25
        const screenHeight = $(window).height()
        $('.stu-operate-panel').remove()

        const $div = $('<div>')
        $div.attr('class', 'stu-operate-panel')
        if (screenHeight - clientY < 150) {
            // 将panel置于上方
            $div.css({
                bottom: `${screenHeight - clientY}px`,
                left: `${clientX}px`,
            })
        } else {
            // 将panel置于下方
            $div.css({
                top: `${clientY}px`,
                left: `${clientX}px`,
            })
        }

        $('body').append($div)

        if (this.stuOperatePanel) {
            this.stuOperatePanel.undelegateEvents()
        }
        this.stuOperatePanel = new StuOperatePanel({
            userId,
            imUserId,
            send: this.send,
            groupId,
            oldGroupType: groupType,
            groupName,
            el: $div[0],
            memberModel: this.memberModel,
            aiteCallback: this.aiteSomebody.bind(this),
            memberList: this.memberList,
            userIsOwner, // false代表管理员 true标识群主
        })

        this.$el.find('#messagesPanel').css({
            overflow: 'hidden',
        })

        e.stopPropagation()
    },

    addMember() {
        const { groupId, groupName } = this.model.toJSON()
        this.addMemberDialog = new AddMemberDialog({
            groupId,
            send: this.send,
            groupName,
            memberModel: this.memberModel,
        })
    },

    aiteSomebody(options) {
        const { imUserId, nickName, type = 2 } = options
        // type代表触发@的类型
        // type为1表示通过@触发，这时，要移除输入域中最后一个@
        // type为2表示通过点击用户头像选择@触发，这时无需移除最后一个@
        // 默认为2

        if (type === 1) {
            const $aiteArr = this.$('#message').find('.aite')
            $aiteArr.eq($aiteArr.length - 1).remove()
        }

        const input = $(`<input type="text" readonly class="aite-ipt" data-imid="${imUserId}" value="@${nickName}">`)

        input.css('width', (common.getCharNums(nickName) + 2) * 7)

        this.$el.find('#message').append(input).focus()
    },

    showAiteMemberList({ top, left }) {
        const {
            groupId, userIsOwner, groupForbidden, memberForbidden,
        } = this.model.toJSON()
        // this.aiteMemberList && this.aiteMemberList.undelegateEvents()
        if (this.aiteMemberList) {
            this.aiteMemberList.undelegateEvents()
        }
        this.aiteMemberList = new MemberList({
            source: 'aiteMemberList',
            groupId,
            userIsOwner,
            groupForbidden,
            send: this.send,
            memberForbidden,
            showHeader: false,
            showUserStatus: false,
            showAllUserBtn: true,
            category: 2, // 2代表拉取@成员;
            handleClick: ({ imUserId, nickName }) => {
                this.aiteSomebody({
                    imUserId,
                    nickName,
                    type: 1,
                })
                this.removeAiteMemberList()
            },
            memberModel: this.memberModel,
        })
        const div = document.createElement('div')
        $('body').append(div)
        const height = $(window).height()
        $(div).css({
            position: 'absolute',
            bottom: height - top,
            left,
            height: 300,
            top: 'auto',
        })
        $(div).addClass('member-list no-footer')
        $(div).append(this.aiteMemberList.$el)
        $('body').on('click', () => {
            this.removeAiteMemberList()
            if (this.aiteMemberList) {
                this.aiteMemberList.destroy()
            }
        })
    },

    removeAiteMemberList() {
        if (this.aiteMemberList) {
            this.aiteMemberList.$el.parent().remove()
        }
    },

    setMemberCount() {
        const { memberCount } = this.memberModel.toJSON()

        this.$el.find('#memberCount').html(memberCount)
    },

    /*= ================== 发送消息部分 ====================== */
    getDefaultParams() {
        const { groupId, teacherUrl, teacherNickname } = this.model.toJSON()
        const { userName } = common.getUserInfo()
        const imUserId = common.getUserInfo().imIdForGroup
        const uniqueKey = `${imUserId}${Date.now()}`
        return {
            groupId,
            imUserId,
            uniqueKey,
            senderRealName: userName,
            senderPortrait: teacherUrl,
            fromUserNickName: teacherNickname,
        }
    },

    handleSendMessageSuccess(uniqueKey, chatContent, type = 17) {
        // 清空输入框
        if (type === 17) {
            this.$el.find('#message').html('')
        }
        const { latestTime, teacherNickname, teacherUrl } = this.model.toJSON()
        this[`sentItem${uniqueKey}`] = new SentItem({
            chatContent,
            latestTime,
            teacherNickname,
            teacherUrl,
            type,
        })
        this.model.set({ latestTime: moment().format('YYYY-MM-DD HH:mm:ss') })
        this.$el.find('#messageListPanel').append(this[`sentItem${uniqueKey}`].$el)
        this.scrollToBottom()
    },

    // 发送普通文本消息
    sendMessage() {
        let message = this.$('#message').html()
        const iptList = this.$('#message').find('input')

        let hasAite = 0
        const toImIdList = []

        if (iptList.length) {
            hasAite = 1

            iptList.each(function () {
                const imUserId = $(this).data('imid')
                const nickName = $(this).val()
                if (nickName === '@全体成员') {
                    hasAite = 2
                }

                toImIdList.push(imUserId)
            })
        }

        message = formatTextWithEmotion(message)

        if (!message) {
            alert('发送消息不能为空')
            return false
        }

        // 现在发信息是可以加表情的，
        // 但是传给服务器时，需要转化为纯文本
        const div = document.createElement('div')
        div.innerHTML = message
        const chatContent = getNodeText(div).trim()

        if (!chatContent) {
            alert('发送消息不能为空')
            return false
        }

        if (chatContent.length > 500) {
            alert('单条消息不能超过500字符')
            return false
        }

        const bsParams = this.getDefaultParams()

        const params = {
            chatContent,
            hasAite,
            toImIdList,
            messageType: 17, // 17表示普通文本消息
            ...bsParams,
            fromUserMemberDegree: this.model.get('userIsOwner'),
        }

        const rs = this.send({
            command: 'SEND',
            data: params,
        })
        if (rs) {
            const { uniqueKey } = bsParams
            this.handleSendMessageSuccess(uniqueKey, chatContent)
        }

        return true
    },
    // 发送图片
    sendImage(src) {
        const chatContent = src
        const bsParams = this.getDefaultParams()

        const params = {
            messageType: 19, // 为19代表的是图片
            chatContent,
            fromUserMemberDegree: this.model.get('userIsOwner'),
            ...bsParams,
        }

        const rs = this.send({
            command: 'SEND',
            data: params,
        })

        if (rs) {
            const { uniqueKey } = bsParams
            this.handleSendMessageSuccess(uniqueKey, chatContent, 19)
        }
    },

    // 发送语音
    sendAudio(e) {
        let bsParams = ''

        if ($(e.currentTarget).hasClass('icon-audio-active')) {
            this.recorder.stop()
        } else {
            this.$el.find('#message').hide()
            this.$el.find('#canvasContainer').show()
            if (!this.recorder) {
                const that = this
                this.recorder = new Recorder({
                    callback: blob => {
                        const oData = new FormData()
                        oData.append('file', blob, 'audio.wav')
                        $.ajax({
                            url: url.UPLOAD_AUDIO_FILE,
                            type: 'post',
                            data: oData,
                            dataType: 'json',
                            processData: false,
                            cache: false,
                            contentType: false,
                        }).done(response => {
                            if (response.rs) {
                                const {
                                    linkUrl, amrLinkUrl, mp3LinkUrl, fileName, size, duration,
                                } = response.resultMessage[0]

                                const chatContent = {
                                    tip,
                                    filename: fileName,
                                    fileSize: size,
                                    fileUrl: linkUrl,
                                    amrFileUrl: amrLinkUrl,
                                    mp3FileUrl: mp3LinkUrl,
                                    duration,
                                }

                                const rs = that.send({
                                    command: 'SEND',
                                    data: {
                                        chatContent,
                                        messageType: 18,
                                        fromUserMemberDegree: that.model.get('userIsOwner'),
                                        ...bsParams,
                                    },
                                })

                                if (rs) {
                                    that[`sentItem${bsParams.uniqueKey}`].update({
                                        chatContent,
                                    })
                                }
                            } else {
                                alert(response.rsdesp)
                            }

                            that.$el.find('#timeLeft').html('')
                        })
                    },
                    uiCallback: () => {
                        // 先将音频消息加入到聊天窗口中
                        bsParams = that.getDefaultParams()
                        that.handleSendMessageSuccess(bsParams.uniqueKey, {}, 18)
                        // dom处理
                        that.$el.find('#message').show()
                        that.$el.find('#canvasContainer').hide()
                        that.$el.find('#timeLeft').html('')
                        that.$el.find('#sendAudioBtn').removeClass('icon-audio-active')
                    },
                    maxlength: 60,
                    onTimeChange: time => {
                        if (time < 1) {
                            this.$el.find('#timeLeft').html('')
                        } else {
                            that.$el.find('#timeLeft').html(`还可输入${time}秒`)
                        }
                    },
                    canvasId: 'analyser',
                })
            }

            this.recorder.start()
            $(e.currentTarget).addClass('icon-audio-active')
        }
    },

    sendFile() {
        common.fileUploader(response => {
            if (response.rs) {
                const {
                    fileName, linkUrl, size,
                } = response.resultMessage[0]
                this.$el.find('.file-container').html(`文件“${fileName}”上传成功~`).addClass('success')
                setTimeout(() => {
                    this.$el.find('.file-container').removeClass('success').hide()
                    this.$el.find('.chat-panel-body').removeClass('.pd50')
                }, 5000)

                // 发送文件
                const bsParams = this.getDefaultParams()
                const { uniqueKey } = bsParams
                this.handleSendMessageSuccess(uniqueKey, { fileName, fileSize: size, fileUrl: linkUrl }, 20)

                this.send({
                    command: 'SEND',
                    data: {
                        messageType: 20,
                        chatContent: {
                            tip,
                            fileName,
                            fileSize: size,
                            fileUrl: linkUrl,
                        },
                        hasAite: 0,
                        fromUserMemberDegree: this.model.get('userIsOwner'),
                        ...bsParams,
                    },
                })
            } else {
                this.$el.find('.file-container').html(response.rsdesp).addClass('error')
                setTimeout(() => {
                    this.$el.find('.file-container').removeClass('error').hide()
                    this.$el.find('.chat-panel-body').removeClass('.pd50')
                }, 5000)
            }
        }, options => {
            const { name, size } = options
            const MAX_SIZE = 10 * 1024 * 1024 // 最大10M
            if (size > MAX_SIZE) {
                alert('上传文件大小不可超过10M')
                return false
            }
            this.$el.find('.file-container').html(`文件“${name}”正在上传中...`).show()
            this.$el.find('.chat-panel-body').addClass('.pd50')
            return true
        }, [
            'application/msword', // doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
            'application/vnd.ms-excel', // xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'application/vnd.ms-powerpoint', // ppt
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
            'application/pdf', // pdf
        ])
    },

    sendVideo() {
        common.uploadVideo(response => {
            if (response.rs) {
                const {
                    fileName, linkUrl, size, duration, imgUrl,
                } = response.resultMessage[0]
                this.$el.find('.file-container').html(`文件“${fileName}”上传成功~`).addClass('success')
                setTimeout(() => {
                    this.$el.find('.file-container').removeClass('success').hide()
                    this.$el.find('.chat-panel-body').removeClass('.pd50')
                }, 5000)

                // 发送文件
                const bsParams = this.getDefaultParams()
                const { uniqueKey } = bsParams
                this.handleSendMessageSuccess(uniqueKey, { fileName, fileSize: size, fileUrl: linkUrl }, 20)

                this.send({
                    command: 'SEND',
                    data: {
                        messageType: 21,
                        chatContent: {
                            tip,
                            fileName,
                            duration,
                            imgUrl,
                            fileSize: size,
                            fileUrl: linkUrl,
                        },
                        hasAite: 0,
                        fromUserMemberDegree: this.model.get('userIsOwner'),
                        ...bsParams,
                    },
                })
            } else {
                this.$el.find('.file-container').html(response.rsdesp).addClass('error')
                setTimeout(() => {
                    this.$el.find('.file-container').removeClass('error').hide()
                    this.$el.find('.chat-panel-body').removeClass('.pd50')
                }, 5000)
            }
        }, data => {
            const { name, size } = data
            const MAX_SIZE = 10 * 1024 * 1024
            if (size > MAX_SIZE) {
                alert('上传文件大小不可超过10M')
                return false
            }
            this.$el.find('.file-container').html(`文件“${name}”正在上传中...`).show()
            this.$el.find('.chat-panel-body').addClass('.pd50')
            return true
        })
    },

    sendAgain(e) {
        const uniqueKey = $(e.currentTarget).attr('key')
        const chatContent = $(e.currentTarget).attr('content')
        const type = $(e.currentTarget).attr('type')
        const bsParams = Object.assign({}, this.getDefaultParams(), { uniqueKey })

        const params = {
            messageType: type, // 17表示普通文本消息
            chatContent,
            fromUserMemberDegree: this.model.get('userIsOwner'),
            ...bsParams,
        }
        const rs = this.send({
            command: 'SEND',
            data: params,
        })

        if (rs) {
            this[`sentItem${uniqueKey}`].update({
                status: 0, // 正在发送状态
            })
        }
    },
    /** ===================== 发送消息部分结束 ================================ */
    // 预览图片
    previewImg(e) {
        const imgUrl = $(e.currentTarget).attr('src')
        const d = new ImgPreview({ imgUrl })
        console.log(d)
    },

    // 初始化图片按钮
    uploadPic() {
        common.picUploaderNew(response => {
            if (response.rs) {
                const { linkUrl } = response.resultMessage[0]
                this.imgSender.setModel({
                    url: linkUrl,
                    isUploading: false,
                })
            } else {
                alert(`上传图片失败:${response.rsdesp}`)
            }
        }, ({ name, size, type }) => {
            const maxSize = 1024 * 1024 * 5 // 最大为5M
            if (size > maxSize) {
                alert('上传图片不得大于5M')
                return false
            }
            const extension = name.substr(name.lastIndexOf('.') + 1).toLowerCase()

            if (!(extension && /^(jpg|png|bmp)$/.test(extension))) {
                alert('请上传格式为 jpg|png|bmp 的图片！')
                return false
            }

            $('#uploadPicBtn').removeClass('disabled')
            const that = this
            if (this.imgSender) {
                this.imgSender.undelegateEvents()
            }
            this.imgSender = new ImgSender({
                ok() {
                    that.sendImage.call(that, this.model.toJSON().url)
                    this.closeDialog()
                },
            })
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                this.imgSender.setModel({
                    url: reader.result,
                    isUploading: true,
                })
            })
            const picFile = document.querySelector('input[name="picFile"]').files[0]
            if (picFile) {
                reader.readAsDataURL(picFile)
            }

            return {}
        })
    },

    // 上传gif
    sendGif() {
        common.picUploaderNew(response => {
            if (response.rs) {
                const { linkUrl } = response.resultMessage[0]
                this.imgSender.setModel({
                    url: linkUrl,
                    isUploading: false,
                })
            } else {
                alert(`上传图片失败:${response.rsdesp}`)
            }
        }, ({ name, size, type }) => {
            const maxSize = 1024 * 1024 * 5 // 最大为5M
            if (size > maxSize) {
                alert('上传图片不得大于5M')
                return false
            }
            const extension = name.substr(name.lastIndexOf('.') + 1).toLowerCase()

            if (!(extension && /^(gif)$/.test(extension))) {
                alert('请上传gif图片')
                return false
            }

            $('#uploadPicBtn').removeClass('disabled')
            const that = this
            if (this.imgSender) {
                this.imgSender.undelegateEvents()
            }
            this.imgSender = new ImgSender({
                ok() {
                    that.sendImage.call(that, this.model.toJSON().url)
                    this.closeDialog()
                },
            })
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                this.imgSender.setModel({
                    url: reader.result,
                    isUploading: true,
                })
            })
            const picFile = document.querySelector('input[name="picFile"]').files[0]
            if (picFile) {
                reader.readAsDataURL(picFile)
            }

            return {}
        }, url.UPLOAD_GIF)
    },

    // 点击回车发送消息
    initEnterEvent() {
        const $message = this.$el.find('#message')
        $message.on('focus', e => {
            this.model.set('enableEnterEvent', true)
        })
        $message.on('click', e => {
            this.removeAiteMemberList()
        })

        $message.on('blur', e => {
            this.model.set('enableEnterEvent', false)
        })

        $message.on('keydown', event => {
            const { enableEnterEvent } = this.model.toJSON()
            if (+event.keyCode === 13 && enableEnterEvent) {
                event.preventDefault()
                this.sendMessage()
                return false
            }

            return true
        })

        $message.on('input', event => {
            let message = this.$el.find('#message').html()

            const plainMessage = getNodeText(this.$el.find('#message')[0]).trim()

            if (plainMessage === '@') {
                message = '<span class="aite">@</span>'
                this.$el.find('#message').html(message)
                const $aite = this.$el.find('#message').find('.aite')
                this.showAiteMemberList($aite.eq($aite.length - 1).offset())

                event.preventDefault()
                this.$el.find('#message').blur()
            } else if (plainMessage[plainMessage.length - 1] === '@') {
                message = message.replace(/([^"])@/ig, '$1<span class="aite">@</span>')

                this.$el.find('#message').html(message)
                const $aite = this.$el.find('#message').find('.aite')
                this.showAiteMemberList($aite.eq($aite.length - 1).offset())

                event.preventDefault()
                this.$el.find('#message').blur()
            }
        })

        $message.on('paste', e => {
            let hasImg = false
            let items = ''

            const getPasteImage = evt => {
                const rst = evt.clipboardData
                    && evt.clipboardData.items
                    && +evt.clipboardData.items.length === 1 && /^image\//.test(evt.clipboardData.items[0].type) ? evt.clipboardData.items : null

                return rst
            }

            const that = this
            const sendAndInsertImage = function (file) {
                // 模拟数据
                const fd = new FormData()
                fd.append('picName', 'screenshot')
                fd.append('picFile', file)
                const xhr = new XMLHttpRequest()
                xhr.open('post', '/community-manager-war/base/uploadPicture.action', true)
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
                xhr.addEventListener('load', evt => {
                    try {
                        const response = JSON.parse(evt.target.response)
                        if (response.rs) {
                            const { linkUrl } = response.resultMessage[0]
                            that.imgSender.setModel({
                                url: linkUrl,
                                isUploading: false,
                            })
                        }
                    } catch (er) {
                        console.log(er)
                    }
                })
                xhr.send(fd)
            }
            // 获取粘贴板文件列表或者拖放文件列表
            items = e.type === 'paste' ? getPasteImage(e.originalEvent) : ''
            if (items) {
                if (this.imgSender) {
                    this.imgSender.undelegateEvents()
                }
                this.imgSender = new ImgSender({
                    ok() {
                        that.sendImage.call(that, this.model.toJSON().url)
                        this.closeDialog()
                    },
                })

                let len = items.length - 1
                let file = {}
                while (len >= 0) {
                    file = items[len]
                    if (file.getAsFile) file = file.getAsFile()
                    if (file && file.size > 0 && /image\/\w+/i.test(file.type)) {
                        sendAndInsertImage(file)
                        hasImg = true

                        const reader = new FileReader()
                        reader.addEventListener('load', () => {
                            this.imgSender.setModel({
                                url: reader.result,
                                isUploading: true,
                            })
                        })

                        if (file) {
                            reader.readAsDataURL(file)
                        }
                    }

                    len -= 1
                }
                if (hasImg) return false
            }
            return null
        })
    },

    // 解除回车事件绑定
    offEnterEvent() {
        $('#message').off('keydown')
    },

    scrollToBottom() {
        if (this.$el.find('#messagesPanel').css('overflow') === 'hidden') {
            return
        }
        const nscrollHeight = this.$('#messagesPanel')[0].scrollHeight // 代表整个滚动区域的高度
        this.$('#messagesPanel').scrollTop(nscrollHeight)
        // 隐藏新消息提示
        this.$('.new-messages-tip').hide()
    },

    loading() {
        this.$el.find('#messageListPanel').html('<div class="img-container"></div>')
    },

    removeLoading() {
        this.$el.find('.img-container').remove()
    },

    /*= ====================该部分不受websocket改动影响=============================== */
    initEmotionBox() {
        const d = new EmotionBox({
            el: this.$el.find('.emotion-box')[0],
        })

        console.log(d)
    },
    // 显示表情框
    showEmotion(e) {
        this.isEmotionHide = this.isEmotionHide === undefined ? true : this.isEmotionHide
        if (this.isEmotionHide) {
            this.$('.emotion-box').show()
        } else {
            this.$('.emotion-box').hide()
        }
        this.isEmotionHide = !this.isEmotionHide

        e.stopPropagation()
    },

    preventProp(e) {
        e.stopPropagation()
    },

    // 切表情tab
    chooseEmotionTab(e) {
        const cNode = $(e.currentTarget)
        const cParNode = cNode.parent()
        const containerNode = cParNode.parent()

        if (cNode.hasClass('current')) {
            return
        }

        const value = cNode.attr('value')
        // 图片替换key
        let selectValue = 'new'
        if (value === 'new') {
            selectValue = 'old'
        }

        // 剔除原选中
        cParNode.find('.current').removeClass('current').find('img').attr('src', `./images/emotion-tab/${selectValue}.png`)

        cParNode.find(`.emotion-tab-${value}`).addClass('current').find('img').attr('src', `./images/emotion-tab/${value}-selected.png`)

        containerNode.find('.emotion-list').hide()
        containerNode.find(`.emotion-list-${value}`).show()

        e.stopPropagation()
    },

    chooseEmotion(e) {
        const cNode = $(e.currentTarget)
        const emotion = $(e.currentTarget).attr('emotion')
        // 老的表情包
        if (cNode.parents('ul.emotion-list-old').length) {
            this.$('#message').append(`<img src="./images/emotion/${emotion}.png" class="emotion-img">`)
        } else {
            // 直接将图片发送出去
            this.sendImage(`http://store.sunlands.com/common/facebig/${emotion}.png`)
        }

        this.$('.emotion-box').hide()
        this.isEmotionHide = true
    },
    // 右键撤回消息
    rightMenu(e) {
        // 如果已经群禁言了 且 身份是管理员，不允许撤回操作
        const {
            groupId, groupName, userIsOwner, groupForbidden, memberForbidden,
        } = this.model.toJSON()
        if ((+groupForbidden === 2 || +memberForbidden === 2) && !userIsOwner) {
            return
        }
        e.preventDefault()
        const top = $(e.currentTarget).offset().top + 40
        const left = $(e.currentTarget).offset().left + 40


        const {
            btntype: btnType,
            imuserid: imUserId,
            messageid: messageId,
            messagetype: messageType,
            sendtime,
            messagestatus: messageStatus,
            chatcontent: chatContent,
        } = e.currentTarget.dataset

        if (+messageStatus === 1 || !messageId) {
            return
        }
        if (this.contextMenu) {
            this.contextMenu.close()
        }
        this.contextMenu = new ContextMenu({
            left,
            top,
            groupId,
            groupName,
            send: this.send,
            imUserId,
            messageId,
            messageType,
            chatContent,
            btnType,
            sendtime, // 多传递一个发送时间
            el: $('body'),
            msgWrap: e.currentTarget,
            withDrawCallback: this.withDrawCallback.bind(this),
            showRelay: this.showRelay.bind(this),

        })
        this.$el.find('#messagesPanel').css({
            'overflow-y': 'hidden',
            overflow: 'hidden',
        })
    },

    // 撤回操作回调事件
    withDrawCallback({ messageId, imUserId, revokeSuccessCallback }) {
        this.REVOKE_LIST = this.REVOKE_LIST ? this.REVOKE_LIST : {}
        this.REVOKE_LIST[messageId] = revokeSuccessCallback
        const { groupId } = this.model.toJSON()
        const data = {
            groupId,
            messageId,
            imUserId,
        }
        this.send({
            command: 'REVOKE',
            data,
        })
    },

    // 点击转发
    showRelay(data) {
        const { teacherNickname, teacherUrl, userIsOwner } = this.model.toJSON()
        const props = data
        // 传递发送
        props.send = this.send
        // 传递关闭
        props.closeRelay = this.closeRelay
        // 增加参数
        props.fromUserMemberDegree = userIsOwner
        props.fromUserNickName = teacherNickname
        props.senderPortrait = teacherUrl


        const component = <Relay ref={ref => { this.relayComponent = ref }} {...props} />
        const relayDom = $('#relayDom')
        // 打点
        util.slog('group_click_forward', {
            messageId: props.messageId,
        })

        render(
            null,
            relayDom[0],
        )

        render(
            component,
            relayDom[0],
        )
    },

    // 关闭转发
    closeRelay() {
        console.log('关闭转发')
        const relayDom = $('#relayDom')
        render(
            null,
            relayDom[0],
        )
    },

    // 群转发备选项改变的响应
    getTransGroupMsgList(data) {
        this.relayComponent.getTransGroupMsgList(data)
    },

    // 群转发返回
    mutiSendRs(data) {
        const { resultFlag, failedList, errorReason } = data
        if (resultFlag) {
            alert('群消息转发成功')
        } else if (errorReason) {
            alert(errorReason)
        } else {
            const param = {
                failedList,
            }
            if (failedList && failedList.length) {
                // 渲染日志
                const d = new Dialog({
                    title: '提示',
                    type: 2,
                    content: failTpl(param),
                    ok() {
                        d.closeDialog()
                    },
                })
            }
        }
    },

    // 处理撤回消息的响应
    handleRevokeMsgSuccess(data) {
        const {
            successFlag, messageId,
        } = data
        if (this.REVOKE_LIST && this.REVOKE_LIST[messageId]) {
            this.REVOKE_LIST[messageId]({ successFlag })
        }
    },

    format(data) {
        const {
            groupStatus, userIsOwner, groupForbidden, memberForbidden,
        } = data
        // 群已解散
        if (+groupStatus === 2) {
            data.isNormalGroup = false
        } else {
            data.isNormalGroup = true
        }

        data.forbiddenShow = data.isNormalGroup && !(!userIsOwner && (+groupForbidden === 2 || +memberForbidden === 2))
        data.forbiddenSend = !userIsOwner && (+groupForbidden === 2 || +memberForbidden === 2)

        // forbiddenShow为原有条件（不可考证），并且不能为班级群
        // data.forbiddenAdd = data.forbiddenShow && +data.groupType !== 2
        data.forbiddenAdd = data.forbiddenShow && ![2, 8].includes(+data.groupType)
        // data.forbiddenAdd = false

        return data
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(template(data))
        const { groupStatus } = data
        if (+groupStatus === 1) {
            // 说明该群未解散
            this.initEmotionBox()
            this.initEnterEvent()
        }
    },
})

export { ChatDialog }
