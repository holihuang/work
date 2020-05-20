import {Dialog} from '../../../../components/dialog/index';
import {service} from '../../../../common/service';
import {common} from '../../../../common/common';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        hideReasonMap: {
            "退学相关": [
                "质疑协议",
                "退费方案",
                "退费时间",
                "到账时间",
                "自身原因",
                "退学咨询",
                "未明确原因"
            ],
            // "课程相关": [
            //     "报考相关",
            //     "课程提醒",
            //     "手续办理",
            //     "证书领取",
            //     "课程咨询",
            //     "课程转让",
            //     "师资力量",
            //     "课堂环境",
            //     "授课行为",
            //     "班型区分",
            //     "押题不准"
            // ],
            // "业务咨询": [
            //     "解答错误",
            //     "基础知识",
            //     "找班主任",
            //     "找咨询师",
            //     "处理时效",
            //     "工作态度",
            //     "文明礼貌",
            //     "前端骚扰",
            //     "后端骚扰",
            //     "虚假话术",
            //     "过度承诺"
            // ],
            "留联系方式": [
                "留电话号码",
                "留微信号",
                "留QQ号",
                "建群"
            ],
            "刷广告": [
                "微商推广",
                "竞争机构推广",
                "无关广告"
            ],
            "平台测试": [
                "重复刷帖",
                "推广测试",
                "功能测试"
            ],
            "未明确原因": [
                "辱骂诋毁",
                "未明确原因"
            ]
        }
    }
});

var View = Backbone.View.extend({
    initialize: function(options) {
        let {isHide, showPostPurposeContainer, operateFlag, postMasterIds, postMasterId} = options;
        this.model = new Model();
        let isPostPurposeContainerHide;
        if(showPostPurposeContainer) {
            isPostPurposeContainerHide;
        } else {
            isPostPurposeContainerHide = 'hide';
        }
        this.model.set({isHide, isPostPurposeContainerHide, operateFlag, postMasterIds, postMasterId});
        this.render();
    },

    events: {
        'change #firstReason': 'handleFirstReasonChange'
    },

    handleFirstReasonChange() {
        let {hideReasonMap} = this.model.toJSON();
        let firstReason = $('#firstReason').val();
        // 板块帖子-table列表中-屏蔽弹窗-学员发帖动机（文本框的隐藏/显示）
        if(firstReason == '未明确原因') {
            $('#postPurposeContainer').removeClass('hide');
        } else {
            $('#postPurposeContainer').addClass('hide');
        }

        let rs = '';
        let secondReasonList = hideReasonMap[firstReason];
        secondReasonList && secondReasonList.forEach((item) => {
            rs += `<option value="${item}">${item}</option>`;
        });
        $('#secondReason').html(rs);

        $('#secondReason').bind('change', () => {
            let secondReason = $('#secondReason').val();
            if(secondReason && secondReason == '未明确原因') {
                $('#postPurposeContainer').removeClass('hide');
            } else if(secondReason && secondReason !== '未明确原因') {
                if(firstReason == '未明确原因') {
                    $('#postPurposeContainer').removeClass('hide'); 
                } else {
                    $('#postPurposeContainer').addClass('hide');
                }
            }
        })
    },

    getData() {
        let {isHide, operateFlag, postMasterIds, postMasterId} = this.model.toJSON();
        let postPurpose = $('#postPurpose').val();
        let postPurposeContainerHide = $("#postPurposeContainer").hasClass("hide");
        let postPurposeContainerShow = !(postPurposeContainerHide);
        let email = common.getUserInfo().userAccount;
        if (postPurposeContainerShow && !postPurpose) {
            alert('请输入发帖动机！');
            return;
        }
        if (postPurposeContainerShow && postPurpose.length > 500) {
            alert('发帖动机不可超过500字');
            return;
        }
        if (isHide) {
            //屏蔽帖子
            let firstReason = $('#firstReason').val();
            let secondReason = $('#secondReason').val();
            

            if (!firstReason || !secondReason) {
                alert('请选择屏蔽原因');
                return;
            }
            
            return {firstReason, secondReason, operateFlag, postPurpose, postMasterIds, postMasterId, email, isHide: 1};
        } else {
            //删除帖子
            return {postPurpose, operateFlag, postMasterIds, postMasterId, email, deleteFlag: 1}
        }
    },

    format(data) {
        let {hideReasonMap, isHide, isPostPurposeContainerHide} = data;
        let firstReasonList = [];
        let secondReasonList = [];
        for (let k in hideReasonMap) {
            firstReasonList.push(k);
            hideReasonMap[k].forEach((item, index) => {
                secondReasonList.push(item);
            })
        };
        return {firstReasonList, secondReasonList, isHide, isPostPurposeContainerHide}
    },

    render: function() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

var HidePostDialog = function(options) {
    let {postMasterIds, postMasterId, showPostPurposeContainer, operateFlag, isHide, title, reqUrl, onSuccess} = options;
    this.title = title;
    this.reqUrl = reqUrl;
    this.showPostPurposeContainer = showPostPurposeContainer;
    this.onSuccess = onSuccess;
    this.view = new View({isHide, showPostPurposeContainer, operateFlag, postMasterIds, postMasterId});
    this.show();
}

HidePostDialog.prototype.show = function() {
    let that = this;
    var d = new Dialog({
        title: that.title,
        content: that.view.el,
        type: 4,
        ok: function() {
            let data = that.view.getData();
            if (data) {
                service[that.reqUrl](data, $.proxy(function(response) {
                    if (response.rs) {//屏蔽成功
                        alert('操作成功');
                        if (typeof that.onSuccess === 'function') {
                            that.onSuccess();
                        }
                        this.closeDialog();
                    } else {
                        alert(response.rsdesp);
                    }
                }, this));
            }
        }
    })
}

export {HidePostDialog}