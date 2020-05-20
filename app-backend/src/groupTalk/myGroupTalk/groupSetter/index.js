import {Dialog} from '../../../components/dialog/index';
import {service} from '../../../common/service';
import {common} from '../../../common/common';
import {TeacherList} from './teacherList/index';

//汉字校验
const chineseCharactersReg = new RegExp("[\\u4E00-\\u9FFF]+");
let tpl = require('./tpl.html');

let Model = Backbone.Model.extend({
    defaults: {
        transferTeacherName: '',
        operateType: 1,  //默认为群资料页,
        canOperate: true
    }
});

let View = Backbone.View.extend({
    initialize: function(options) {
        let {
            userIsOwner,
            groupId,
            onCancel,
            onUpdateGroupDetails,
            onUpdateGroupStatus,
            onUpdateGroupAnnounce,
            onDelete,
            send,
            oldGroupType,
        } = options;

        this.send = send

        // TODO userIsOwner

        this.onCancel = onCancel;
        this.onUpdateGroupDetails = onUpdateGroupDetails;
        this.onUpdateGroupStatus = onUpdateGroupStatus;
        this.onUpdateGroupAnnounce = onUpdateGroupAnnounce;
        this.onDelete = onDelete;
        this.model = new Model();
        
        this.model.set({groupId, userIsOwner, oldGroupType});
        this.model.set({ isDutyTeacherOrSCHTeacher: (window.userInfo.userRole.indexOf("SCH_DUTYTEACHER") !== -1) || (window.userInfo.userRole.indexOf("SCH_TEACHER") !== -1)})
        this.render();
        this.listenTo(this.model, 'change', this.render);
        this.getGroupInfo();
    },

    events: {
        'click #detailsBtn': 'switchToDetailsPanel',
        'click #statusBtn': 'switchToStatusPanel',
        'click #announceBtn': 'switchToAnnouncePanel',
        'click #uploadGroupAvatarBtn': 'uploadGroupAvatar',
        'click #cancelBtn': 'cancel',
        'click #submitBtn': 'submit',
        'click #cancelForbidden': 'cancelForbidden',
        'click #forbidden': 'forbidden',
        'click #delete': 'delete',
        'click #okBtn': 'cancel',
        'click #deleteGroupAnnounceBtn': 'deleteGroupAnnounce',
        'click #showTeacherListPanelBtn': 'showTeacherListPanel',
        'input #searchIpt': 'searchTeacherList',
        'click .teacher-item': 'transferGroupManager'
    },

    switchToDetailsPanel() {
        this.model.set({operateType: 1});
    },

    switchToStatusPanel() {
        this.model.set({operateType: 2});
    },

    switchToAnnouncePanel() {
        this.model.set({operateType: 3}); //群公告页面
    },

    uploadGroupAvatar(e) {
        if ($(e.currentTarget).hasClass('disabled')) {
            return;
        }

        common.picUploaderNew((response) => {
            if (response.rs) {
                let url = response.resultMessage[0].linkUrl;
                this.$el.find('#groupUrl').val(url);
                this.$el.find('#groupUrlHolder').attr('src', url);
                this.$el.find('#uploadGroupAvatarBtn').html('更新');
            } else {
                alert('上传图片失败:' + response.rsdesp);
            }
            this.$el.find('#uploadGroupAvatarBtn').removeClass('disabled');
            this.$el.find('#isAvatarLoading').hide();
        }, ({name, size}) => {
            this.$el.find('#isAvatarLoading').show();
            this.$el.find('#uploadGroupAvatarBtn').addClass('disabled');
        })
    },

    cancel() {
        this.onCancel();
    },

    forbidden() {
        this.updateGroupState(2);
    },

    cancelForbidden() {
        this.updateGroupState(1);
    },

    updateGroupStateRs(data) {
        const response = data

        if (response.rs) {
            this.model.set({groupForbidden: response.forbidden});
        } else {
            alert(response.rsdesp)
        }
    },

    updateGroupState(forbidden) {
        const {groupId, canOperate} = this.model.toJSON();
        
        if (!canOperate) {
            alert('不能对该群进行操作！');
            return;
        }

        const { userAccount } = common.getUserInfo()

        this.send({
            command: 'UPDATE_GROUP_STATE',
            data: {
                userAccount,
                groupId,
                forbidden,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // service.updateGroupState({
        //     userAccount: common.getUserInfo().userAccount,
        //     groupId,
        //     forbidden
        // }, (response) => {
        //     if (response.rs) {
        //         this.model.set({groupForbidden: forbidden});
        //     } else {
        //         alert(response.rsdesp)
        //     }
        // })
    },

    // cancelDelete() {

    // },

    deleteRs(data) {
        const response = data

        if (response.rs) {
            this.model.set({groupStatus: 2});
            if (typeof this.onDelete === 'function') {
                this.onDelete();
            }
        } else {
            alert(response.rsdesp);
        }
    },

    delete() {
        const {groupId, groupName, canOperate} = this.model.toJSON();
        if (!canOperate) {
            alert('不能对该群进行操作！');
            return;
        }

        const { userAccount } = common.getUserInfo()

        this.send({
            command: 'DELETE_GROUP',
            data: {
                userAccount,
                groupId,
                groupName,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })


        // service.deleteGroup({
        //     userAccount: common.getUserInfo().userAccount,
        //     groupId,
        //     groupName
        // }, (response) => {
        //     if (response.rs) {
        //         this.model.set({groupStatus: 2});
        //         if (typeof this.onDelete === 'function') {
        //             this.onDelete();
        //         }
        //     } else {
        //         alert(response.rsdesp);
        //     }
        // })
    },

    deleteGroupAnnounceRs(data) {
        const response = data

        if (response.rs) {
            alert('删除成功！');
            this.model.set({groupAnnounce: ''});
        } else {
            alert(response.rsdesp);
        }
    },

    deleteGroupAnnounce() {
        const {groupAnnounce, groupId, canOperate} = this.model.toJSON();
        if (!canOperate) {
            alert('不能对该群进行操作！');
            return;
        }
        if (!groupAnnounce) {
            alert('当前未设置群公告！');
            return;
        }

        const { userAccount } = common.getUserInfo()

        this.send({
            command: 'DELETE_GROUP_ANNOUNCE',
            data: {
                userAccount,
                groupId,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // service.deleteGroupAnnounce({
        //     groupId,
        //     userAccount: common.getUserInfo().userAccount
        // }, (response) => {
        //     if (response.rs) {
        //         alert('删除成功！');
        //         this.model.set({groupAnnounce: ''});
        //     } else {
        //         alert(response.rsdesp);
        //     }
        // })
    },

    submit() {
        let data;
        let {operateType, groupId, canOperate} = this.model.toJSON();

        if (!canOperate) {
            alert('不能对该群进行操作！');
            return;
        }

        switch(operateType) {
            case 1:
                data = common.getFormData({
                    formId: 'detailsForm'
                });

                //校验
                const groupName = this.$el.find('[name="groupName"]').val().trim();
                if (!groupName) {
                    alert('请填写群名称！');
                    return false;
                }

                if (groupName.length > 15) {
                    alert('群名称不可超过15个字符！');
                    return false;
                }

                const groupType = this.$el.find('[name="groupType"]').val();
                if (!groupType) {
                    alert('请选择群聊类型！');
                    return false;
                }

                // 若类型为班级群，群名称必须包括数字
                if (parseInt(groupType) === 2) {
                    const regex = /[0-9]/; 
                    let isHaveNumber = regex.test(decodeURIComponent(groupName));//true,说明有数字
                    if (!isHaveNumber) {
                        alert('班级群命名规则须包含考期字段，请键入考期数字重新命名');
                        return false
                    }
                }
                const groupDescrp = this.$el.find('[name="groupDescrp"]').val().trim();
                if (groupDescrp && groupDescrp.length) {
                    if(!chineseCharactersReg.test(groupDescrp)) {
                        alert('请至少输入一个汉字！');
                        return false;
                    } else if (groupDescrp.length > 100) {
                        alert('群聊简介过长，请重新输入！');
                        return false;
                    }
                }

                this.onUpdateGroupDetails({groupId, ...data});
                break;
            case 3:
                //修改群公告
                const groupAnnounce = this.$el.find('#groupAnnounce').val().trim();

                const groupAnnounceOri = this.model.get('groupAnnounce');

                if (groupAnnounceOri === groupAnnounce) {
                    //如果没有进行修改，直接关掉弹窗
                    this.cancel();
                }

                if (!groupAnnounce) {
                    alert('群公告内容不可为空，请输入内容后发布~');
                    return;
                }

                if (!groupAnnounce.match(/[\u3400-\u9FBF]/)) {
                    alert('您需要输入文字');
                    return;
                }

                if (groupAnnounce.length > 200) {
                    alert('公告字数已超200字，请重新编辑~');
                    return;
                }

                this.onUpdateGroupAnnounce({
                    userAccount: common.getUserInfo().userAccount,
                    groupId,
                    groupAnnounce: encodeURIComponent(groupAnnounce),
                });
                break;
        }
    },

    getGroupInfo() {

        this.getGroupDetails()
        this.model.get('userIsOwner') && this.getGroupStatus()
        this.getGroupAnnounce()

        // const prArr = [
        //     this.getGroupDetails(),
        // ]
        
        // this.model.get('userIsOwner') && prArr.push(this.getGroupStatus())
        // prArr.push(this.getGroupAnnounce())

        // Promise.all(prArr).then(values => {
        //     if (values.length === 2) {
        //         this.model.set({...values[0], groupAnnounce: values[1]});
        //     } else if (values.length === 3) {
        //         this.model.set({...values[0], ...values[1], groupAnnounce: values[2]});
        //     }
        // })
    },

    getGroupDetailsRs(data) {
        const response = data
        if (response.rs) {
            const resultMessage = response.resultMessage

            
            this.model.set({
                ...resultMessage
            })
        } else {
            alert(response.rsdesp);
        }
    },

    getGroupDetails() {
        let {groupId} = this.model.toJSON();
        // let userAccount = common.getUserInfo().userAccount;
        const { userAccount } = common.getUserInfo()

        this.send({
            command: 'GET_GROUP_DETAILS',
            data: {
                userAccount,
                groupId,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // return new Promise((resolve, reject) => {
        //     service.getGroupDetails({
        //         groupId,
        //         userAccount
        //     }, (response) => {
        //         if (response.rs) {
        //             resolve(response.resultMessage);
        //         }
        //     })
        // })
    },

    getGroupStatusRs(data) {
        const response = data
        if (response.rs) {
            const resultMessage = response.resultMessage

            this.model.set({
                ...resultMessage
            })
        } else {
            alert(response.rsdesp);
        }
    },

    getGroupStatus() {
        let {groupId} = this.model.toJSON();
        // let userAccount = common.getUserInfo().userAccount;
        const { userAccount } = common.getUserInfo()

        this.send({
            command: 'GET_GROUP_STATUS',
            data: {
                userAccount,
                groupId,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // return new Promise((resolve, reject) => {
        //     service.getGroupStatus({
        //         groupId,
        //         userAccount
        //     }, (response) => {
        //         if (response.rs) {
        //             resolve(response.resultMessage)
        //         }
        //     })
        // })
    },

    getGroupAnnounceRs(data) {
        const response = data
        if (response.rs) {
            const resultMessage = response.resultMessage

            this.model.set({
                groupAnnounce: resultMessage
            })
        } else {
            alert(response.rsdesp);
        }
    },

    getGroupAnnounce() {
        const {groupId} = this.model.toJSON();

        // let userAccount = common.getUserInfo().userAccount;
        const { userAccount } = common.getUserInfo()

        this.send({
            command: 'GET_GROUP_ANNOUNCE',
            data: {
                userAccount,
                groupId,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // return new Promise((resolve, reject) => {
        //     service.getGroupAnnounce({
        //         groupId,
        //         userAccount
        //     }, (response) => {
        //         if (response.rs) {
        //             resolve(response.resultMessage);
        //         } else {
        //             alert(response.rsdesp);
        //         }
        //     })
        // })
    },

    getTeacherListRs(data) {
        this.teacherList.getTeacherListRs(data)
    },

    chooseTeacherRs(data) {
        this.teacherList.chooseTeacherRs(data)
    },

    showTeacherListPanel(e) {
        const {groupId} = this.model.toJSON();
        this.teacherList = new TeacherList({
            groupId,
            send: this.send,
            onChooseTeacher: (data) => {
                let {userNickname} = data;
                this.model.set({transferTeacherName: userNickname, canOperate: false});

                if (typeof this.onDelete === 'function') {
                    this.onDelete();
                }
            }
        })
    },

    searchTeacherList(e) {
        const condition = $(e.currentTarget).val();
        service.listGroupTeacher({
            condition,
            groupId,
            userAccount: common.getUserInfo().userAccount
        }, (response) => {
            if (response.rs) {
                let {resultMessage} = response;
                this.model.set({teacherList: resultMessage});
            } else {
                alert(response.rsdesp);
            }
        })
    },

    // 这个服务 应该用不到，所以htpp未升级ws，防止万一先不删除。
    transferGroupManager(e) {
        let imUserId = $(e.currentTarget).attr('imid');
        let {groupId} = this.model.toJSON();

        service.transferGroupManager({
            imUserId,
            groupId,
            teacherAccount: common.getUserInfo().userAccount
        }, (response) => {
            if (response.rs) {
                alert('转让成功！');

                if (typeof this.onDelete === 'function') {
                    this.onDelete();
                }
            } else {
                alert(response.rsdesp);
            }
        })
    },

    format(data) {
        // oldGroupType => 在打开群设置之前群的类别（SET_GROUP_ACTIVE时返回的），如果设置完再打开，oldGroupType还是之前的，请注意~
        let {operateType, groupForbidden, groupStatus, groupType, oldGroupType} = this.model.toJSON();

        // 不是班级群
        // data.isNoClassGroup = oldGroupType != 2
        // 2 - 版主群  8 - ko群
        data.isNoClassGroup = ![2, 8].includes(oldGroupType)
        data.classText = {
            2: '班级群',
            8: 'KO班级群',
        }[oldGroupType] || ''
        // data.isNoClassGroup = false

        switch(operateType) {
            case 1:
                data.detailActiveClass = 'active';
                data.statusActiveClass = '';
                data.announceActiveClass = '';

                data.detailHideClass = '';
                data.statusHideClass = 'hide';
                data.announceHideClass = 'hide';

                data.showFooter = true;
                break;
            case 2:
                data.detailActiveClass = '';
                data.statusActiveClass = 'active';
                data.announceActiveClass = '';

                data.detailHideClass = 'hide';
                data.statusHideClass = '';
                data.announceHideClass = 'hide';

                data.showFooter = false;
                break;
            case 3:
                data.detailActiveClass = '';
                data.statusActiveClass = '';
                data.announceActiveClass = 'active';

                data.detailHideClass = 'hide';
                data.statusHideClass = 'hide';
                data.announceHideClass = '';

                data.showFooter = true;
            default:
                break;
        }

        switch (groupForbidden) {
            case 1: //不禁言
                data.isForbidden = false;
                break;
            case 2: //禁言
                data.isForbidden = true;
                break;
            default:
                data.isForbidden = false;
                break;
        }

        switch (groupStatus) {
            case 1: //正常
                data.isDelete = false;
                break;
            case 2:  //解散
                data.isDelete = true;
                break;
            default:
                data.isDelete = false;
                break;
        }

        switch (groupType) {
            case 1:
                data.XSQ_selected = 'selected';
                break;
            case 2:
                data.XSBJQ_selected = 'selected';
                break;
            case 3: // 以前是老生群，后来剔除了此类别，又后来加了学霸群，复用了老生群的type
                data.XBJLB_selected = 'selected';
                break;
            case 4:
                data.HDYYQ_selected = 'selected';
                break;
            case 5:
                data.KCQ_selected = 'selected';
                break;
            case 6:
                data.STQ_selected = 'selected';
                break;
            case 7:
                data.QT_selected = 'selected';
                break;
        }

        return data;
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

class GroupSetter {
    constructor(options) {
        let {groupId, groupType, userIsOwner, deleteGroupCallback, updateGroupDetailCallback, send} = options;

        this.send = send

        this.view = new View({
            groupId,
            oldGroupType: groupType,
            send: this.send,
            userIsOwner,
            onCancel: this.cancel.bind(this),
            onUpdateGroupDetails: this.updateGroupDetails.bind(this),
            // onUpdateGroupStatus: this.updateGroupStatus.bind(this),
            onUpdateGroupAnnounce: this.updateGroupAnnounce.bind(this),
            onDelete: deleteGroupCallback,
        });
        this.updateGroupDetailCallback = updateGroupDetailCallback;
        this.show();
    }

    show() {
        this.d = new Dialog({
            content: this.view.$el,
            type: 4,
            showHeader: false,
            showFooter: false
        })
    }

    cancel() {
        this.d.closeDialog();
    }

    getGroupDetailsRs(data) {
        this.view.getGroupDetailsRs(data)
    }

    getGroupStatusRs(data) {
        this.view.getGroupStatusRs(data)
    }

    getGroupAnnounceRs(data) {
        this.view.getGroupAnnounceRs(data)
    }

    deleteRs(data) {
        this.view.deleteRs(data)
    }

    deleteGroupAnnounceRs(data) {
        this.view.deleteGroupAnnounceRs(data)
    }

    updateGroupStateRs(data) {
        this.view.updateGroupStateRs(data)
    }

    getTeacherListRs(data) {
        this.view.getTeacherListRs(data)
    }

    chooseTeacherRs(data) {
        this.view.chooseTeacherRs(data)
    }

    updateGroupDetailsRs(data) {
        const response = data

        if (response.rs) {
            alert('设置成功！');
            if (typeof this.updateGroupDetailCallback === 'function') {
                this.updateGroupDetailCallback(response);
            }
            this.d.closeDialog();
        } else {
            alert(response.rsdesp);
        }
    }

    updateGroupDetails(params) {

        this.send({
            command: 'UPDATE_GROUP_DETAILS',
            data: {
                ...params,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })

        // service.updateGroupDetails(params, (response) => {
        //     if (response.rs) {
        //         alert('设置成功！');
        //         if (typeof this.updateGroupDetailCallback === 'function') {
        //             this.updateGroupDetailCallback(params);
        //         }
        //         this.d.closeDialog();
        //     } else {
        //         alert(response.rsdesp);
        //     }
        // })
    }

    // updateGroupStatus(params) {
    //     service.updateGroupState(params, (response) => {
    //         if (response.rs) {
    //             alert('设置成功！');
    //             this.d.closeDialog();
    //         } else {
    //             alert(response.rsdesp);
    //         }
    //     })
    // }

    updateGroupAnnounceRs(data) {
        const response = data

        if (response.rs) {
            alert('设置成功！');
            this.d.closeDialog();
        } else {
            alert(response.rsdesp);
        }
    }

    updateGroupAnnounce(params) {
        this.send({
            command: 'UPDATE_GROUP_ANNOUNCE',
            data: {
                ...params,
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })
        // service.updateGroupAnnounce(params, (response) => {
        //     if (response.rs) {
        //         alert('设置成功！');
        //         this.d.closeDialog();
        //     } else {
        //         alert(response.rsdesp);
        //     }
        // })
    }
}

export {GroupSetter}
