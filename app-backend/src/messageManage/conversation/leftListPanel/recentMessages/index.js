import debounce from 'lodash/debounce';
import {common} from '../../../../common/common';
import {chatInfoModelUtil} from '../../chatInfo';
import {Items} from './items/index';
import tpl from './tpl.html';

//view
var RecentMessages = Backbone.View.extend({

    initialize: function(options) {
        let {send} = options;
        this.send = send;
        this.model = chatInfoModelUtil.model;
        this.listenTo(this.model, 'change:messageList', this.renderMessageList);
        this.listenTo(this.model, 'change:orderDetailId', this.renderMessageList);
        this.listenTo(this.model, 'change:hasLoadedAllSessionList',  this.handleLoadedAllData);
        this.listenTo(this.model, 'change:isGettingSessionList', this.handleIsLoadingChange);
        this.render();
        this.initScrollEvents();
    },

    events: {
        // 'click #searchUserBtn': 'searchUser',
        // 'input #searchUserIpt': 'searchChange',
        'click .cancel-top': 'cancelTop',
        'click .set-top': 'setTop',
        'click .item': 'handleClick'
    },

    /**
     * 加载完了全部数据
     */
    handleLoadedAllData() {
        this.$el.find('#tip').html('<div class="tac p5 gray6">没有更多了~</div>').show();
    },

    /**
     * 加载状态变化
     */
    handleIsLoadingChange() {
        const {isGettingSessionList} = this.model.toJSON();
        const $tip = this.$el.find('#tip');
        if (isGettingSessionList) {
            $tip.html('<div class="loading-list-items"></div>');
        } else {
            $tip.html('');
        }
    },

    /**
     * 点击事件处理
     */
    handleClick(e) {
        // alert(e)
        //如果当前已经被选中，则不做任何处理
        if ($(e.currentTarget).hasClass('current-checked-item')) {
            return;
        }
        const orderDetailId = +$(e.currentTarget).attr('orderdetailid');
        const {imUserId: studentImId} = chatInfoModelUtil.getConsultDetailByOrderId(orderDetailId);
        const teacherImId = +common.getUserInfo().imUserId;
        this.send({
            command: 'SET_ACTIVE_USER',
            data: {
                orderDetailId,
                studentImId,
                teacherImId, 
                consultId: 0,
            }
        }, _ => {
            chatInfoModelUtil.setActive(orderDetailId);
        });

        //默认展示聊天聚合页，所以要主动拉取聚合聊天记录
        // this.send({
        //     command: 'GET_HISTORY_MESSAGE_LIST',
        //     data: {
        //         orderDetailId,
        //         studentImId,
        //         teacherImId,
        //         messageId: 0,
        //         watchType: 2, //为2表示拉取所有记录
        //     }
        // })
    },

    /**
     * 获取更多消息
     */
    getOldMessages() {
        const {orderDetailId, imUserId} = chatInfoModelUtil.getLastOrderDetail();

        this.send({
            command: 'GET_SESSION_LIST',
            data: {
                orderDetailId,
                studentImId: imUserId,
                teacherImId: +common.getUserInfo().imUserId
            }
        }, _ => {
            chatInfoModelUtil.loadingSessionList();
        });
    },

    initScrollEvents() {
        let $list = this.$el.find('#messageItemList');
        $list.on('scroll', debounce(() => {
            var h = $list.height();
            var height = $list[0].scrollHeight;

            //获取滚动高度
            var scrollTop = $list.scrollTop();

            if (scrollTop + h > height - 5) {
                const {isGettingSessionList, hasLoadedAllSessionList} = this.model.toJSON();
                if (!isGettingSessionList && !hasLoadedAllSessionList) {
                    this.getOldMessages();
                }
            }
        }, 300));
    },

    //取消置顶
    cancelTop(e) {
        const orderDetailId = +$(e.currentTarget).attr('orderdetailid');
        const {consultId, imUserId: studentImId} = chatInfoModelUtil.getConsultDetailByOrderId(orderDetailId);
        
        this.send({
            command: 'MESSAGE_TOP',
            data: {
                orderDetailId,
                consultId,
                studentImId,
                teacherImId: +common.getUserInfo().imUserId,
                type: 2
            }
        })

        return false;  //阻止冒泡
    },

    //置顶
    setTop(e) {
        const orderDetailId = +$(e.currentTarget).attr('orderdetailid');
        const {consultId, imUserId: studentImId} = chatInfoModelUtil.getConsultDetailByOrderId(orderDetailId);

        this.send({
            command: 'MESSAGE_TOP',
            data: {
                orderDetailId,
                consultId,
                studentImId,
                teacherImId: +common.getUserInfo().imUserId,
                type: 1
            }
        })

        return false;  //阻止冒泡
    },

    // /**
    //  * 搜索条件发生变化
    //  */
    // searchChange: function() {
    //     var searchUser = $('#searchUserIpt').val().trim();

    //     if (searchUser) {
    //         this.searchUser();
    //     }

    //     this.privateModel.set({
    //         isSearchPanelShow: !!searchUser
    //     })
    // },

    // /**
    //  * 查找
    //  */
    // searchUser: function() {
    //     var searchUser = $('#searchUserIpt').val().trim();

    //     service.getMessageAdminSearchUser({
    //         userAccount: common.getUserInfo().userAccount,
    //         searchUser: searchUser,
    //         // flag
    //     }, (response) => {
    //         if (response.rs) {
    //             this.privateModel.set({
    //                 searchMessageList: response.resultMessage
    //             });
    //         } else {
    //             alert(response.rsdesp);
    //         }
    //     });
    // },

    // /**
    //  * 搜索部分的显示和隐藏
    //  */
    // handleSearchPanelShow() {
    //     const {isSearchPanelShow} = this.privateModel.toJSON();
    //     const $searchPanel = this.$el.find('#searchPanel');
    //     const $messageListPanel = this.$el.find('#messageItemList');

    //     if (isSearchPanelShow) {
    //         $searchPanel.show();
    //         $messageListPanel.hide();
    //     } else {
    //         $searchPanel.hide();
    //         $messageListPanel.show();
    //     }
    // },

    // /**
    //  * 搜索结果发生变化
    //  */
    // renderSearchMessageList() {
    //     const {searchMessageList} = this.privateModel.toJSON();
    //     const {orderDetailId} = this.model.toJSON();

    //     const $searchPanel = this.$el.find('#searchPanel');

    //     if (searchMessageList.length) {
    //         this.searchItems && this.searchItems.undelegateEvents();
    //         this.searchItems = new Items({
    //             messageList: searchMessageList,
    //             orderDetailId
    //         })
    //         $searchPanel.empty().append(this.searchItems.$el);
    //     } else {
    //         $searchPanel.html('没有更多了~');
    //     }
    // },

    renderMessageList: function() {
        const {messageList, orderDetailId} = this.model.toJSON();

        this.items && this.items.destroy();
        this.items = new Items({
            messageList: JSON.parse(JSON.stringify(messageList)), //复制一份
            orderDetailId
        });

        this.$el.find('#messageList').empty().append(this.items.$el);
    },

    destroy() {
        this.remove();
    },

    render: function() {
        this.$el.html(tpl());
        return this;
    }
})

export {RecentMessages}
