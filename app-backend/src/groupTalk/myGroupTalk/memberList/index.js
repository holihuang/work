import {service} from '../../../common/service';
import {common} from '../../../common/common';
import debounce from 'lodash/debounce';

//由于这次涉及到的每个学员的状态变更比较复杂，如果使用分页的话，处理起来会很麻烦
//所以每次拉取数据拉全部

// const PAGE_SIZE = 20;
const NOT_SHOW_LABEL = ['普通学员', '老师']

let interval;

const INTERVAL_TIME = 10 * 60 * 1000; //10分钟

let tpl = require('./tpl.html');
let itemsTpl = require('./items.html');

let Model = Backbone.Model.extend({
    defaults: {
        pageNo: 0,
        showHeader: true,
        showUserStatus: true,
        showAllUserBtn: false,
    }
});

let MemberList = Backbone.View.extend({
    initialize: function(options) {
        //每次创建列表时，先清除上一个定时器
        interval && clearInterval(interval);

        let {
            groupId,
            oldGroupType,
            userIsOwner,
            groupForbidden,
            memberForbidden,
            canOperate,
            onDeleteUser,
            memberModel,
            showHeader = true,
            showUserStatus = true,
            handleClick,
            showAllUserBtn = false,
            category = 1,
            source, // 区分是右侧列表还是@的list
            send,
        } = options;

        this._source = source
        this.send = send

        // 群禁言 且 身份为管理员，不允许操作（下方3个操作按钮不显示）
        canOperate = canOperate && !(!userIsOwner && (groupForbidden == 2 || memberForbidden == 2))
        // 不是班级群
        // const isNoClassGroup = oldGroupType != 2
        // 2 - 版主群  8 - ko群
        const isNoClassGroup = ![2, 8].includes(oldGroupType)
        // const isNoClassGroup = false

        this.model = new Model();
        this.model.set({
            userIsOwner, 
            isNoClassGroup,
            groupId, 
            canOperate, 
            showHeader, 
            showUserStatus, 
            showAllUserBtn, 
            category
        });
        this.memberModel = memberModel;
        this.handleClick = handleClick;
        this.render();
        this.listenTo(this.model, 'change:resultList', this.renderResultList);
        this.listenTo(this.memberModel, 'change:memberCount', this.setMemberCount);
        this.getMembersList();

        interval = setInterval(() => {
            const condition = this.$el.find('#searchMemberIpt').val();
            //如果有筛选条件，不重新拉列表
            if (condition) {
                return;
            }
            this.getMembersList();
        }, INTERVAL_TIME);
        // this.initScrollEvent();
        // this.searchMemberThrottle = debounce(this.searchMember.bind(this), 200);

    },

    events: {
        'click #searchMemberBtn': 'searchMember',
        'input #searchMemberIpt': 'searchAllMember',
        'click .item': 'handleClickItem',
        'click #deleteUserBtn': 'deleteUser',
        'click #forbiddenUserBtn': 'forbiddenUser',
        'click #cancelForbiddenBtn': 'cancelForbidden',
        'click': 'stopPropagation'
    },

    // searchMemberThrottle : debounce(this.searchMember.bind(this), 200),

    update() {
        this.$el.find('#itemsContainer').html('');
        this.model.set({resultList: [], pageNo: 0});
        //重置状态
        this.hasLoadedAllData = false;
        this.isLoading = false;
        this.getMembersList();
    },

    //群解散后，不能再操作
    disable() {
        this.model.set({canOperate: false});
        this.$el.find('footer').hide();
    },

    stopPropagation() {
        return false;
    },

    // searchMemberThrottle() {
    //     lodash.throttle(this.searchMember, 200);
    // },

    listSearchRs(data) {
        const response = data
        if (response.rs) {
            const {resultList, onlineNum} = response.resultMessage;
            this.model.set({resultList, onlineNum});
        } else {
            alert(response.rsdesp);
        }
    },

    searchMember(e) {
        const {groupId, category} = this.model.toJSON();
        const condition = this.$el.find('#searchMemberIpt').val().trim();
        const params = {
            groupId,
            category, //1代表拉取所有群成员；2代表拉取@的群成员列表；3代表老师列表
            userAccount: common.getUserInfo().userAccount,
        }

        condition && (params.condition = encodeURIComponent(condition));

        this.send({
            command: 'LIST_GROUP_MEMBERS',
            data: {
                from: this._source + 'Search',
                ...params,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // service.listGroupMembers(params, (response) => {
        //     if (response.rs) {
        //         const {resultList, onlineNum} = response.resultMessage;
        //         this.model.set({resultList, onlineNum});
        //     } else {
        //         alert(response.rsdesp);
        //     }
        // })
    },

    searchAllMember(e) {
        if (!$(e.currentTarget).val().trim()) {
            this.getMembersList();
        }
    },

    handleClickItem(e) {
        if (typeof this.handleClick === 'function') {
            let imUserId = $(e.currentTarget).attr('imuserid');
            let nickName = $(e.currentTarget).find('.username').html();
            this.handleClick({imUserId, nickName});
            this.destroy();
            return;
        }

        let {canOperate, userIsOwner} = this.model.toJSON();
        if (canOperate) {
            let degree = $(e.currentTarget).attr('degree');
            let userId = $(e.currentTarget).attr('userid');
            let imuserid = $(e.currentTarget).attr('imuserid');
            // 获取当前imid
            if (imuserid == common.getUserInfo().imIdForGroup) {
              alert('不能对自己进行操作哦~');
              return;
            }
            if (!userIsOwner) {
              if (degree == 1) {
                alert('不能对群主进行操作哦~');
                return;
              } else if (degree == 14) {
                alert('不能对其他管理员进行操作哦~');
                return;
              }

            }
            $(e.currentTarget).toggleClass("checked");
        }
    },

    getCheckedUser() {
        let checkedList = this.$el.find('.checked');
        let imUserIds = [];
        let userIds = [];
        let canCancelForbidden = true;
        let canForbidden = true;

        checkedList.each(function() {
            let userId = $(this).attr('userid');
            let imUserId = $(this).attr('imuserid');
            let forbidden = $(this).attr('forbidden');

            if (forbidden == 1) {  //1为正常
                canCancelForbidden = false;
            } else {  //2为禁言
                canForbidden = false;
            }

            userIds.push(userId);
            imUserIds.push(imUserId);
        });

        return {
            checkedList,
            imUserIds,
            userIds,
            canForbidden,
            canCancelForbidden
        }
    },

    deleteUserRs(data) {
        const response = data
        const { userIds = [] } = response

        if (response.rs) {
            //删除成功
            alert('删除成功！');
            //移除成功后将dom移除
            // checkedList.remove();
            this.$el.find('.checked') // 可能存在误删，但仅是前端展示数据，且ws返回速度快了就不会出现误删。

            let nums = userIds.length;
            let oriNums = this.$el.find('#memberCount').html()

            this.memberModel.set({memberCount: +oriNums - nums});
        } else {
            alert(response.rsdesp);
        }
    },

    deleteUser() {
        if (confirm('移除后会通知该成员及群聊中其他成员，且该成员不会再接收此群聊消息')) {
            let {checkedList, imUserIds, userIds} = this.getCheckedUser();
            let {groupId} = this.model.toJSON();
            // let userAccount = common.getUserInfo().userAccount;
            const { userAccount } = common.getUserInfo()

            if (!userIds.length) {
                alert('请选择学员！');
                return false;
            }
            this.send({
                command: 'DELETE_USER',
                data: {
                    from: 'memberList',
                    userAccount,
                    groupId,
                    userIds,
                    imUserIds,
                    imUserId: common.getUserInfo().imIdForGroup,
                }
            })


            // service.deleteUser({
            //     userAccount,
            //     groupId,
            //     userIds,
            //     imUserIds
            // }, (response) => {
            //     if (response.rs) {
            //         //删除成功
            //         alert('删除成功！');
            //         //移除成功后将dom移除
            //         checkedList.remove();

            //         let nums = userIds.length;
            //         let oriNums = this.$el.find('#memberCount').html()

            //         this.memberModel.set({memberCount: +oriNums - nums});
            //     } else {
            //         alert(response.rsdesp);
            //     }
            // })
        }
    },

    forbiddenUser() {
        let {canForbidden} = this.getCheckedUser();
        if (!canForbidden) {
            alert('选中学员中包含已被禁言的学员，请重新选择！');
            return false;
        }
        if (confirm('禁言后会通知该成员，且不允许该成员在该群中发送消息，只可查阅群聊相关消息')) {
            this.forbidden(2);  //2为禁言
        }
    },

    cancelForbidden() {
        let {canCancelForbidden} = this.getCheckedUser();
        if (!canCancelForbidden) {
            alert('选中学员中包含未被禁言的学员，请重新选择！');
            return false;
        }
        if (confirm('解禁后会重置该成员，且该成员在群聊中发送消息恢复正常')) {
            this.forbidden(1);  //1为解禁
        }
    },

    forbiddenRs(data) {
        const response = data
        const { forbidden = '' } = response
        const checkedList = this.$el.find('.checked')

        if (response.rs) {
            alert('操作成功');
            checkedList.each(function() {
                $(this).removeClass('checked').attr('forbidden', forbidden);
                $(this).find('.icon-forbidden').toggleClass('hide');
            });
        } else {
            alert(response.rsdesp);
        }
    },

    //禁言和解禁
    forbidden(forbidden) {
        let {checkedList, imUserIds, userIds} = this.getCheckedUser();
        let {groupId} = this.model.toJSON();
        // let userAccount = common.getUserInfo().userAccount;
        const { userAccount } = common.getUserInfo()

        if (!userIds.length) {
            alert('请选择学员！');
            return false;
        }
        this.send({
            command: 'FORBID_USER',
            data: {
                from: 'memberList',
                userAccount,
                groupId,
                imUserIds,
                forbidden,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // service.forbiddenUser({
        //     userAccount,
        //     groupId,
        //     imUserIds,
        //     forbidden
        // }, (response) => {
        //     if (response.rs) {
        //         alert('操作成功');
        //         checkedList.each(function() {
        //             $(this).removeClass('checked').attr('forbidden', forbidden);
        //             $(this).find('.icon-forbidden').toggleClass('hide');
        //         });
        //     } else {
        //         alert(response.rsdesp);
        //     }
        // })
    },

    //现在每次拉取全部群成员，取消分页，不在监听滚动事件
    //滚动监听
    // initScrollEvent() {
    //     let $list = this.$el.find('#itemsContainer');
    //     $list.on('scroll', () => {
    //         var h = $list.height() + 32; //上下padding为16
    //         var height = $list[0].scrollHeight;
    //         //获取滚动高度
    //         var scrollTop = $list.scrollTop();
    //         if (scrollTop + h > height - 5) {
    //             if (!this.isLoading && !this.hasLoadedAllData) {
    //                 this.isLoading = true;
    //                 this.getMembersList();
    //             }
    //         }
    //     })
    // },

    listGetRs(data) {
        const response = data

        if (response.rs) {
            let {resultList, onlineNum} = response.resultMessage;
            this.model.set({
                resultList,
                onlineNum,
            })
            if(response.category === 2) {
                this.memberModel.set({memberCount: resultList.length + 1});
            } else {
                this.memberModel.set({memberCount: resultList.length});
            }
        } else {
            alert(response.rsdesp);
        }
    },

    getMembersList() {
        let {groupId, category, pageNo} = this.model.toJSON();
        // let userAccount = common.getUserInfo().userAccount;
        const { userAccount } = common.getUserInfo()

        this.send({
            command: 'LIST_GROUP_MEMBERS',
            data: {
                from: this._source + 'Get',
                userAccount,
                groupId,
                category, // 代表拉取全部群成员
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // service.listGroupMembers({
        //     userAccount,
        //     groupId,
        //     category //代表拉取全部群成员
        //     // pageNo: ++pageNo,
        //     // pageSize: PAGE_SIZE
        // }, (response) => {
        //     if (response.rs) {
        //         let {resultList, onlineNum} = response.resultMessage;
        //         this.model.set({
        //             resultList,
        //             onlineNum,
        //         })
        //         if(category === 2) {
        //             this.memberModel.set({memberCount: resultList.length + 1});
        //         } else {
        //             this.memberModel.set({memberCount: resultList.length});
        //         }
        //     } else {
        //         alert(response.rsdesp);
        //     }
        // })
    },

    setMemberCount() {
        let {memberCount} = this.memberModel.toJSON();
        this.$el.find('#memberCount').html(memberCount);
        //数量变化后，重新拉取列表
        this.getMembersList();
    },

    destroy() {
        this.undelegateEvents();
        this.remove();
        interval && clearInterval(interval);
    },

    formatResult(resultList = []) {
        resultList.forEach((item, index) => {
            item.isForbidden = item.forbidden === 2 ? true : false;
            item.forbiddenHideClass = item.forbidden === 2 ? '' : 'hide';
            //item.isMonitor = item.degree === 2 ? true : false;
            item.userName =item.degree == 1 ? '' : item.userName
            if(item.memberDegree && item.memberDegree.label) {
                if( NOT_SHOW_LABEL.indexOf(item.memberDegree.label) === -1 ){
                    item.memberDegreeName = item.memberDegree.label
                }
            }
        })

        let {showUserStatus, showAllUserBtn} = this.model.toJSON();

        if (showAllUserBtn) {
            resultList.unshift({
                userNickname: '全体成员',
                userId: 'all',
                imUserId: 'all',
                userUrl: './images/icon/all-user.png'
            });
        }

        return {resultList, showUserStatus};
    },

    renderResultList() {
        const {resultList = [], onlineNum} = this.model.toJSON();
        this.$el.find('#onlineNum').html(onlineNum);
        this.$el.find('#memberCount').html(resultList.length);
        this.$el.find('#itemsContainer').html(itemsTpl(this.formatResult([].concat(resultList))));
    },

    render: function() {
        this.$el.html(tpl(Object.assign({}, this.model.toJSON(), this.memberModel && this.memberModel.toJSON())));
    }
})

export {MemberList}
