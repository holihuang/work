import {Dialog} from '../../../components/dialog/index';
import {service} from '../../../common/service';
import {common} from '../../../common/common';
import {DialogContent} from '../../groupInitor/dialogContent/index'

let tpl = require('./tpl.html');
//const dialogContentTpl = require('../../groupInitor/dialogContent.html')
let Model = Backbone.Model.extend({
    defaults: {

    }
});

let View = Backbone.View.extend({
    initialize(options) {
        this.model = new Model();
        this.render();
    },

    events: {
        'click #uploadGroupMemberBtn': 'uploadGroupMember',
    },
    uploadGroupMember() {
        service.uploadGroupNameFile((options) => {
            let {size, name} = options;
            let ext = name.substr(name.lastIndexOf('.') + 1, name.length - 1);
            if (!(ext && /^(xlsx|xls)$/.test(ext.toLowerCase()))) {
                alert('请上传表格格式文件！');
                return false;
            }

            if (size > 10 * 1024 * 1024) {
                alert('上传文件不能超过10MB~');
                return false;
            }
            this.$el.find('#isUserLoading').show();
            this.$el.find('#uploadGroupMemberBtn').addClass('disabled');
        }, (response) => {
            if (response.rs) {
                this.$el.find('#isUserLoading').hide();
                this.$el.find('#uploadGroupMemberBtn').html('更新');
                let {resultMessage} = response;
                this.model.set({...resultMessage[0]});
                let {fileName, sucList} = resultMessage[0];
                this.$el.find('#fileName').html(`${fileName}, 成功上传${sucList.length}位成员`);
            } else {
                alert(response.rsdesp || '上传失败~');
                this.$el.find('#isUserLoading').hide();
            }

            this.$el.find('#uploadGroupMemberBtn').removeClass('disabled');
        })
    },

    getMembers() {
        let {sucList} = this.model.toJSON();
        return sucList;
    },

    render() {
        this.$el.html(tpl());
    }
})

class AddMemberDialog {
    constructor(options) {
        let {groupName, groupId, memberModel, callback} = options;

        this.send = options.send

        this.groupName = groupName;
        this.groupId = groupId;
        this.callback = callback;
        this.memberModel = memberModel;
        this.view = new View();
        this.show();
    }

    closeAllDialog() {
        this.d.closeDialog()
    }

    addNewMembersRs(data) {
        const that = this
        const response = data

        if (response.rs) {
            if(response.rsdesp) {
                alert(response.rsdesp);
            } else {
                alert('添加成功！');
            }
            
            if (typeof that.callback === 'function') {
                that.callback(response.resultMessage);
            }

            const {memberCount} = response.resultMessage;

            that.memberModel.set({memberCount});

            this.d.closeDialog();
        } else {
            if(response.failedUserUrl) {
                const {memberCount} = response.resultMessage;
                if(!!memberCount){
                    that.memberModel.set({memberCount});
                }
                
                this.dialogContent && this.dialogContent.undelegateEvents()
                this.dialogContent = new DialogContent(
                    {
                        callBack: that.closeAllDialog.bind(that),
                        ...response
                    }
                )
                const resultDialog = new Dialog({
                    title: '添加成员成功！',
                    type: 4,
                    showFooter: false,
                    content: this.dialogContent.$el,
                });
            } else {
                alert(response.rsdesp);
            } 
        }
    }

    show() {
        let that = this;
        this.d = new Dialog({
            title: `邀请学员进入群聊${this.groupName}`,
            content: this.view.$el,
            type: 4,
            ok: function() {
                let members = that.view.getMembers();
                if (members) {

                    that.send({
                        command: 'ADD_NEW_MEMBERS',
                        data: {
                            userAccount: common.getUserInfo().userAccount,
                            groupId: that.groupId,
                            memberCount: that.memberModel.get('memberCount'),
                            members,
                            imUserId: common.getUserInfo().imIdForGroup,
                        }
                    })

                    // service.addNewMembers({
                    //     userAccount: common.getUserInfo().userAccount,
                    //     groupId: that.groupId,
                    //     memberCount: that.memberModel.get('memberCount'),
                    //     members
                    // }, (response) => {
                    //     if (response.rs) {
                    //         if(response.rsdesp) {
                    //             alert(response.rsdesp);
                    //         } else {
                    //             alert('添加成功！');
                    //         }
                            
                    //         if (typeof that.callback === 'function') {
                    //             that.callback(response.resultMessage);
                    //         }

                    //         const {memberCount} = response.resultMessage;

                    //         that.memberModel.set({memberCount});

                    //         this.closeDialog();
                    //     } else {
                    //         if(response.failedUserUrl) {
                    //             const {memberCount} = response.resultMessage;
                    //             if(!!memberCount){
                    //                 that.memberModel.set({memberCount});
                    //             }
                                
                    //             this.dialogContent && this.dialogContent.undelegateEvents()
                    //             this.dialogContent = new DialogContent(
                    //                 {
                    //                     callBack: that.closeAllDialog.bind(that),
                    //                     ...response
                    //                 }
                    //             )
                    //             const resultDialog = new Dialog({
                    //                 title: '添加成员成功！',
                    //                 type: 4,
                    //                 showFooter: false,
                    //                 content: this.dialogContent.$el,
                    //             });
                    //         } else {
                    //             alert(response.rsdesp);
                    //         } 
                    //     }
                    // })
                } else {
                    alert('请添加群成员！');
                }
            }
        })
    }
}

export {AddMemberDialog}
