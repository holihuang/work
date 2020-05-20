import _ from 'underscore'

import React from 'react'
import ReactDom from 'react-dom'
import { global } from 'common/global'
import { QuickReply } from './quickReplyReact/index'
import { common } from '../../../common/common'
import { envCfg } from '../../../common/envCfg' // eslint-disable-line
import { Dialog } from '../../../components/dialog/index'
import { url } from '../../../common/url'
import { DetailInfo } from './detail/index'
import { HeadMaster } from './headmaster/index'
import { EmotionBox, formatTextWithEmotion, getNodeText } from '../../../common/emotionUtil'
import { ImgPreview } from '../../../components/imgPreview/index'
import { ImgSender } from '../../../components/imgSender/index'
import { Items } from './items/index'
import { chatInfoModelUtil } from '../chatInfo'
import tpl from './tpl.html'
import { QuestionAssist } from './questionAssist/index'
import util from '../../../common/util'

import QuickSend from '../../../imReact/quickSend/quickSend'
import HotSearch from '../../../imReact/hotSearch/hotSearch'
import SearchRegion from '../../../imReact/hotSearch/searchRegion'
import service from '../../../imReact/hotSearch/service'

const Model = window.Backbone.Model.extend({
    defaults: {
        messageList: [], // 自己的记录
        messageListAll: [], // 本小组聊天记录
        needScrollToBottom: true, // silent -- 每次重新渲染时是否需要滚动到底部
        scrollTop: 0, // silent -- 滚动位置
        needToCheckState: true, // silent
        watchType: 2, // 1-只看我的，2-本小组聊天记录（默认本小组聊天记录）
        filterArray: [],
        imHotSearch: false, // 智能匹配
        isCh: false, // 输入的是否是中文
        isSearch: true,
        inputLen: 0,
        isPaste: false,
        isResizing: false,
        lastDownX: 0,
    },
})

const ChatDialog = window.Backbone.View.extend({
    initialize(options) {
        const { send } = options

        this.send = send

        this.model = chatInfoModelUtil.model
        this.privateModel = new Model()

        this.listenTo(this.model, 'change:isGettingActiveChatInfo', this.render)
        this.listenTo(this.model, 'change:activeChatInfo', this.handleChatInfoChange)
        this.listenTo(this.model, 'change:hasMoreHistoryMessage', this.handleHasMoreChange)
        this.listenTo(this.model, 'change:hasMoreHistoryMessageAll', this.handleHasMoreChange)
        this.listenTo(this.model, 'change:isGettingMoreMessage', this.handleIsGettingMoreMessage)
        this.listenTo(this.model, 'change:isGettingMoreMessageAll', this.handleIsGettingMoreMessage)
        this.listenTo(this.model, 'change:answerList', this.handleReceiveQuestionAssistMessage)
        this.listenTo(this.model, 'change:isShowAssist', this.handleReceiveQuestionAssistMessage)
        this.listenTo(this.privateModel, 'change:imHotSearch', this.initializeHotFlagWrapper)
        this.listenTo(this.privateModel, 'change', this.handlePrivateModelChange)

        this.getIntelligentSearch()

        this.render()
    },

    events: {
        'click #sendMessageBtn': 'sendTextMessage',
        'click .get-more': 'getHistroyMessageList',
        'click #showEmotion': 'showEmotionBox',
        'click .img-emotion': 'chooseEmotion',
        'click .emotion-tab': 'chooseEmotionTab',
        'click .emotion-tab-container': 'preventProp',
        'click #quickReplysBtn': 'showAllQuickReplys',
        'click #closeDialogBtn': 'close', // 关闭窗口
        'click #sendFileBtn': 'sendFile', // 发送文件
        'click #quickSend': 'quickSend', // 快捷回复
        'click .chat-img': 'previewImg',
        'click #uploadPicBtn': 'uploadImg',
        'keydown #message': 'handleEnter',
        'paste #message': 'handlePaste',
        'input #message': 'handleChange',
        'compositionstart #message': 'chStartHandler',
        'compositionend #message': 'chEndHandler',
        'click .icon-fail': 'reSend', // 重发
        'click .icon-fold': 'foldOrderDetail',
        'click .icon-unfold': 'unfoldOrderDetail',
        'click #transferBtn': 'handleTransfer',
        click: 'hideEmotionBox',
        'click #selfBtn': 'showSelfMessages', // 我的聊天记录
        'click #allBtn': 'showAllMessages', // 本小组聊天记录
        // 'mousedown #toggleBtn':'startResize',
        // 'mousemove .chat-panel-body-container':'onResize',
        // 'mouseup .chat-panel-body-container':'endResize',
    },
    // startResize(e){
    //     console.log('startResize')
    //     this.privateModel.set({
    //         isResizing: true,
    //         lastDownX : e.clientX
    //     })
    // },
    // onResize(e){
    //     if (!this.privateModel.get('isResizing'))
    //     return;
    //     if (!this._leftNode) {
    //         this._leftNode = this.$el.find('.resize_container_left')
    //         this._rightNode = this.$el.find('.resize_container_right')
    //     }
    //     console.log('onResize')
    //     console.log($('.resize_container').width())
    //     console.log('e.clientX:'+ e.clientX)
    //     console.log($('.resize_container').offset().left)
    //     let offsetLeft = e.clientX -  $('.resize_container').offset().left;
    //     let offsetRight = $('.resize_container').width() - offsetLeft
    //     this._leftNode.css('width', offsetLeft);
    //     this._rightNode.css('width', offsetRight);
    // },
    // endResize(e){
    //     console.log('endResize')
    //     this.privateModel.set({
    //         isResizing: false,
    //     })

    // },
    chStartHandler(e) {
        this.privateModel.set({ isCh: true })
    },

    chEndHandler(e) {
        const isOpenSearch = this.privateModel.get('imHotSearch')
        // e && e.target.innerText.length === 1 && chatInfoModelUtil.clearAnswerList()// 清楚问答辅助的弹窗
        this.privateModel.set({ isCh: false })
        if (e) {
            if (isOpenSearch) {
                if (e.target.innerText.length === 0) {
                    this.model.set({ isShowAssist: true })
                } else if (e.target.innerText.length > 0) {
                    this.model.set({ isShowAssist: false })
                }
                this.makeFilter(e.target.innerText.length, e.target.innerText.trim())
                if (this.privateModel.get('isPaste')) {
                    e.target.innerHTML = e.target.innerText
                    this.changeCursorPos()
                }
                // this.privateModel.get('isPaste') && (e.target.innerHTML = e.target.innerText)
                // this.privateModel.get('isPaste') && this.changeCursorPos()
            } else {
                this.model.set({ isShowAssist: true })
                if (e.target.innerText.length === 1) {
                    chatInfoModelUtil.clearAnswerList()
                }
                // e.target.innerText.length === 1 && chatInfoModelUtil.clearAnswerList()
            }
        }
    },
    changeCursorPos() {
        const el = document.getElementById('message')
        el.focus()
        const range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false)
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
        this.privateModel.set({ isPaste: false })
    },

    safe_tags_regex(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    },

    // 快捷回复追加
    appendTextHandler(opt) {
        const { id, quickReplyContent } = opt
        const oldText = this.$el.find('#message').html()
        const newText = oldText + this.safe_tags_regex(quickReplyContent)
        this.$el.find('#message').html(newText)
        // slog: 老师在聊天页面-右侧话术库tab下，左键点击文本话术回显到输入框
        this.onLog(id)
    },

    onLog(id) {
        const { userId, userAccount } = common.getUserInfo()
        util.slog('left_clicked_text_speechcraft', {
            userId,
            userAccount,
            clickedTxtId: id,
        })
    },

    handleChange(e) {
        const isOpenSearch = this.privateModel.get('imHotSearch')
        if (this.privateModel.get('isCh')) return
        if (e) {
            // 如果开启智能搜索
            if (isOpenSearch) {
                if (e.target.innerText.length === 0) {
                    this.model.set({ isShowAssist: true })
                } else if (e.target.innerText.length > 0) {
                    this.model.set({ isShowAssist: false })
                }
                this.makeFilter(this.safe_tags_regex(e.target.innerText).length, this.safe_tags_regex(e.target.innerText.trim()))
                if (this.privateModel.get('isPaste')) {
                    e.target.innerHTML = this.safe_tags_regex(e.target.innerText)
                    this.changeCursorPos()
                }
                // this.privateModel.get('isPaste') && (e.target.innerHTML = this.safe_tags_regex(e.target.innerText))
                // this.privateModel.get('isPaste') && this.changeCursorPos()
            } else {
                // 没有开启智能搜索
                this.model.set({ isShowAssist: true })
                if (e.target.innerText.length === 1) {
                    chatInfoModelUtil.clearAnswerList()
                }
                // e.target.innerText.length === 1 && chatInfoModelUtil.clearAnswerList()
            }
        }
    },

    makeFilter(len, val) {
        this.privateModel.set({ inputLen: val.trim().length })
        if (len === 2) {
            this.filterTalkList(val.trim())
            this.privateModel.set({ isSearch: false })
        } else if (len === 0 || len === 1) {
            this.initializeHotWrapper()
            this.privateModel.set({ isSearch: true })
        } else {
            this.filterTalkList(val.trim())
            this.privateModel.set({ isSearch: false })
        }
    },
    // 智能搜索回填
    backfillHandler(val) {
        this.$el.find('#message').html(this.safe_tags_regex(val))
        clearTimeout(this._timer)
        $('#hotWrapper').hide()
    },
    filterTalkList(value) {
        const filterArray = []
        const { allQuicklyReplys } = global
        const keyWords = value
        allQuicklyReplys.forEach(item => {
            const startIndex = item.quickReplyContent.indexOf(keyWords)
            if (startIndex !== -1) {
                filterArray.push(item)
            }
        })
        this.initializeHotWrapper(filterArray)
    },
    // 初始化智能搜索
    initializeHotWrapper(list = []) {
        const that = this
        const props = {
            dispatch: (name = '', evt = {}) => {
                if (that[name]) {
                    that[name](evt)
                } else {
                    console.warn('方法name不存在')
                }
            },
        }
        if (document.getElementById('hotWrapper') && list.length) {
            clearTimeout(this._timer)
            if (this.privateModel.get('imHotSearch')) {
                if (this.privateModel.get('inputLen') >= 2) {
                    // 添加埋点
                    const { userAccount, userId } = common.getUserInfo()
                    // slog: 智能搜索弹窗弹出
                    util.slog('intelligent_search_dialog_show', { userId, userAccount, popedMessageId: list.map(item => item.id) })
                    this._timer = setTimeout(() => {
                        this.initializeHotWrapper()
                    }, 8000)

                    $('#hotWrapper').show()

                    ReactDom.render(
                        <SearchRegion {...{ list }} {...props} />,
                        document.getElementById('hotWrapper'),
                    )
                }
            }
        } else {
            $('#hotWrapper').hide()
        }
    },

    toggleFlag(value) {
        this.privateModel.set({
            imHotSearch: !!value,
        })
    },

    //  获取智能搜索开关状态
    getIntelligentSearch() {
        // const that = this
        const userInfo = common.getUserInfo()
        service.getIntelligentSearch({
            userAccount: userInfo.userAccount,
            imUserId: userInfo.imId,
            channelCode: 'CS_BACKGROUND',
        }).then(response => {
            if (response === '1') {
                // this.setState({
                //     checked: Boolean(response),
                // })
                this.privateModel.set({
                    imHotSearch: Boolean(response),
                })
            }
        }, error => {
            alert(error)
        })
    },

    initializeHotFlagWrapper() {
        const that = this
        const imHotSearch = this.privateModel.get('imHotSearch')

        const props = {
            dispatch: (name = '', evt = {}) => {
                if (that[name]) {
                    that[name](evt)
                } else {
                    console.warn('方法name不存在')
                }
            },
        }
        if (document.getElementById('hotWrapperFlag')) {
            ReactDom.render(
                <HotSearch {...props} checked={imHotSearch} />,
                document.getElementById('hotWrapperFlag'),
            )
        }
    },

    handleReceiveQuestionAssistMessage() {
        const { answerList, isShowAssist } = this.model.toJSON()
        if (this.questionAssistEle) {
            this.questionAssistEle.remove()
            this.questionAssistEle = null
        }
        this.questionAssistEle = new QuestionAssist({
            el: this.$el.find('#questionAssistList')[0],
            callback: item => {
                this.$el.find('#message').html(this.$el.find('#message').html() + item.content)
            },
            answerList,
            isShowAssist,
        })
    },

    // 只看自己(我的聊天记录)
    showSelfMessages(e) {
        $(e.currentTarget).addClass('switch-active')
        this.$el.find('#allBtn').removeClass('switch-active')

        this.privateModel.set({
            watchType: 1,
        }, {
            silent: true,
        })

        this.renderMessageList()
        this.handleIsGettingMoreMessage()
    },

    // 所有记录(本小组聊天记录)
    showAllMessages(e) {
        $(e.currentTarget).addClass('switch-active')
        this.$el.find('#selfBtn').removeClass('switch-active')

        this.privateModel.set({
            watchType: 2,
        }, {
            silent: true,
        })

        this.renderMessageList()
        this.handleIsGettingMoreMessage()
    },

    /*
     * 当消息变化后，将数据放到私有model中，便于监听事件
     */
    handleChatInfoChange() {
        const { activeChatInfo } = this.model.toJSON()
        if (activeChatInfo === null || _.isEmpty(activeChatInfo)) {
            // 如果是null表示当前没有与任何人聊天，清除所有属性
            const imHotSearch = this.privateModel.get('imHotSearch')
            this.privateModel.clear()
            this.privateModel.set({
                imHotSearch,
            })
        } else {
            this.privateModel.set({
                ...activeChatInfo,
            })
        }
    },

    /*
     * 私有数据privateModel变化，细分：聊天对象变了，还是消息集合发生了变化
     */
    handlePrivateModelChange() {
        // 聊天对象变了，全部重新渲染
        if (this.privateModel.hasChanged('orderDetailId')) {
            // 判断当前会话是否为关闭状态
            const {
                // orderDetailId,
                isClosed,
            } = this.privateModel.toJSON()

            this.privateModel.set({
                needToCheckState: isClosed,
                needScrollToBottom: true,
                watchType: 2,
            }, {
                silent: true,
            })

            // 重置headmaster
            this.headmaster = null
            this.render()
            return
        }

        // if (this.privateModel.hasChanged('isClosed')) {
        //     this.handleCloseStateChanged();
        // }

        // 聊天对象没变，只渲染消息部分
        this.renderMessageList()
    },

    handleCloseStateChanged() {
        // const {isClosed} = this.privateModel.toJSON();
        // 值班老师也可以主动发起聊天，不再需要遮罩层block @gushouchuang
        // if (!chatInfoModelUtil.isTeacher()) {
        //     if (isClosed) {
        //         this.$el.find('.chat-container').append('<div class="publisher-mask">已结束会话不能聊天</div>');
        //     } else {
        //         this.$el.find('.publisher-mask').remove();
        //     }
        // }
    },

    /**
     * 是否还有更多消息
     */
    handleHasMoreChange() {
        const { watchType } = this.privateModel.toJSON()
        const hasMoreHistoryMessage = watchType === 1 ? this.model.get('hasMoreHistoryMessage') : this.model.get('hasMoreHistoryMessageAll')

        const $moreContainer = this.$el.find('#moreContainer')
        if (hasMoreHistoryMessage) {
            $moreContainer.html('<p class="get-more">点击加载更多~</p>')
        } else {
            $moreContainer.html('<p class="no-more">没有更多了~</p>')
        }
    },

    /*
     * 正在加载历史消息loading
     */
    handleIsGettingMoreMessage() {
        const { watchType } = this.privateModel.toJSON()

        const isGettingMoreMessage = watchType === 1 ? this.model.get('isGettingMoreMessage') : this.model.get('isGettingMoreMessageAll')
        const hasMoreHistoryMessage = watchType === 1 ? this.model.get('hasMoreHistoryMessage') : this.model.get('hasMoreHistoryMessageAll')
        const $moreContainer = this.$el.find('#moreContainer')
        const $loading = this.$el.find('.loading-list-items')

        if (isGettingMoreMessage) {
            $loading.removeClass('hide')
            $moreContainer.addClass('hide')
        } else {
            $loading.addClass('hide')

            if (hasMoreHistoryMessage) {
                $moreContainer.html('<p class="get-more">点击加载更多~</p>')
            } else {
                $moreContainer.html('<p class="no-more">没有更多了~</p>')
            }

            $moreContainer.removeClass('hide')
        }
    },

    generateKey() {
        const { orderDetailId } = this.privateModel.toJSON()
        return `${orderDetailId}${Date.now()}`
    },

    reSend(e) {
        const index = +$(e.currentTarget).attr('index')
        const { watchType } = this.privateModel.toJSON()

        const list = watchType === 1 ? this.privateModel.get('messageList') : this.privateModel.get('messageListAll')
        const item = list[messageList.length - 1 - index] // eslint-disable-line
        const { isClosed } = this.privateModel.toJSON()

        const { orderDetailId, uniqueKey } = item
        const { consultId } = chatInfoModelUtil.getConsultDetailByOrderId(orderDetailId) || {}

        const isTeacherEqual = chatInfoModelUtil.isTeacherEqual()
        if (!isTeacherEqual && isClosed) {
            // 非班主任且咨询已关闭
            alert('该咨询已关闭')
            return
        }

        this.send({
            command: isClosed || !this.isActiveClose() ? 'CREATE_SEND' : 'SEND',
            data: {
                ...item,
                consultId, // 这里是为了解决要拿最新的consultId的问题
            },
        }, () => {
            chatInfoModelUtil.resendMessage(uniqueKey)
        })
    },

    // 发送知识库的知识信息
    sendKnbaseMsg(options) {
        const {
            pageType, fileUrl, fileName, fileSize,
        } = options

        const uniqueKey = this.generateKey()
        const bsParams = this.getDefaultParams()
        // 图片
        if ([8].indexOf(pageType) > -1) {
            this.sendImg(fileUrl)
        } else if ([1, 2, 3, 7, 9].indexOf(pageType) > -1) { // 文件
            chatInfoModelUtil.addALoadingMessage({
                chatContent: JSON.stringify({
                    fileName,
                    fileSize,
                }),
                file: '', // 知识库不会返回文件内容
                uniqueKey,
                messageType: 4,
                isLoading: true,
                ...bsParams,
            })

            this.sendMessage({
                messageType: 4,
                chatContent: JSON.stringify({
                    tip: '您的班主任给您发送了资料文件，但您当前的App版本不支持接收资料文件，快升级到最新版本吧，么么哒！',
                    fileName,
                    fileUrl,
                    fileSize,
                }),
                uniqueKey,
                ...bsParams,
            })
        } else if ([5, 6].indexOf(pageType) > -1) { // mp3 mp4直接发Url 当做文本
            this.sendMessage({
                messageType: 1, // 1表示普通文本消息
                uniqueKey,
                chatContent: fileUrl,
                ...bsParams,
            })
        }
    },

    // consultState = 0标识关闭，需要CREATE_SEND
    isActiveClose() {
        const { orderDetailId } = this.privateModel.toJSON()
        const { messageList } = this.model.toJSON()
        const item = messageList.find(msgItem => msgItem.orderDetailId === orderDetailId)

        if (item) {
            return !!item.consultState
        } // 不符合业务预期 暂定为true
        return true
    },

    /**
     * 发送消息
     */
    sendMessage(data, isItEmpty = false) {
        // debugger
        // let isItEmptyValue = isItEmpty || false;
        const {
            // orderDetailId,
            // needToCheckState,
            isClosed,
        } = this.privateModel.toJSON()

        // const isTeacherEqual = chatInfoModelUtil.isTeacherEqual()
        // if (!isTeacher && isClosed) {
        //     alert('当前会话已关闭');
        //     return;
        // }

        const command = isClosed || !this.isActiveClose() ? 'CREATE_SEND' : 'SEND'

        this.send({
            command,
            data,
        }, () => {
            const { messageType } = data
            switch (messageType) {
            case 1: // 文本
                if (!isItEmpty) {
                    this.$el.find('#message').html('')
                }
                // 数据控制
                chatInfoModelUtil.addALoadingMessage({
                    ...data,
                    isLoading: true,
                })
                break
            case 3: // 图片
                // 数据控制
                chatInfoModelUtil.addALoadingMessage({
                    ...data,
                    isLoading: true,
                })
                break
            case 4: // 文件
                const { fileUrl, uniqueKey } = data
                chatInfoModelUtil.handleFileMessageStatusChange({
                    uniqueKey,
                    fileUrl,
                })
                break
            case 100: // 快捷回复
                // 数据控制
                chatInfoModelUtil.addALoadingMessage({
                    ...data,
                    isLoading: true,
                })
                break
            default:
                break
            }

            // 自己发送消息，需要设置滚动到底部
            this.privateModel.set({
                needScrollToBottom: true,
            }, {
                silent: true,
            })
        })
    },

    /**
     * 发送文本消息
     */
    sendTextMessage() {
        const message = formatTextWithEmotion(this.$el.find('#message').html().trim())
        // message = this.safe_tags_regex(message)
        if (!message) {
            alert('发送消息不能为空')
            return
        }

        // 提取纯文本
        const div = document.createElement('div')
        div.innerHTML = message
        const chatContent = getNodeText(div).trim()

        if (!chatContent) {
            alert('发送消息不能为空')
            return
        }

        if (chatContent.length > 1000) {
            alert('单条消息不能超过1000字符')
            return
        }

        const bsParams = this.getDefaultParams()

        const params = {
            messageType: 1, // 1表示普通文本消息
            uniqueKey: this.generateKey(),
            chatContent,
            ...bsParams,
        }

        this.sendMessage(params)
        // 关闭问答辅助弹窗
        // chatInfoModelUtil.clearAnswerList()
    },

    /**
     * 发送图片
     */
    sendImg(imgUrl) {
        const bsParams = this.getDefaultParams()
        this.sendMessage({
            messageType: 3,
            uniqueKey: this.generateKey(),
            chatContent: imgUrl,
            ...bsParams,
        })
    },

    /**
     * 发送文件
     */
    sendFile(options = {}) {
        const uniqueKey = this.generateKey()
        const bsParams = this.getDefaultParams()

        common.fileUploader(response => {
            if (response.rs) {
                const {
                    fileName,
                    // linkType,
                    linkUrl,
                    size,
                } = response.resultMessage[0]

                this.sendMessage({
                    messageType: 4,
                    chatContent: JSON.stringify({
                        tip: '您的班主任给您发送了资料文件，但您当前的App版本不支持接收资料文件，快升级到最新版本吧，么么哒！',
                        fileName,
                        fileUrl: linkUrl,
                        fileSize: size,
                    }),
                    uniqueKey,
                    ...bsParams,
                })
            } else {
                chatInfoModelUtil.handleFileSendFailed({
                    uniqueKey,
                })
            }
        }, fileInfo => {
            const { name: fileName, size: fileSize, file } = fileInfo

            chatInfoModelUtil.addALoadingMessage({
                chatContent: JSON.stringify({
                    fileName,
                    fileSize,
                }),
                file,
                uniqueKey,
                messageType: 4,
                isLoading: true,
                ...bsParams,
            })

            return true
        })
    },

    // destory 销毁快捷回复modal
    closeQuickSendModal() {
        ReactDom.render(
            null,
            document.getElementById('dialogContainer'),
        )
    },

    // 快捷发送
    triggerQuickSend(content = '') {
        // const { linkName } = JSON.parse(content)
        // 1.发送ws
        const bsParams = this.getDefaultParams()

        const params = {
            messageType: 100, // 100标识为快捷回复
            uniqueKey: this.generateKey(),
            chatContent: content, // JSON字符串
            ...bsParams,
        }

        this.sendMessage(params)

        // 关闭弹窗
        this.closeQuickSendModal()
    },

    // 渲染快捷回复modal
    quickSend() {
        // 渲染 react component Modal
        const that = this
        const { orderDetailId, activeUserId } = this.privateModel.toJSON()

        const props = {
            stuId: activeUserId,
            orderDetailId,
            dispatch: (name = '', evt = {}) => {
                if (that[name]) {
                    that[name](evt)
                } else {
                    console.warn('方法name不存在')
                }
            },
        }
        if (document.getElementById('dialogContainer')) {
            ReactDom.render(
                <QuickSend {...props} />,
                document.getElementById('dialogContainer'),
            )
        }
    },

    /**
     * 点击上传图片按钮
     */
    uploadImg() {
        const that = this

        let imgSender

        common.picUploaderNew(response => {
            if (response.rs) {
                const { linkUrl } = response.resultMessage[0]
                imgSender.setModel({
                    url: linkUrl,
                    isUploading: false,
                })
            } else {
                alert(`上传图片失败:${response.desp}`)
            }
        }, data => {
            const {
                // name,
                size,
                file,
            } = data
            const MAX_SIZE = 1024 * 1024 * 5 // 5M

            if (size > MAX_SIZE) {
                alert('上传图片不得大于5M')
                return
            }

            imgSender = new ImgSender({
                ok() {
                    const imgUrl = this.model.get('url')
                    that.sendImg(imgUrl)
                    this.closeDialog()
                },
            })

            const reader = new FileReader()
            reader.addEventListener('load', () => {
                imgSender.setModel({
                    url: reader.result,
                    isUploading: true,
                })
            })

            if (file) {
                reader.readAsDataURL(file)
            }
        })
    },

    /**
     * 粘贴事件处理
     */
    handlePaste(event) { // eslint-disable-line
        this.changeCursorPos()
        this.privateModel.set({ isPaste: true })
        const e = event.originalEvent

        let file = e.clipboardData &&
                    e.clipboardData.items &&
                    e.clipboardData.items.length === 1 &&
                    /^image\//.test(e.clipboardData.items[0].type) ? e.clipboardData.items[0] : null

        if (file) {
            const that = this
            const imgSender = new ImgSender({
                ok() {
                    const imgUrl = this.model.get('url')
                    that.sendImg(imgUrl)
                    this.closeDialog()
                },
            })

            if (file.getAsFile) file = file.getAsFile()

            const reader = new FileReader()
            reader.addEventListener('load', () => {
                imgSender.setModel({
                    url: reader.result,
                    isUploading: true,
                })
            })

            reader.readAsDataURL(file)

            // 发送图片到服务器
            const data = new FormData()
            data.append('picName', 'screenshot')
            data.append('picFile', file)

            $.ajax({
                url: url.UPLOAD_PIC,
                type: 'post',
                data,
                dataType: 'json',
                processData: false,
                cache: false,
                contentType: false,
            }).done(response => {
                if (response.rs) {
                    const { linkUrl } = response.resultMessage[0]
                    imgSender.setModel({
                        url: linkUrl,
                        isUploading: false,
                    })
                } else {
                    alert(response.rsdesp)
                }
            })

            // 阻止默认事件
            return false
        }
    },


    /**
     * 点击回车发送消息
     */
    handleEnter(e) {
        if (e.keyCode === 13) {
            this.sendTextMessage()
            // chatInfoModelUtil.clearAnswerList()
            return false
        }
        return true
    },

    /**
     * 获取历史消息
     */
    getHistroyMessageList() {
        const {
            orderDetailId, messageList = [], messageListAll = [], activeImIdUserId: studentImId, watchType,
        } = this.privateModel.toJSON()

        if (watchType === 1) {
            // 我的聊天记录
            const { consultId = 0, uniqueKey } = messageList[messageList.length - 1] || {}

            this.send({
                command: 'GET_HISTORY_MESSAGE_LIST',
                data: {
                    orderDetailId,
                    consultId: uniqueKey ? 0 : consultId,
                    studentImId,
                    watchType,
                    teacherImId: +common.getUserInfo().imUserId,
                },
            }, () => {
                chatInfoModelUtil.handleLoadingHistoryMessage()
            })
        } else {
            const { messageId = 0 } = messageListAll[messageListAll.length - 1] || {}

            this.send({
                command: 'GET_HISTORY_MESSAGE_LIST',
                data: {
                    orderDetailId,
                    studentImId,
                    messageId,
                    watchType,
                    teacherImId: +common.getUserInfo().imUserId,
                },
            }, () => {
                chatInfoModelUtil.handleLoadingHistoryMessageAll()
            })
        }
    },

    // 获取基本参数
    getDefaultParams() {
        const { orderDetailId, activeImIdUserId: toImUserId, activeUserId: userId } = this.privateModel.toJSON()
        const { consultId = 0 } = chatInfoModelUtil.getConsultDetailByOrderId(orderDetailId) || {}

        const params = {
            orderDetailId,
            toImUserId,
            userId,
            consultId,
            role: chatInfoModelUtil.model.get('role'),
            fromSource: 2,
            fromImUserId: +common.getUserInfo().imUserId, // 整数
            fromName: common.getUserInfo().userNickname,
            fromPortrait: '',
        }

        return params
    },

    /**
     * 快捷回复
     */
    showAllQuickReplys() {
        this.quickReply = new QuickReply({
            bsParams: this.getDefaultParams(),
            onClick: data => {
                this.sendMessage(data)
                return true
            },
        })
    },

    /**
     * 获取订单详情
     */
    getOrderDetail() {
        const { orderDetailId } = this.privateModel.toJSON()

        if (orderDetailId === undefined) {
            // @gushoucuhang bugfix 切换聊天 会连续触发两次getOrderDetail 且第一次orderDetailId为undefined。
            return
        }

        this.detailInfo = new DetailInfo({
            el: this.$el.find('#detailInfoContainer')[0],
            sendKnbaseMsg: this.sendKnbaseMsg.bind(this),
            orderDetailId,
            getDefaultParams: this.getDefaultParams.bind(this),
            sendMessage: this.sendMessage.bind(this),
            generateKey: this.generateKey.bind(this),
            appendTextHandler: this.appendTextHandler.bind(this),
        })
    },

    /**
     * 右侧订单详情的折叠与展开
     */
    foldOrderDetail(e) {
        this.$el.find('.resize_container_right').hide()
        $(e.currentTarget).removeClass('icon-fold').addClass('icon-unfold')
    },

    unfoldOrderDetail(e) {
        this.$el.find('.resize_container_right').show()
        $(e.currentTarget).removeClass('icon-unfold').addClass('icon-fold')
    },

    /**
     * 预览图片
     */
    previewImg(e) {
        const imgUrl = $(e.currentTarget).attr('src')
        this.imgPreview = new ImgPreview({ imgUrl })
    },

    /**
     * 关闭该咨询
     */
    close() {
        const { orderDetailId, isClosed } = this.privateModel.toJSON()
        const { consultId, imUserId: studentImId } = chatInfoModelUtil.getConsultDetailByOrderId(orderDetailId)

        if (isClosed) {
            alert('当前会话已关闭')
            return
        }

        if (window.confirm('确认关闭当前会话吗？')) {
            const role = chatInfoModelUtil.getRole()
            // 遗留代码特殊处理了dutyteacher，原因不明，rd希望去掉~
            // role === 'dutyteacher' && (role = 'ondutyTeacher')

            this.send({
                command: 'CLOSE',
                data: {
                    orderDetailId,
                    consultId,
                    studentImId,
                    // role: chatInfoModelUtil.isTeacher() ? 'teacher' : 'ondutyTeacher',
                    role,
                    teacherImId: +common.getUserInfo().imUserId, // int
                },
            }, () => {
                this.privateModel.set({
                    needToCheckState: true,
                }, {
                    silent: true,
                })
            })
        }
    },

    /**
     * 值班老师转接班主任
     */
    handleTransfer() {
        const { isClosed } = this.privateModel.toJSON()
        if (isClosed) {
            alert('会话已结束，不可转接班主任')
            return
        }

        // 获取该订单对应的班主任
        this.headmaster = new HeadMaster()

        const { orderDetailId, activeImIdUserId: studentImId } = this.privateModel.toJSON()

        this.send({
            command: 'GET_TEACHER_STATUS',
            data: {
                orderDetailId,
                studentImId,
                dutyImId: +common.getUserInfo().imUserId,
            },
        })

        const that = this
        this.d = new Dialog({
            title: '班主任信息',
            content: this.headmaster.$el,
            type: 4,
            ok() {
                // 点击确定时再次对咨询是否已关闭进行校验
                // 后端啥都不校验，全让我校验，太烦了。。。。
                if (that.privateModel.get('isClosed')) {
                    alert('会话已结束，不可转接班主任')
                    this.closeDialog()
                    return
                }

                const { orderDetailId: orderDetailIdDialog, activeImIdUserId: studentImIdDialog } = that.privateModel.toJSON()
                const { consultId } = chatInfoModelUtil.getConsultDetailByOrderId(orderDetailIdDialog)
                const {
                    teacherImId, online, teacherName, imageUrl,
                } = chatInfoModelUtil.getTeacherStatusInfo()

                if (!teacherImId) {
                    alert('当前学员还未分配班主任老师')
                    return
                }

                // to do
                // 获取班主任imid，值班老师imid，学生imid
                const rs = that.send({
                    command: 'TRANSFER_TEACHER',
                    data: {
                        orderDetailId: orderDetailIdDialog,
                        consultId,
                        teacherImId,
                        studentImId: studentImIdDialog,
                        online,
                        teacherName,
                        imageUrl,
                        dutyImId: +common.getUserInfo().imUserId,
                    },
                })

                if (rs) {
                    this.closeDialog()
                    chatInfoModelUtil.resetTeacherStatus()
                }
            },
            cancel() {
                // 重置老师状态的数据
                chatInfoModelUtil.resetTeacherStatus()
            },
        })
    },

    /**
     * 表情框
     */
    initEmotionBox() {
        this.emotionBox = new EmotionBox({
            el: this.$el.find('.emotion-box')[0],
        })
    },

    showEmotionBox() {
        if (this.$('.emotion-box').is(':visible')) {
            this.$('.emotion-box').hide()
        } else {
            this.$('.emotion-box').show()
        }
        return false
    },

    hideEmotionBox() {
        this.$el.find('.emotion-box').hide()
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
        const emotion = $(e.currentTarget).parent().attr('emotion')
        if (!emotion) {
            return // 会话窗里的记录
        }

        const cNode = $(e.currentTarget)
        // 老的表情包
        if (cNode.parents('ul.emotion-list-old').length) {
            this.$el.find('#message').append(`<img src="./images/emotion/${emotion}.png" class="emotion-img">`)
        } else {
            // 直接将图片发送出去
            this.sendImg(`http://store.sunlands.com/common/facebig/${emotion}.png`)
        }

        this.hideEmotionBox()
    },

    /**
     * 滚动事件监听
     */
    initScrollEvent() {
        // if (this.hasBindScrollEvent) {
        //     return;
        // }

        const $messagePanel = this.$el.find('#messagesPanel')

        $messagePanel.on('scroll', () => {
            const scrollTop = $messagePanel.scrollTop()

            const nscrollHeight = $messagePanel[0].scrollHeight // 代表整个滚动区域的高度

            const height = $messagePanel.height()

            this.privateModel.set({
                needScrollToBottom: nscrollHeight - (height + scrollTop) < 50,
            }, {
                silent: true,
            })

            if (!this.privateModel.get('needScrollToBottom')) {
                // 如果不需要滚动到底部，记录当前滚动的位置，在重新渲染后保持
                this.privateModel.set({
                    scrollTop,
                }, {
                    silent: true,
                })
            }
        })
    },

    /**
     * 滚动到底部
     */
    scrollToBottom() {
        const $messagesPanel = this.$el.find('#messagesPanel')
        if (!$messagesPanel[0]) {
            return
        }

        const nscrollHeight = $messagesPanel[0].scrollHeight

        $messagesPanel.scrollTop(nscrollHeight)

        // 隐藏新消息提示
        this.$el.find('.new-messages-tip').hide()
    },

    /*
     * 渲染消息
     */
    renderMessageList() {
        const {
            messageList = [], messageListAll = [], watchType, needScrollToBottom, activeImIdUserId,
        } = this.privateModel.toJSON()

        const list = watchType === 2 ? JSON.parse(JSON.stringify(messageListAll)) : JSON.parse(JSON.stringify(messageList))
        if (this.items) {
            this.items.undelegateEvents()
        }
        // this.items && this.items.undelegateEvents()
        this.items = new Items({
            messageList: list,
            isTeacher: chatInfoModelUtil.getRole() === 'teacher',
            isDutyTeacher: chatInfoModelUtil.getRole() === 'dutyteacher',
            isAfterTeacher: chatInfoModelUtil.getRole() === 'afterSaleTeacher',
            teacherImId: +common.getUserInfo().imUserId,
            studentImId: activeImIdUserId,
        })

        this.$el.find('#messageListPanel').empty().append(this.items.$el)

        // 控制视窗的滚动
        if (needScrollToBottom) {
            this.scrollToBottom()
        } else {
            const { scrollTop } = this.privateModel.toJSON()
            this.$el.find('#messagesPanel').scrollTop(scrollTop)
        }
    },

    destroy() {
        this.remove()
    },

    format(data) {
        const { orderDetailId } = data
        data.isChatting = orderDetailId > 0 // 当前是否正在进行聊天

        data.isTeacher = chatInfoModelUtil.isTeacher()
        data.isTeacherEqual = chatInfoModelUtil.isTeacherEqual()

        data.isGettingActiveChatInfo = chatInfoModelUtil.isGettingActiveChatInfo()

        return data
    },

    render() {
        const data = this.format({
            ...this.privateModel.toJSON(),
            orderDetailId: this.model.get('orderDetailId'),
            hasMoreHistoryMessage: this.model.get('hasMoreHistoryMessage'),
        })

        const { isChatting, isGettingActiveChatInfo } = data
        if (!isChatting) {
            return
        }

        this.$el.html(tpl(data))
        if (isChatting && !isGettingActiveChatInfo) {
            this.initEmotionBox()
            this.renderMessageList()
            this.initScrollEvent()
            this.getOrderDetail()
            this.$el.find('#message').focus()
        }
        this.handleReceiveQuestionAssistMessage()

        const hotSearchNode = this.$el.find('hotWrapper')
        if (hotSearchNode.length) {
            // 先干掉重复的壳子
            this.$el.find('#hotWrapper').remove()
            // 将原react组件 原滋原味的塞回来
            this.$el.find('#hotWrapper').parent().append(hotSearchNode)
        } else {
            // 第一次加载react组件
            this.initializeHotWrapper()
        }

        const hotSearchFlagNode = this.$el.find('hotWrapperFlag')
        if (hotSearchFlagNode.length) {
            // 先干掉重复的壳子
            this.$el.find('#hotWrapperFlag').remove()
            // 将原react组件 原滋原味的塞回来
            this.$el.find('#hotWrapperFlag').parent().append(hotSearchFlagNode)
        } else {
            // 第一次加载react组件
            this.initializeHotFlagWrapper()
        }
    },
})

export { ChatDialog }
