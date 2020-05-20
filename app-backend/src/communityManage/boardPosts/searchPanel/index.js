import moment from 'moment'
import {common} from '../../../common/common';
import {service} from '../../../common/service';
import {Select} from '../../../components/select/index';
require('datepicker/js/bootstrap-datetimepicker');

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        postStateList: [
            {
                value: 1,
                text: "已删除"
            },
            {
                value: 2,
                text: "人工屏蔽"
            },
            {
                value: 5,
                text: "系统屏蔽"
            },
            {
                value: 6,
                text: "待审核"
            }
        ],
        albumParentId: '',
        albumChildId: '',
        hideReasonList: [
            "退学相关",
            // "课程相关",
            // "业务咨询",
            // "技术相关",
            // "学术交流",
            "留联系方式",
            "刷广告",
            "平台测试",
            "未明确原因"
        ],
        currentTime: moment().format()
    }
});

const PAGE_SIZE = 800;

var SearchPanel = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        var {postType} = options;
        this.model.set({postType});
        this.render();
        this.listenTo(this.model, 'change', this.render);
        this.getAlbumInfo();
        this.getSensitiveWords();
        this.bindEvents();
    },

    events: {
        'change #albumParentId': 'handleParentIdChange',
        'click #startTime': 'initStartTime',
        'click #endTime': 'initEndTime',
        'click #operateStartTime': "initStartTime",
        'click #operateEndTime': "initEndTime",
        'input #nickname': 'showNicknames',
        'click .nickname-item': 'chooseAName',
        'click #clearStartTime': 'clearIptTime',
        'click #clearEndTime': 'clearIptTime',
        'click #clearBeginTime': 'clearIptTime',
        'click #clearFinishTime': 'clearIptTime',
        // 'click #nickname': 'initNicknameEvent',
        'click #iptPostMasterId': 'checkNumber',
        'click #iptMobile': 'checkNumber',
        //'click .postStateShieldOrDelete': 'changeState',

        'change #minPraiseCount': 'checkNotNegativeNumber',
        'change #maxPraiseCount': 'checkNotNegativeNumber',
        'change #minReplyCount': 'checkNotNegativeNumber',
        'change #maxReplyCount': 'checkNotNegativeNumber',
        'change #type': 'handleTypeChange'
    },

    //数字输入绑定事件
    bindEvents() {
        let inputNumberList = ['#minPraiseCount', '#maxPraiseCount', '#minReplyCount', '#maxReplyCount'];

        inputNumberList.forEach((item) => {
            this.$el.on('keydown', item, (e) => {
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                    // Allow: Ctrl+A
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                    // Allow: Ctrl+C
                    (e.keyCode == 67 && e.ctrlKey === true) ||
                    // Allow: Ctrl+X
                    (e.keyCode == 88 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                        // let it happen, don't do anything
                        return;
                }

                let keyCodeList = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
                                       96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
                let len = $(item).val().length;
                if ($.inArray(e.keyCode, keyCodeList) == -1 || (len == 9)) {
                    e.preventDefault();
                }
            })
        })
    },

    //状态帖子-change
    changeState() {
        let state_val = this.$el.find(".postStateShieldOrDelete").find("option:selected").val();
        if(parseInt(state_val) == 2) {
            this.$el.find("#masterSensitiveWord").attr("disabled", true);
            this.$el.find("#firstReason").attr("disabled", false);
        } else {
            this.$el.find("#masterSensitiveWord").attr("disabled", false);
            if(parseInt(state_val) == 5) {
                this.$el.find("#firstReason").attr("disabled", true);
            } else {
                this.$el.find("#firstReason").attr("disabled", false);
            }
        }
    },

    //校验点赞数（评论数）不为负值
    checkNotNegativeNumber() {
        let minPC = this.$el.find('#minPraiseCount');
        let maxPC = this.$el.find('#maxPraiseCount');
        let minRC = this.$el.find('#minReplyCount');
        let maxRC = this.$el.find('#maxReplyCount');

        if(minPC.val() || maxPC.val() || minRC.val() || maxRC.val()) {
            if(minPC.val() < 0 || maxPC.val() < 0 || minRC.val() < 0 || maxRC.val() < 0) {
                alert("点赞数/评论数不能为负数！");
                minPC.val("");
                maxPC.val("");
                minRC.val("");
                maxRC.val("");
            }
        }

    },

    checkNumber() {
        if (!this.hasSetPostId) {
            $('#iptPostMasterId').on('input', function() {
                var val = $(this).val();
                if (val && !Number(val)) {
                    alert('请输入数字');
                    $(this).val('');
                }
            });
            $('#iptPostMasterId').on('paste', function(e) {
                setTimeout(function() {
                    var val = $('#iptPostMasterId').val();
                    if (val && !Number(val)) {
                        alert('请输入数字');
                        $(this).val('');
                        return;
                    }
                    $('#iptPostMasterId').val(val.trim());
                }, 100);
            })

            this.hasSetPostId = true;
        }

        if (!this.hasSetMobile) {
            $('#iptMobile').on('input', function() {
                var val = $(this).val();
                if (val && !Number(val)) {
                    alert('请输入正确的手机号！');
                    $(this).val('');
                }
            })
            $('#iptMobile').on('paste', function() {
                setTimeout(function() {
                    var val = $('#iptMobile').val();
                    if (val && !Number(val)) {
                        alert('请输入正确的手机号！');
                        $(this).val('');
                        return;
                    }
                    $('#iptMobile').val(val.trim());
                })
            })

            this.hasSetMobile = true;
        }
    },

    showNicknames() {
        let nickname = encodeURIComponent($('#nickname').val());
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

                    //判断是否和当前输入的内容一致
                    if ($('#nickname').val() === decodeURIComponent(nickname)) {
                        this.$el.find('#nicknameList').html(str);
                    }
                }
            })
        } else {
            $('#nicknameList').html('');
            $('#userId').val('');
        }
    },

    chooseAName(e) {
        let userId = $(e.currentTarget).attr('userid');
        let userNickName = $(e.currentTarget).attr('name');
        $('#nickname').val(userNickName);
        $('#userId').val(userId);
        this.correctUserName = userNickName;
        $('#nicknameList').html('');
        e.preventDefault();
        return false;
    },

    // bindEvents() {
    //     let correctUserName = this.correctUserName;
    //     let $nickname = this.$el.find('#nickname');
    //     $('body').on('click', function() {
    //         $('#nicknameList').html('');
    //     })
    // },

    initStartTime(e) {
        let selector;
        if($(e.currentTarget).attr("id") == 'operateStartTime') {
            selector = $("#operateStartTime");
        } else if($(e.currentTarget).attr("id") == 'startTime') {
            selector = $("#startTime");
        }
        selector.datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            todayBtn: true,
            minView: 'month'
        });

        selector.datetimepicker('show');
    },

    initEndTime(e) {
        let selector;
        if($(e.currentTarget).attr("id") == 'operateEndTime') {
            selector = $("#operateEndTime");
        } else if($(e.currentTarget).attr("id") == 'endTime') {
            selector = $("#endTime");
        }
        selector.datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            todayBtn: true,
            minView: 'month'
        });

        selector.datetimepicker('show');
    },

    clearIptTime(e) {
        let selector;
        if($(e.currentTarget).attr("id") == "clearStartTime") {
            selector = $("#startTime");
        } else if($(e.currentTarget).attr("id") == "clearEndTime") {
            selector = $("#endTime");
        } else if($(e.currentTarget).attr("id") == "clearBeginTime") {
            selector = $("#operateStartTime");
        } else if($(e.currentTarget).attr("id") == "clearFinishTime") {
            selector = $("#operateEndTime");
        }
        selector.val('');
    },

    // initNicknameEvent() {
    //     if (!this.hasBindBlurEvent) {
    //         this.bindEvents();
    //         this.hasBindBlurEvent = true;
    //     }
    // },

    handleParentIdChange: function() {
        var albumParentId = $('#albumParentId').val();

        this.model.set({albumParentId});  //设定当前选择的父版面id
    },

    getAlbumInfo() {

        var userAccount = common.getUserInfo().userAccount;

        var params = {
            pageSize: PAGE_SIZE,
            pageNo: 1,
            userAccount
        };

        var that = this;

        service.showAllParentAlbums(params, (response) => {
            if (response.rs) {
                that.model.set({parentAlbumList: response.resultMessage.resultList});
                service.showAllChildAlbums(params, function(response) {
                    if (response.rs) {
                        that.model.set({allChildAlbumList: response.resultMessage.resultList});
                    } else {
                        alert('获取版面信息失败，请刷新重试！');
                    }
                })
            } else {
                alert('获取版面信息失败，请刷新重试！');
            }
        })
    },

    handleTypeChange(e) {
        const selectedType = this.$el.find('#type option:selected').val();

        switch(selectedType) {
            case 'nickname':
                this.$el.find('.type-row #formGroupNickName').removeClass('hide-important');
                this.$el.find('.type-row #formGroupIptMobile').addClass('hide-important');
                this.$el.find('.type-row #formGroupUserId').addClass('hide-important');
                this.$el.find('#nickname').val('');
                break;
            case 'userId':
                this.$el.find('.type-row #formGroupUserId').removeClass('hide-important');
                this.$el.find('.type-row #formGroupIptMobile').addClass('hide-important');
                this.$el.find('.type-row #formGroupNickName').addClass('hide-important');
                this.$el.find('#userId').val('');
                break;
            case 'phoneNumber':
                this.$el.find('.type-row #formGroupIptMobile').removeClass('hide-important');
                this.$el.find('.type-row #formGroupUserId').addClass('hide-important');
                this.$el.find('.type-row #formGroupNickName').addClass('hide-important');
                this.$el.find('#iptMobile').val('');
                break;
            default:
                break;
        }

    },

    getSensitiveWords() {
        const that = this;
        service.getAllSensitiveWord({}, (response) => {
            if (response.rs) {
                let {resultMessage} = response;
                let sensitiveWordList = resultMessage;
                that.model.set({
                    sensitiveWordList
                });
                that.renderSensitiveSelect(sensitiveWordList);
            } else {
                alert('获取敏感词列表失败！');
            }
        });
    },

    //敏感词-Select
    renderSensitiveSelect: function(sensitiveWordList, id) {
        const sensitiveWordObjList = this.arrToObjArr(sensitiveWordList);
        this.sensitiveSelect && this.sensitiveSelect.undelegateEvents();
        this.sensitiveSelect = new Select({
            el: this.$el.find(id)[0],
            itemList: sensitiveWordObjList,
            name: 'sensitiveWord',
            selectedItemsText: "敏感词",
            canSearch: true
        })
    },

    arrToObjArr: function(list) {
        const arr = [];
        list.forEach((item, index) => {
            arr.push({
                value: index,
                text: item
            })
        })
        return arr;
    },

    //检测postState中的值
    checkIsIn: function(arr, val) {
        let l = arr.length;
        for(let i=0; i<l; i++) {
            if(arr[i] == val) {
                return true;
            }
        }
        return false;
    },

    //帖子状态-Select
    renderPostStateSelect: function(postStateList, id) {
        let {postType} = this.model.toJSON();
        this.postStateSelect && this.postStateSelect.undelegateEvents();
        this.postStateSelect = new Select({
            el: this.$el.find(id)[0],
            itemList: postStateList,
            name: 'postState',
            selectedItemsText: "帖子状态",
            onChangeState: (postState) => {
                let arr = postState.split(",");
                let l = arr.length;
                if(postType == 0) {
                    this.$el.find("#masterSensitiveWord").find(".selectedItemsText").attr("disabled", false);
                    this.$el.find("#firstReason").attr("disabled", false);
                    if (this.checkIsIn(arr, 2)) {
                        this.$el.find("#masterSensitiveWord").find(".selectedItemsText").attr("disabled", true);
                    } else {
                        this.$el.find("#masterSensitiveWord").find(".selectedItemsText").attr("disabled", false);
                    }
                    if(this.checkIsIn(arr, 5)) {
                        this.$el.find("#firstReason").attr("disabled", true);
                    } else {
                        this.$el.find("#firstReason").attr("disabled", false);
                    }
                } else if(postType == 3) {
                    this.$el.find("#replySensitiveWord").find(".selectedItemsText").attr("disabled", false);
                    if(this.checkIsIn(arr, 2)) {
                        this.$el.find("#replySensitiveWord").find(".selectedItemsText").attr("disabled", true);
                    }

                }

            }
        });
    },


    format(data) {
        var {postType, albumParentId, albumParentId, parentAlbumList, allChildAlbumList, sensitiveWordList, postStateList, hideReasonList} = data;
        var childAlbumList = albumParentId ? (allChildAlbumList && allChildAlbumList.filter(item => item.albumParentId == albumParentId)) : allChildAlbumList;
        parentAlbumList && parentAlbumList.forEach(item => {
            item.checked = item.albumId == albumParentId ? 'selected' : '';
        });

        let thirdParamName, thirdParamText, isMaster, isUnnormal, isDelOrShieldReply, startTimeText, endTimeText;
        if (postType == "1" || postType == "0") {
            //主帖
            thirdParamName = "postSubject";
            thirdParamText = "标题";
            isMaster = true;
            startTimeText= "发帖开始时间";
            endTimeText = "发帖结束时间";
            if (postType == "0") {
                isUnnormal = true;
            }
        } else if (postType == "2" || postType == "3") {
            //回帖
            thirdParamName = "content";
            thirdParamText = "回帖内容";
            startTimeText= "回帖开始时间";
            endTimeText = "回帖结束时间";
            isMaster = false;
            if(postType == "3") {
                isDelOrShieldReply = true;
            }
        }

        //研发和QC可以导出数据
        let userRole = common.getUserInfo().userRole.toLowerCase();
        let canDownload = false;
        if (userRole.indexOf('dev') != -1 || userRole.indexOf('qc') != -1) {
            canDownload = true;
        }

        const startTime = moment(data.currentTime).subtract(6, 'days').format('YYYY-MM-DD')
        const endTime = moment(data.currentTime).format('YYYY-MM-DD')

        return {postType, parentAlbumList, childAlbumList, thirdParamName, thirdParamText, isMaster, isUnnormal, isDelOrShieldReply,

                startTimeText, endTimeText, canDownload, sensitiveWordList, postStateList, hideReasonList, startTime, endTime};
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
        let {postType, sensitiveWordList, postStateList} = data;
        if(+postType == 0) {
            if (sensitiveWordList) {
                this.renderSensitiveSelect(sensitiveWordList, "#masterSensitiveWord");
            }
            if(postStateList) {
                this.renderPostStateSelect(postStateList, "#masterPostState");
            }
        } else if(+postType == 3) {
            if (sensitiveWordList) {
                this.renderSensitiveSelect(sensitiveWordList, "#replySensitiveWord");
            }
            if(postStateList) {
                this.renderPostStateSelect(postStateList, "#replyPostState");
            }
        }
        //回帖tab下，查询表单中的状态下拉框中"发帖人"替换成"回帖人"
        if(postType == 2 || postType == 3) {
            this.$el.find("#type option:first").text("回帖人Id");
        }
    }
})

export {SearchPanel}
