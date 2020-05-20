import {common} from '../../../../../common/common';
import {service} from '../../../../../common/service';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        formId: 'form0',
        userExist: false,
        hasUserChange: false
    }
});

var Item = Backbone.View.extend({
    initialize: function (options = {}) {
        let {formId, isFirst} = options;
        this.model = new Model();
        this.model.set({formId, isFirst});
        this.render();
    },

    events: {
        "blur #user": "checkUser",
        "change #user": "handleUserChange",
        "change #type": "handleTypeChange",
        'input #nickname': 'showNicknames',
        'click .nickname-item': 'chooseAName'
    },

    handleUserChange() {
        this.model.set({hasUserChange: true});
    },

    checkUser() {
        let user = this.$el.find('#user').val();
        let type = this.$el.find('#type').val();

        let {hasUserChange} = this.model.toJSON();

        //当为用户id和手机号时，校验用户是否存在
        let params, needCheck;
        if (type == 'mobile') {
            params = {
                mobile: user
            }
            needCheck = true;
        } else if (type == 'id') {
            params = {
                userId: user
            }
            needCheck = true;
        }

        if (needCheck && user && hasUserChange) {
            service.checkUserExist(params, (response) => {
                if (!response.rs) {
                    alert('用户不存在，请重新输入！');
                    this.model.set({userExist: false});
                } else {
                    this.model.set({userExist: true});
                }

                this.model.set({hasUserChange: false});
            })
        }
    },

    handleTypeChange() {
        let type = this.$el.find('#type').val();
        if (type === 'nickname') {
            this.$el.find('#nicknameGroup').removeClass('hide');
            this.$el.find('#user').addClass('hide');
        } else {
            this.$el.find('#nicknameGroup').addClass('hide');
            this.$el.find('#user').removeClass('hide');
        }

        //每次切换重置输入框状态
        this.$el.find('#user').val('');
        this.$el.find('#nickname').val('');
        this.$el.find('#userId').val('');
        this.model.set({userExist: false});
    },

    showNicknames() {
        let nickname = encodeURIComponent(this.$el.find('#nickname').val());
        if (nickname) {
            service.showNicknames({
                nickname
            }, (response) => {
                if (response.rs) {
                    let nicknameList = response.resultMessage || [];
                    let str = '';
                    for (let i = 0, len = nicknameList.length; i < len; i++) {
                        str += `<li class="nickname-item" userid="${nicknameList[i].id}" name="${nicknameList[i].nickname}">${nicknameList[i].nickname}</li>`;
                    }
                    
                    // 判断是否和当前输入的内容一致
                    // if ($('#nickname').val() === decodeURIComponent(nickname)) {
                    this.$el.find('#nicknameList').html(str).show();
                    // }
                }
            })
        } else {
            this.$el.find('#nicknameList').html('').hide();
            this.$el.find('#userId').val('');
        }
    },

    chooseAName(e) {
        let userId = $(e.currentTarget).attr('userid');
        let userNickName = $(e.currentTarget).attr('name');
        this.$el.find('#nickname').val(userNickName);
        this.$el.find('#userId').val(userId);
        this.model.set({userExist: true});
        this.$el.find('#nicknameList').html('').hide();
        e.preventDefault();
        return false;
    },

    getData() {
        let {formId, userExist} = this.model.toJSON();
        let params = common.getFormData({
            formId
        });

        if (!userExist) {
            alert('用户不存在，请重新输入');
            return false;
        }

        let {sunlandAmount, experience} = params;
        if (!sunlandAmount && !experience) {
            alert('请填写尚德元或经验值！');
            return false;
        }
        if (sunlandAmount && !(+sunlandAmount)) {
            alert('尚德元需填写数字！且不为0');
            return false;
        }
        if (experience && !(+experience)) {
            alert('经验值需填写数字！且不为0');
            return false;
        }

        let {remark} = params;
        if (!remark) {
            alert('请输入描述文案！');
            return false;
        }
        if (decodeURIComponent(remark).length > 50) {
            alert("描述文案不能超过50个字符");
            return false;
        }

        //处理用户id、手机号和昵称
        let {type, user, nickname} = params;
        switch (type) {
            case 'nickname':
                params.userNickName = nickname;
                break;
            case 'mobile':
                params.mobile = user;
                delete params.userId;
                break;
            case 'id':
                params.userId = user;
                break;
            default:
                break;
        }

        delete params.user;
        delete params.nickname;

        return params;
    },

    format(data) {
        return data;
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

export {Item}