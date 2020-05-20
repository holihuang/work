import { service } from '../../../common/service';
import { common } from '../../../common/common';
import { Dialog } from '../../../components/dialog/index';
import { StudentInfo } from '../studentInfo/index';
import tpl from './tpl.html';

const CADRE_LIST = {
    5: '班长',
    6: '学习委员',
    7: '纪律委员',
    8: '组长',
    14: '管理员',
}

// 管理员没权限操作的角色：14-管理员 1-群主
const ADMIN_CAN_NOT_OPER = [1, 14]

const NOT_SHOW_LABEL = ['普通学员', '老师']

let Model = Backbone.Model.extend({
    defaults: {
        kickOff: 0,  //未被移除
        degree: 0,   //身份
        forbidden: 1,  //是否被禁言 1为正常，2为禁言
        disabledClass: 'disabled', //默认一开始都不可点击，请求数据回来时才可点击
        operateClass: '',
    }
});

let StuOperatePanel = Backbone.View.extend({
    initialize(options) {
        let {userId, imUserId, groupId, oldGroupType, groupName, memberModel, aiteCallback, memberList, changeMemberDegreeCallback, userIsOwner, send } = options;

        this.send = send
        
        this.model = new Model();
        this.model.set({ userId, imUserId, groupId, groupName, userIsOwner, oldGroupType});
        this.memberModel = memberModel;
        this.aiteCallback = aiteCallback;
        this.changeMemberDegreeCallback = changeMemberDegreeCallback;
        this.memberList = memberList;
        this.render();
        this.listenTo(this.model, 'change', this.render);
        this.getStudentDetail();

        //当点击页面其他位置时，关闭改panel
        $('body').on('click', () => {
            this.close();
        })
    },

    events: {
        'click #delUserBtn': 'deleteUser', //从群里移除
        'click #cancelSetCadreBtn': 'cancelSetCadre',
        'click #secondStuOperatePanel': 'setCadre',
        'mouseenter #setCadreBtn,#secondStuOperatePanel': 'showSecondList',
        'mouseleave #setCadreBtn,#secondStuOperatePanel': 'hideSecondList',
        'click .setMonitor': 'setMonitor',  //设置为班干部
        'click #getDetailBtn': 'getDetail',  //查看资料
        'click #cancelForbiddenUserBtn': 'cancelForbiddenUser',
        'click #forbiddenUserBtn': 'forbiddenUser',
        'click #aiteBtn': 'aite', 
        'click': 'stop'
    },

    //阻止冒泡
    stop() {
        return false;
    },

    showSecondList(e) {
        this.Timer && clearTimeout(this.Timer)
        this.$el.find('#secondStuOperatePanel').removeClass('dn')
    },

    hideSecondList(e) {
        this.Timer = setTimeout(() => {
            this.$el.find('#secondStuOperatePanel').addClass('dn')
        }, 300)
    },

    close() {
        this.undelegateEvents();
        this.$el.remove();
        $('#messagesPanel').css('overflow-y', 'auto');
    },

    deleteUserRs(data) {
        const response = data

        if (response.rs) {
            alert('删除成功！');
            this.model.set({ kickOff: 1, operateClass: 'disabled' });
            let { memberCount } = this.memberModel.toJSON();
            this.memberModel.set({ memberCount: memberCount - 1 });
            this.memberList && this.memberList.update();
            this.close();
        } else {
            alert(response.rsdesp);
        }
    },

    deleteUser() {
        if (confirm('移除后会通知该成员及群聊中其他成员，且该成员不会再接收此群聊消息')) {
            let { userId, imUserId, groupId } = this.model.toJSON();
            let userAccount = common.getUserInfo().userAccount;

            this.send({
                command: 'DELETE_USER',
                data: {
                    from: 'stuOperatePanel',
                    userAccount,
                    groupId,
                    userIds: [userId],
                    imUserIds: [imUserId],
                    imUserId: common.getUserInfo().imIdForGroup,
                }
            })

            // service.deleteUser({
            //     userAccount,
            //     groupId,
            //     userIds: [userId],
            //     imUserIds: [imUserId]
            // }, (response) => {
            //     if (response.rs) {
            //         alert('删除成功！');
            //         this.model.set({ kickOff: 1, operateClass: 'disabled' });
            //         let { memberCount } = this.memberModel.toJSON();
            //         this.memberModel.set({ memberCount: memberCount - 1 });
            //         this.memberList && this.memberList.update();
            //         this.close();
            //     } else {
            //         alert(response.rsdesp);
            //     }
            // })
        }
    },

    cancelForbiddenUser() {
        if (confirm('解禁后会通知该成员，且该成员在群聊中发送消息恢复正常')) {
            this.forbidden(1); //解禁
        }
    },

    forbiddenUser() {
        if (confirm('禁言后会通知该成员，且不允许该成员在该群中发送消息，只可查阅群聊相关消息')) {
            this.forbidden(2); //禁言
        }
    },

    forbiddenRs(data) {
        const response = data
        const { forbidden = '' } = response

        if (response.rs) {
            alert('操作成功！');
            this.model.set({ forbidden });
            this.memberList && this.memberList.update();
            this.close();
        } else {
            alert(response.rsdesp);
        }
    },

    forbidden(forbidden) {
        let { userId, imUserId, groupId } = this.model.toJSON();
        let userAccount = common.getUserInfo().userAccount;

        this.send({
            command: 'FORBID_USER',
            data: {
                from: 'stuOperatePanel',
                userAccount,
                groupId,
                userIds: [userId],
                imUserIds: [imUserId],
                forbidden,  //1表示解禁、2表示禁言
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // service.forbiddenUser({
        //     userAccount,
        //     groupId,
        //     userIds: [userId],
        //     imUserIds: [imUserId],
        //     forbidden  //1表示解禁、2表示禁言
        // }, (response) => {
        //     if (response.rs) {
        //         alert('操作成功！');
        //         this.model.set({ forbidden });
        //         this.memberList && this.memberList.update();
        //         this.close();
        //     } else {
        //         alert(response.rsdesp);
        //     }
        // })
    },

    setCadre(e) {
        const ele = e.target
        if (ele.tagName.toLowerCase() === 'li') {
            let { cadreid = '1', cadrename = '班长' } = ele.dataset
            cadrename = cadrename.replace('设置', '')
            if (confirm(`确定设置该成员为${cadrename}吗？`)) {
                this.setCadreUser(cadreid);  //1为设置班干部(废弃) 3班长 4学习委员 5纪律委员 6组长
            }
        }
    },

    cancelSetCadre(e) {
        let { cadrename = '班长' } = e.target.dataset
        cadrename = cadrename.replace('设置', '')
        if (confirm(`确定取消该成员的${cadrename}身份吗？`)) {
            this.setCadreUser(2);  //2为取消设置班干部
        }
    },

    setCadreUserRs(data) {
        const response = data
        const { memType = '' } = response

        if (response.rs) {
            alert('操作成功');
            this.model.set({ degree: memType }); 
            this.memberList && this.memberList.update();
            //修改群成员的职位
            const degreeLabel = response.resultMessage && response.resultMessage.label 
            && (NOT_SHOW_LABEL.indexOf(response.resultMessage.label) === -1) ?
            `[${response.resultMessage.label}]` : '';
            $('.member-degree-'+response.imStuId).html(degreeLabel);
            
            this.close();
        } else {
            alert(response.rsdesp);
        }
    },

    setCadreUser(memType) {
        let { userId, imUserId, groupId, groupName } = this.model.toJSON();
        let userAccount = common.getUserInfo().userAccount;

        this.send({
            command: 'SET_CADRE_USER',
            data: {
                userAccount,
                groupId,
                groupName,
                userId: userId,
                imStuId: imUserId,
                memType,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // service.setCadreUser({
        //     userAccount,
        //     groupId,
        //     groupName,
        //     userId: userId,
        //     imStuId: imUserId,
        //     memType
        // }, (response) => {
        //     if (response.rs) {
        //         alert('操作成功');
        //         this.model.set({ degree: memType }); 
        //         this.memberList && this.memberList.update();
        //         //修改群成员的职位
        //         const degreeLabel = response.resultMessage && response.resultMessage.label 
        //         && (NOT_SHOW_LABEL.indexOf(response.resultMessage.label) === -1) ?
        //         `[${response.resultMessage.label}]` : '';
        //         $('.member-degree-'+imUserId).html(degreeLabel);
                
        //         this.close();
        //     } else {
        //         alert(response.rsdesp);
        //     }
        // })
    },

    getDetail() {
        let { userId, stuInfo } = this.model.toJSON();

        this.studentInfo = new StudentInfo(stuInfo);
        new Dialog({
            title: '学员ID：' + userId,
            content: this.studentInfo.$el,
            type: 4,
            showFooter: false
        })

        this.close();
    },

    getStudentDetailRs(data) {
        const response = data
        if (response.rs) {
            let { degree, forbidden, kickOff, ...others } = response.resultMessage;

            const operateClass = kickOff ? 'disabled' : '';
            this.model.set({ degree, forbidden, kickOff, stuInfo: others, disabledClass: '', operateClass });
        }
    },

    getStudentDetail() {
        let { userId, imUserId, groupId } = this.model.toJSON();

        this.send({
            command: 'GET_STU_DETAIL',
            data: {
                userId,
                groupId,
                imStuId: imUserId,
                imUserId: common.getUserInfo().imIdForGroup,
                teacherAccount: common.getUserInfo().userAccount,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // service.getGroupMemberInfo({
        //     userId,
        //     groupId,
        //     imStuId: imUserId,
        //     imUserId: common.getUserInfo().imIdForGroup,
        //     teacherAccount: common.getUserInfo().userAccount
        // }, (response) => {
        //     if (response.rs) {
        //         let { degree, forbidden, kickOff, ...others } = response.resultMessage;

        //         const operateClass = kickOff ? 'disabled' : '';
        //         this.model.set({ degree, forbidden, kickOff, stuInfo: others, disabledClass: '', operateClass });
        //     }
        // })
    },

    aite() {
        let { userId, imUserId, stuInfo } = this.model.toJSON();
        this.aiteCallback({
            userId,
            imUserId,
            nickName: stuInfo.nickName
        })

        this.close();
    },

    format(data) {
        let { forbidden, degree, kickOff, userIsOwner, oldGroupType } = data;

        const adminAndHasNotOper = !(!userIsOwner && ADMIN_CAN_NOT_OPER.indexOf(+degree) > -1)

        data.canBeForbidden = forbidden == 1 && adminAndHasNotOper ? true : false;
        data.canBeCancelForbidden = forbidden == 2 && adminAndHasNotOper ? true : false;
        // 显示取消：对方有身份
        data.isShowCancel = CADRE_LIST[degree] && adminAndHasNotOper ? true : false; 
        // 显示设置：对方不能有身份
        data.isShowSet = !CADRE_LIST[degree] && adminAndHasNotOper ? true : false;
            
        data.cadreName = CADRE_LIST[degree]; // 具体身份
        data.isStay = !kickOff && adminAndHasNotOper ? true : false;  //是否能移除
        data.isRemoved = kickOff == 1 ? true : false; //被移除
        data.isLeft = kickOff == 2 ? true : false; //主动退出

        // data.isNoClassGroup = data.isStay && oldGroupType != 2
        data.isNoClassGroup = data.isStay && ![2, 8].includes(oldGroupType)
        // data.isNoClassGroup = false
        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export { StuOperatePanel }
