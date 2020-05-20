import _ from 'underscore'
import moment from 'moment'
import util from 'common/util'

const Model = Backbone.Model.extend({
    defaults: {
        online: 1, //默认在线
        role: 'teacher', //默认是班主任
        teacherAccount: '', //当前登录老师的263账号
        avatar: '', //当前登录老师的头像
        hasNewMessage: 0, //是否有新消息
        orderDetailId: -1, //选中的会话
        messageList: [], //左侧会话列表
        isGettingSessionList: false, //是否正在拉取左侧列表
        hasLoadedAllSessionList: false, //左侧列表是否已加载了全部
        activeChatInfo: {}, //右侧具体会话信息
        hasMoreHistoryMessage: true, //是否还有更多历史记录
        hasMoreHistoryMessageAll: true, //是否还有更多历史记录-聚合页
        isGettingActiveChatInfo: false, //是否正在拉取右侧会话信息
        isGettingMoreMessage: false, //是否正在拉取右侧历史记录
        isGettingMoreMessageAll: false, //是否正在拉取历史记录-聚合页
        teacherStatus: {}, //订单对应的班主任状态
        answerList: [], // 智能回复推送的问答消息列表
        queueNum: 0, // 当前老师排队的学员数 暂不支持reset
        isShowAssist: true,
    },

    reset: function() {
        this.set({
            orderDetailId: -1,
            messageList: [],
            isGettingSessionList: false, //是否正在拉取左侧列表
            hasLoadedAllSessionList: false, //左侧列表是否已加载了全部
            hasMoreHistoryMessage: true, //是否还有更多历史记录
            hasMoreHistoryMessageAll: true, //是否还有更多历史记录-聚合页
            activeChatInfo: {}, //只看自己
            isGettingActiveChatInfo: false, //是否正在拉取右侧会话信息
            isGettingMoreMessage: false, //是否正在拉取右侧历史记录
            isGettingMoreMessageAll: false, //是否正在拉取历史记录-聚合页
            teacherStatus: {}, //订单对应的班主任状态
            answerList: [], // 智能回复推送的问答消息列表
        })
    }
})

const chatInfoModelUtil = {
    model: new Model(),

    /*
     * 初始化
     */
    init: function() {
        this.model.reset();

        if (process.env.NODE_ENV !== 'production') {
            this.model.on('change', _ => {
                // console.log(this.model.toJSON());
                // console.log("changed attributes are: " + Object.keys(this.model.changed));

                try {
                    BJ_REPORT.info(new Date() + 'MODEL_CHANGE: current is ' + JSON.stringify(this.model.toJSON()));

                    const {orderDetailId, activeChatInfo} = this.model.toJSON();
                    if (orderDetailId && activeChatInfo && activeChatInfo.orderDetailId && (orderDetailId !== activeChatInfo.orderDetailId)) {
                        BJ_REPORT.report(new Date() + '数据不一致了，' + orderDetailId + 'activeChatInfo.orderDetailId is' + activeChatInfo.orderDetailId);
                    }
                } catch(e) {
                    //do nothing
                }
            })
        }
    },



    reset: function() {
        this.model.reset();
    },

    /*
     * 咨询关闭
     */
    handleConsultClose: function(data = {}) {
        const {orderDetailId, consultId, closeContent} = data;
        const {messageList} = this.model.toJSON();
        const consult = messageList.filter(item => item.orderDetailId == orderDetailId)[0] || {};
        consult.consultState = 0;
        consult.closeContent = closeContent;

        return this;
    },

    handleStudentClose: function(data = {}) {
        const {consultId, orderDetailId, closeReason} = data;

        this.handleConsultClose(data);

        if (orderDetailId === this.model.get('orderDetailId')) {
            //当前会话关闭，加入关闭提示
            const activeChatInfo = JSON.parse(JSON.stringify(this.model.get('activeChatInfo')));
            const {messageList = [], messageListAll = []} = activeChatInfo;

            const item = {
                isNotify: true,
                chatContent: closeReason
            }

            messageList.unshift(item);
            messageListAll.unshift(item);

            //设置为关闭状态
            activeChatInfo.isClosed = true;

            this.model.set({activeChatInfo});
        }
    },

    /*
     * 接收到新消息
     */
    handleReceive: function(data = {}) {
        const {messageList = [], activeChatInfo} = data;
        //左侧列表数据处理
        const originalMessageList = this.model.get('messageList').slice();

        //增量推送且非置顶
        if ((messageList.length === 1) && (messageList[0].messageTop === 2)) {
            let lastTopIndex = this.getLastTopIndex();
            originalMessageList.splice(lastTopIndex + 1, 0, messageList[0]);
        } else {
            originalMessageList.unshift(...messageList);
        }

        const consultIdList = originalMessageList.map(item => item.consultId);

        //过滤重复的数据
        const newMessageList = originalMessageList.filter((item, index) => {
            const items = originalMessageList.filter(_item => {
                return _item.orderDetailId == item.orderDetailId;
            }).map(_item => _item.consultId);

            const {consultId} = item;
            if (consultId == Math.max(...items) && (consultIdList.indexOf(consultId) == index)) {
                return true;
            }

            return false;
        });

        this.model.set({
            messageList: newMessageList
        });

        //右侧具体聊天数据处理
        if (activeChatInfo && !_.isEmpty(activeChatInfo)) {
            //判断当前返回会话是不是选中的人
            const {orderDetailId} = activeChatInfo;
            if (orderDetailId != this.model.get('orderDetailId')) {
                return this;
            }

            const originalActiveChatInfo = this.model.get('activeChatInfo');

            //同一个咨询
            if (originalActiveChatInfo && (originalActiveChatInfo.orderDetailId === activeChatInfo.orderDetailId)) {
                const {messageList = [], messageListAll = []} = originalActiveChatInfo;
                let receivedMessageList = activeChatInfo.messageList.slice();

                // 不确定是否外层left容器messageList推几条 过滤得到用于当前会话的内容
                let activeListItem = data.messageList.filter(cItem => {
                    return cItem.orderDetailId === activeChatInfo.orderDetailId
                })

                // 如果是当前会话的外层消息，且有closeContent字段，认为需要concat提示信息（当前聊天窗口接收推送）
                if (activeListItem && activeListItem[0].closeContent) {
                    receivedMessageList = [{
                        isNotify: true,
                        chatContent: activeListItem[0].closeContent,
                    }].concat(receivedMessageList)
                }

                //收到的消息需要在只看自己和聚合记录中同步
                activeChatInfo.messageList = receivedMessageList.concat(messageList);
                activeChatInfo.messageListAll = receivedMessageList.concat(messageListAll);

                // 如果当前打开的是关闭的会话，此时收到学员消息，应该将会话状态设置为打开
                // 且不是机器人排队转过来的（接机器人新增case）
                if (originalActiveChatInfo.isClosed && activeListItem[0].consultState !== 0) {
                    activeChatInfo.isClosed = false;
                }
            } else {
                const {orderDetailId} = activeChatInfo;
                this.clearUnreadMessage(orderDetailId);

                //当前会话中须持有会话是否关闭的状态
                //首次切换会话时，获取关闭状态
                //会话状态改变有几种情况
                //1) 老师主动关闭 - 关闭
                //2) 学员主动关闭 - 关闭
                //3) 值班老师转接 - 关闭
                //4) 班主任主动发起  - 打开
                //5) 学员再次主动发起 - 打开
                activeChatInfo.isClosed = chatInfoModelUtil.isClosed(orderDetailId);

                const {messageList} = activeChatInfo;

                activeChatInfo.messageListAll = messageList || [];
                activeChatInfo.messageList = [];

                const {closeContent = ''} = this.getConsultDetailByOrderId(orderDetailId) || {};

                //需要显示出关闭状态
                if (closeContent) {
                    activeChatInfo.messageList.unshift({
                        isNotify: true,
                        chatContent: closeContent,
                    })

                    if (activeChatInfo.isClosed) {
                        // 原关闭话术，提到上面去了
                    } else {
                        // 转接机器人的提示 临时hack （left容器切换item事件）
                        activeChatInfo.messageListAll.unshift({
                            isNotify: true,
                            chatContent: closeContent,
                        })
                    }
                }
            }

            this.model.set({
                isGettingActiveChatInfo: false,
                activeChatInfo,
                hasMoreHistoryMessage: !!activeChatInfo.messageListAll.length
            })
        }

        return this;
    },

    /**
     * 清除未读消息数
     */
    clearUnreadMessage(orderDetailId) {
        const item = this.getConsultDetailByOrderId(orderDetailId);
        item && (item.messageCount = 0);
    },

    /**
     * 获取某个咨询对象的数据
     */
    getConsultDetailByOrderId(orderDetailId) {
        const {messageList} = this.model.toJSON();
        return messageList.filter(item => item.orderDetailId === orderDetailId)[0];
    },

    /**
     * 获取某个咨询在列表中的索引值
     */
    getIndex(orderDetailId) {
        const {messageList} = this.model.toJSON();
        for (let i = 0, len = messageList.length; i < len; i++) {
            if (messageList[i].orderDetailId == orderDetailId) {
                return i;
            }
        }

        return -1;
    },

    /**
     * 获取最后一条置顶咨询的索引值
     */
    getLastTopIndex() {
        const {messageList} = this.model.toJSON();
        let index = -1;

        for (let i = 0, len = messageList.length; i < len; i++) {
            if (messageList[i].messageTop === 1) {
                index = i;
            }
        }

        return index;
    },

    /*
     * 判断一个咨询是否为关闭状态
     */
    isClosed: function(orderDetailId) {
        const {messageList} = this.model.toJSON();
        const item = messageList.filter(item => item.orderDetailId === orderDetailId)[0] || {};
        return !item.consultState;
    },

    /*
     * 获取最后一条数据详情
     */
    getLastOrderDetail: function() {
        const {messageList} = this.model.toJSON();
        return messageList[messageList.length - 1];
    },

    /**
     * 左侧列表loading状态
     */
    loadingSessionList: function() {
        this.model.set({
            isGettingSessionList: true
        });
    },

    /*
     * 左侧列表拉取历史消息
     */
    handleGetHistorySessionList: function(messageList) {
        const originalMessageList = this.model.get('messageList').slice();
        this.model.set({
            messageList: originalMessageList.concat(messageList),
            isGettingSessionList: false,
            hasLoadedAllSessionList: !messageList.length
        })

        return this;
    },

    /*
     * 右侧具体聊天信息拉取历史消息
     */
    handleGetHistoryMessageWithSomeone: function(messageList) {
        const activeChatInfo = JSON.parse(JSON.stringify(this.model.get('activeChatInfo')));
        const originalMessageList = activeChatInfo.messageList || [];

        //去重
        if (messageList.length) {
            const newConsultId = messageList[0].consultId;
            const { consultId: originalConsultId } = originalMessageList[0] || {}

            if (newConsultId == originalConsultId) {
                //重复了，处理下
                const lastItem = originalMessageList[originalMessageList.length - 1];
                if (lastItem.isNotify) {
                    lastItem.consultId = newConsultId;
                    messageList.push(lastItem);
                }

                activeChatInfo.messageList = messageList;
            } else {
                activeChatInfo.messageList = originalMessageList.concat(messageList);
            }
        }

        this.model.set({
            activeChatInfo,
            isGettingMoreMessage: false
        });

        if (!messageList.length) {
            this.model.set({
                hasMoreHistoryMessage: false
            });
        }

        return this;
    },

    /**
     * 右侧拉取聊天记录-聚合页
     */
    handleGetHistoryMessageForAll: function(messageList, orderDetailId) {
        if (orderDetailId != this.getOrderDetailId()) {
            //返回的数据不是当前选中的人的消息
            return;
        }

        const activeChatInfo = JSON.parse(JSON.stringify(this.model.get('activeChatInfo')));

        const originalMessageListAll = activeChatInfo.messageListAll || [];

        activeChatInfo.messageListAll = originalMessageListAll.concat(messageList);

        this.model.set({
            activeChatInfo,
            isGettingMoreMessageAll: false,
            // isGettingActiveChatInfo: false
        });

        if (!messageList.length) {
            this.model.set({
                hasMoreHistoryMessageAll: false
            }); //聚合消息中没有更多了
        }

        return this;
    },

    handleLoadingHistoryMessage: function() {
        this.model.set({
            isGettingMoreMessage: true
        })
    },

    handleLoadingHistoryMessageAll: function() {
        this.model.set({
            isGettingMoreMessageAll: true
        });
    },

    /*
     * 没有与任何人聊天，清空activeChatInfo的数据
     */
    clearActiveChatInfo: function() {
        this.model.set({
            activeChatInfo: null,
            orderDetailId: -1,
        });

        return this;
    },

    /*
     * 设置当前点击的咨询
     */
    setActive: function(orderDetailId) {
        this.model.set({
            orderDetailId,
            isGettingActiveChatInfo: true,
            teacherStatus: {},
            activeChatInfo: {},
            hasMoreHistoryMessageAll: true,
            hasMoreHistoryMessage: true,
            isGettingMoreMessageAll: false,
            isGettingMoreMessage: false,
            answerList: null,  // 设置当前咨询后需要把智能问答的list清空
        })

        return this
    },
    /*
     * 清空智能问答的提示列表
     */
    clearAnswerList(type) {
        const answerList = this.model.get('answerList') || {}
        const activeChatInfo = this.model.get('activeChatInfo') || {}
        // 老师未选择智能回复内容 1.close type === 'close' 2.单个字符触发关闭 type === undefined
        if (type !== 'select' && this.model.get('answerList') != null) {
            util.slog('question_assist_unclick', {
                question: answerList.content,
                consultId: activeChatInfo.messageList[0].consultId,
            })
        }

        this.model.set({
            answerList: null, // 设置当前咨询后需要把智能问答的list清空
        })
    },

    isGettingActiveChatInfo() {
        return this.model.get('isGettingActiveChatInfo');
    },

    /*
     * 增加一条消息，加入到model中，为loading状态
     */
    addALoadingMessage: function(data) {
        const activeChatInfo = JSON.parse(JSON.stringify(this.model.get('activeChatInfo')));
        const {messageList, messageListAll} = activeChatInfo;

        const item = {
            ...data,
            sendTime: moment().format('YYYY-MM-DD HH:mm:ss')
        }

        messageList.unshift(item);

        messageListAll.unshift(item)

        this.model.set({
            activeChatInfo
        });

        return this;
    },

    resendMessage: function(uniqueKey) {
        const activeChatInfo = JSON.parse(JSON.stringify(this.model.get('activeChatInfo')));
        const {messageList, messageListAll} = activeChatInfo;

        const selfItem = messageList.filter(item => item.uniqueKey === uniqueKey)[0] || {};
        selfItem.isLoading = true;
        selfItem.isFailed = false;

        const allItem = messageListAll.filter(item => item.uniqueKey === uniqueKey)[0] || {};
        allItem.isLoading = true;
        allItem.isFailed = false;

        this.model.set({
            activeChatInfo
        });

        return this;
    },

    /*
     * 发送消息成功，去除loading
     */
    sendMessageSuccess: function(data) {
        const {orderDetailId, messageId, consultId, uniqueKey} = data;
        const activeChatInfo = JSON.parse(JSON.stringify(this.model.get('activeChatInfo')));
        const {messageList, messageListAll} = activeChatInfo;

        const message = messageList.filter(item => item.uniqueKey === uniqueKey)[0] || {};
        message.isLoading = false;
        message.consultId = consultId;

        const messageInAll = messageListAll.filter(item => item.uniqueKey === uniqueKey)[0] || {};
        messageInAll.isLoading = false;
        messageInAll.consultId = consultId;
        messageInAll.messageId = messageId;

        if (activeChatInfo.isClosed) {
            //会话状态为打开
            activeChatInfo.isClosed = false;
        }

        this.model.set({
            activeChatInfo
        });

        return this;
    },

    /*
     * 发送消息失败，变为重发状态
     */
    sendMessageFail: function(data) {
        const {orderDetailId, consultId, uniqueKey, description, reason} = data;
        const activeChatInfo = JSON.parse(JSON.stringify(this.model.get('activeChatInfo')));
        const {messageList, messageListAll} = activeChatInfo;

        const message = messageList.filter(item => item.uniqueKey === uniqueKey)[0];
        const messageInAll = messageListAll.filter(item => item.uniqueKey === uniqueKey)[0];

        if (message) {
            message.isLoading = false;
            message.isFailed = true;
            message.description = description || reason;
        }

        if (message.messageType == 4) {
            //如果是文件，有两种状态
            message.failedType = 'WS_FAILED';
        }

        if (messageInAll) {
            messageInAll.isLoading = false;
            messageInAll.isFailed = true;
            messageInAll.description = description || reason;
        }

        if (messageInAll.messageType == 4) {
            messageInAll.failedType = 'WS_FAILED';
        }

        this.model.set({
            activeChatInfo
        });

        return this;
    },

    /**
     * 班主任接入会话失败
     */
    handleCreateFailed: function(data) {
        const {description} = data;
        alert(description);

        this.sendMessageFail(data);
        return;
    },

    /**
     * 老师主动关闭会话操作响应
     */
    handleTeacherClose: function(data, type = 'close') {
        const {rs, orderDetailId, rsdesp} = data;
        if (rs) {
            //关闭成功
            //将该咨询置为关闭状态
            const closeContent = type === 'close' ? '老师关闭了会话，本次会话已结束' : '老师将会话转接给了班主任，本次会话已结束';
            this.handleConsultClose({orderDetailId, closeContent});
            if (orderDetailId === this.model.get('orderDetailId')) {
                //清空聊天窗口
                //聊天窗口不关闭
                // this.clearActiveChatInfo();
                //系统通知话术
                const activeChatInfo = JSON.parse(JSON.stringify(this.model.get('activeChatInfo')));
                const {messageList = [], messageListAll} = activeChatInfo;

                const item = {
                    isNotify: true,
                    chatContent: closeContent
                }

                messageList.unshift(item);
                messageListAll.unshift(item);

                //会话状态设为关闭
                activeChatInfo.isClosed = true;

                this.model.set({activeChatInfo});
            }
        } else {
            alert(rsdesp);
        }

        return this;
    },

    /**
     * 转接响应
     */
    handleTransferResult: function(data) {
        const {rs, orderDetailId} = data;

        if (rs) {
            //如果转接成功，关闭该会话
            this.handleTeacherClose(data, 'transfer');
        } else {
            alert(rsdesp);
        }
    },

    /**
     * 置顶
     */
    handleMessageTopResult: function(data) {
        const messageList = this.model.get('messageList').slice();

        const {orderDetailId, consultId, type} = data;
        const index = this.getIndex(orderDetailId);

        if (index !== -1) {
            const item = messageList.splice(index, 1)[0];

            switch(type) {
                case 1: //置顶
                    messageList.unshift({
                        ...item,
                        messageTop: 1
                    });
                    break;
                case 2: //取消置顶
                    messageList.splice(this.getLastTopIndex(), 0, {
                        ...item,
                        messageTop: 2
                    });
                    break;
            }

            this.model.set({
                messageList
            });
        }

        return this;
    },

    /**
     * 获取左侧列表最后子订单的订单id
     */
    getTheOldestOrderId: function() {
        const {messageList} = this.model.toJSON();
        const length = messageList.length;

        return messageList[length - 1].orderDetailId;
    },

    /**
     * 获取聊天记录中的最后一次咨询的咨询id
     */
    getHistoryMessageConsultId: function() {
        const {activeChatInfo: {messageList}} = this.model.toJSON();
        const length = messageList.length;

        return messageList[length - 1].consultId;
     },

    /**
     * 设置角色
     */
    setRole: function(role) {
        this.model.set({
            role
        });
    },

    /**
     * 是否是班主任
     */
    isTeacher: function() {
        const {role} = this.model.toJSON()
        return ['teacher'].indexOf(role) > -1
    },

    /**
     * 拥有类似班主任的权限
     */
    isTeacherEqual: function() {
        const {role} = this.model.toJSON()
        return ['teacher', 'afterSaleTeacher'].indexOf(role) > -1
    },

    /**
     * 获取当前角色
     * 客诉老师 - afterSaleTeacher
     * 班主任 - teacher
     * 值班老师 - dutyteacher
     */
    getRole() {
        return this.model.get('role')
    },

    /**
     * 获取当前聊天的子订单id
     */
    getOrderDetailId() {
        return this.model.get('orderDetailId');
    },

    handleFileMessageStatusChange(data) {
        const {fileUrl, uniqueKey} = data;
        const activeChatInfo = JSON.parse(JSON.stringify(this.model.get('activeChatInfo')));
        const {messageList} = activeChatInfo || {};

        for (let i = 0, len = messageList.length; i < len; i++) {
            if (messageList[i].uniqueKey === uniqueKey) {
                messageList[i].fileUrl = fileUrl;
                break;
            }
        }

        this.model.set({
            activeChatInfo
        });

        return this;
    },

    handleFileSendFailed(data) {
        const {uniqueKey} = data;

        const activeChatInfo = JSON.parse(JSON.stringify(this.model.get('activeChatInfo')));
        const {messageList} = activeChatInfo || {};

        for (let i = 0, len = messageList.length; i < len; i++) {
            const item = messageList[i];
            if (item.uniqueKey === uniqueKey) {
                item.isFailed = true;
                item.failedType = 'AJAX_FAILED';
                item.isLoading = false;
                break;
            }
        }

        this.model.set({
            activeChatInfo
        });

        return this;
    },

    /**
     * 老师在线状态发生变化
     */
    handleTeacherStatusChange(data) {
        const {online} = data;
        this.model.set({
            online
        });
    },

    /**
     * 订单对应的班主任信息
     */
    handleGetTeacherStatusInfo(data) {
        this.model.set({
            teacherStatus: data
        });
    },

    getTeacherStatusInfo() {
        return this.model.get('teacherStatus');
    },

    resetTeacherStatus() {
        this.model.set({
            teacherStatus: {}
        })
    },

    handleQuestionAssistPush(data) {
        this.model.set({
            answerList: data
        })
    },

    handleQueueNum(data) {
        this.model.set({
            queueNum: data
        })
    },

    handleWsClose() {
        this.model.set({
            online: 0
        })
    }
}

chatInfoModelUtil.init();

export {chatInfoModelUtil}
