import {Dialog} from '../../../../components/dialog/index';
import {service} from '../../../../common/service';
import {common} from '../../../../common/common';
import tpl from './tpl.html';

const Model = Backbone.Model.extend({
    defaults: {
        teacherList: [],
        groupId: -1
    }
})

const View = Backbone.View.extend({
    initialize(options) {
        const {groupId, handleChooseTeacher} = options;

        this.handleChooseTeacher = handleChooseTeacher;

        this.send = options.send

        this.model = new Model();
        this.model.set({groupId});
        this.listenTo(this.model, 'change', this.render);
        this.getTeacherList();

        this.render();
    },

    events: {
        'input #searchIpt': 'searchAll',
        'click .item': 'chooseTeacher',
        'click #searchBtn': 'search',
    },

    search() {
        const condition = this.$el.find('#searchIpt').val().trim();
        this.getTeacherList(condition);
    },

    searchAll(e) {
        if (!$(e.currentTarget).val().trim()) {
            this.getTeacherList();
        }
    },

    chooseTeacherRs(data) {
        const response = data
        const userNickname = response.userNickname

        if (response.rs) {
            this.handleChooseTeacher({userNickname});
        } else {
            alert(response.rsdesp);
        }
    },

    chooseTeacher(e) {
        const {groupId} = this.model.toJSON();
        const imUserId = $(e.currentTarget).attr('imid');
        const userNickname = $(e.currentTarget).find('.nickname').html();

        if (confirm(`确定要将管理权转交给${userNickname}吗？`)) {

            this.send({
                command: 'TRANSFER_GROUP',
                data: {
                    userNickname,
                    groupId,
                    newImUserId: imUserId,
                    teacherAccount: common.getUserInfo().userAccount,
                    imUserId: common.getUserInfo().imIdForGroup,
                }
            })

            // service.transferGroupManager({
            //     groupId,
            //     newImUserId: imUserId,
            //     imUserId: common.getUserInfo().imIdForGroup,
            //     teacherAccount: common.getUserInfo().userAccount
            // }, (response) => {
            //     if (response.rs) {
            //         this.handleChooseTeacher({userNickname});
            //     } else {
            //         alert(response.rsdesp);
            //     }
            // })
        }
    },

    getTeacherListRs(data) {
        const response = data

        const { condition = '' } = response

        if (response.rs) {
            const {resultList} = response.resultMessage;
            if (!resultList.length) {
                if (condition) {
                    this.$el.find('#tip').html('没有符合条件的老师~');
                    this.$el.find('.list').hide();
                } else {
                    this.$el.find('#tip').html('群内没有其他老师，无法转让');
                }
            } else {
                this.model.set({teacherList: resultList});
                this.$el.find('.list').show();
                this.$el.find('#tip').html('');
            }
        } else {
            alert(response.rsdesp);
        }
    },

    getTeacherList(condition) {
        const {groupId} = this.model.toJSON();

        const { userAccount } = common.getUserInfo()

        this.send({
            command: 'LIST_GROUP_MEMBERS',
            data: {
                from: 'groupSetter',
                userAccount,
                groupId,
                condition,
                category: 3,  //代表该群的老师列表
                imUserId: common.getUserInfo().imIdForGroup,
            }
        })


        // service.listGroupMembers({
        //     groupId,
        //     condition,
        //     category: 3,  //代表该群的老师列表
        //     userAccount: common.getUserInfo().userAccount,
        // }, (response) => {
        //     if (response.rs) {
        //         const {resultList} = response.resultMessage;
        //         if (!resultList.length) {
        //             if (condition) {
        //                 this.$el.find('#tip').html('没有符合条件的老师~');
        //                 this.$el.find('.list').hide();
        //             } else {
        //                 this.$el.find('#tip').html('群内没有其他老师，无法转让');
        //             }
        //         } else {
        //             this.model.set({teacherList: resultList});
        //             this.$el.find('.list').show();
        //             this.$el.find('#tip').html('');
        //         }
        //     } else {
        //         alert(response.rsdesp);
        //     }
        // })
    },

    render() {
        const data = this.model.toJSON();
        this.$el.html(tpl(data));
    }
})

class TeacherList {
    constructor(options = {}) {
        this.options = options;

        this.send = options.send

        const {groupId} = options;
        this.view = new View({
            groupId,
            send: this.send,
            handleChooseTeacher: this.handleChooseTeacher.bind(this)
        });
        this.show();
    }

    show() {
        this.d = new Dialog({
            title: '请选择新群主',
            content: this.view.$el,
            type: 4
        });
    }

    getTeacherListRs(data) {
        this.view.getTeacherListRs(data)
    }

    chooseTeacherRs(data) {
        this.view.chooseTeacherRs(data)
    }

    handleChooseTeacher(data) {
        if (typeof this.options.onChooseTeacher === 'function') {
            this.options.onChooseTeacher(data);
        }

        this.d.closeDialog();
    }
}

export {TeacherList}






