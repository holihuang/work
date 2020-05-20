/*
 * @Last Modified by:   litingwei 
 * @Last Modified time: 2018-10-10 17:13:31 
 */
import React from 'react'
import ReactDom from 'react-dom'
import {service} from '../../../common/service';
import {global} from '../../../common/global';
import {common} from '../../../common/common';
import {Emotion} from './emotion/index';
import {EmotionBox} from '../../../common/emotionUtil';
import {AppPage} from '../../../components/appPage/index';
import 'datepicker/js/bootstrap-datetimepicker';
import teacherTpl from './teacherTpl.html';
import systemTpl from './systemTpl.html';
import {TYPES} from '../constants';

import { Dialog } from '../../../components/dialog/index'

import Message from './reactMessage/message'

const SKIP_TYPE_LIST = [
    {
        value: 'detail',
        name: '详情页',
        checked: 'checked'
    },
    {
        value: 'apppage',
        name: 'App页面',
        checked: '',
    },
    {
        value: 'thirdparty',
        name: '第三方页面',
        checked: ''
    }
]

const MESSAGE_TYPE_LIST = [
    // {
    //     value: 1,
    //     name: '学习提醒（包括报考通知）'
    // },
    {
        value: 2,
        name: '活动通知'
    },
    {
        value: 3,
        name: '系统通知'
    }
];

let editorSeq = 0;

let Model = Backbone.Model.extend({
    defaults: {
        fileId: 0,
    }
});

let Publish = Backbone.View.extend({
    initialize(options) {
        let {fileId, sendUserType} = options;

        this.model = new Model();
        this._title = ''

        this.model.set({
            fileId,
            sendUserType,
        });
        this.listenTo(this.model, 'change', this.render);
        this.getFileDetail();
    },

    events: {
        'click #publishTimeIpt': 'showDatePicker',
        'click #publishBtn': 'publish',
        'click #previewBtn': 'preview',
        // 'click #toggleEmotionBoxBtn': 'toggleEmotionBox',
        'click .emotion-list li': 'insertEmotion',
        'click [name="skipTypeDesc"]': 'handleClickSkipType',
        'click #uploadPicBtn': 'uploadPic',
        'click .icon-close-full-fix': 'hidePreviewer',

        'keyup #msgTitle': 'titleKeyUp',
        'click .matches': 'insertMatches',
        'click .import-question-mark': 'showTipsModal',
    },

    showTipsModal() {
        const content = this.model.get('sendUserType') === 1
            ? '<img src="images/publish-unfree-tips.png" style="max-width: 500px" />'
            : '<img src="images/publish-free-tips.png" style="max-width: 500px" />'
        const qaModal = new Dialog({
            title: '各类通配符使用说明',
            content,
        })
    },

    // 插入通配符
    insertMatches(e) {
        const domId = $(e.target).attr('data-value')
        const btnText = $(e.target).text()

        if (domId === 'msgTitle') {
            const inputNode = this.$el.find(`#${domId}`)
            const selectionStart = inputNode[0].selectionStart

            let newTitle = ''
            if (selectionStart) {
                newTitle = this._title.substring(0, selectionStart)
                    + '{' + btnText + '}'
                    + this._title.substring(selectionStart)
            } else {
                newTitle = this._title + '{' + $(e.target).text() + '}'
            }

            inputNode.val(newTitle)

            this._title = newTitle
        }

        if (domId === 'editor') {
            this.um.um.focus()
            this.um.um.execCommand('inserthtml', '{' + btnText + '}');

            this.um._content = this.um.um.getContent().replace(/\<br\/\>/g, '<br>')
        }
    },

    // 监听对于通配符进行消除
    titleKeyUp(e) {
        const keyCode = e.keyCode
        const that = this
        let newContent = $(e.target).val()

        if ([8, 46].indexOf(keyCode) > -1 && that._title.length - newContent.length) {
            let start = -1
            let end = -1
            let cnt = ''
            for (let i = 0; i < that._title.length; i++) {
                // 被删除的内容为大括号
                if (
                    that._title[i] !== newContent[i]
                    && start === -1
                ) {
                    // 只记录第一次变更
                    cnt = that._title[i]
                    start = i
                }
            }

            if ('{' === cnt) {
                for (let i = start; i < that._title.length; i++) {
                    if (that._title[i] === '}' && end === -1) {
                        end = i
                    }
                    // 如果找到}之前，先找到了{，那不做任何特殊操作
                    if (newContent[i] === '{' && end === -1) {
                        end = -2
                    }
                }
                if ([-1, -2].indexOf(end) === -1) {
                    newContent = newContent.substring(0, start) + newContent.substring(end)
                    $(e.target).val(newContent)
                }
            }

            if ('}' === cnt) {
                for (let i = start; i >= 0; i--) {
                    if (that._title[i] === '{' && end === -1) {
                        end = i
                    }

                    // 如果找到}之前，先找到了{，那不做任何特殊操作
                    if (newContent[i] === '}' && end === -1) {
                        end = -2
                    }
                }
                if ([-1, -2].indexOf(end) === -1) {
                    newContent = newContent.substring(0, end) + newContent.substring(start)
                    $(e.target).val(newContent)
                }
            }
        }

        that._title = newContent
    },

    uploadPic(e) {
        common.picUploaderNew(response => {
            let text;

            if (response.rs) {
                text = '更新';
                const {linkUrl, height, width} = response.resultMessage[0];

                if (height * 3 != width) {
                    //需符合3:1的比例
                    alert('请上传3:1的图片');
                    $(e.currentTarget).removeClass('disabled').html('上传');
                    return;
                }

                this.$el.find('#imgHolder').html(`
                    <img src="${linkUrl}" class="w_100 h_100">
                `)
                this.$el.find('#previewImageUrl').val(linkUrl);
            } else {
                text = '上传';
            }

            $(e.currentTarget).removeClass('disabled').html(text);
        }, ({size}) => {
            const MAX_SIZE = 2 * 1024 * 1024; //2M
            if (size > MAX_SIZE) {
                alert('图片上传不能大于2M');
                return false;
            }
            $(e.currentTarget).addClass('disabled').html('正在上传...');
        })
    },

    showDatePicker(e) {
        $(e.currentTarget).datetimepicker({
            format: 'yyyy-mm-dd hh:ii:00',
            autoclose: true,
            todayBtn: true,
            minView: 'hour'
        });

        $(e.currentTarget).datetimepicker('show');
    },

    //当选择的跳转方式变化时，页面显示元素变化
    handleClickSkipType(e) {
        const skipType = $(e.currentTarget).val();
        const $detailContainer = this.$el.find('#detailContainer');
        const $appPageContainer = this.$el.find('#appPageContainer');
        const $thirdpartyUrlContainer = this.$el.find('#thirdpartyUrlContainer');
        const $previewBtn = this.$el.find('#previewBtn');

        switch (skipType) {
            case 'detail': //详情页
                $detailContainer.show();
                $appPageContainer.hide();
                $thirdpartyUrlContainer.hide();
                $previewBtn.show();
                break;
            case 'apppage': //app页面
                $detailContainer.hide();
                $appPageContainer.show();
                $thirdpartyUrlContainer.hide();
                $previewBtn.hide();
                break;
            case 'thirdparty': //第三方页面
                $detailContainer.hide();
                $appPageContainer.hide();
                $thirdpartyUrlContainer.show();
                $previewBtn.hide();
                break;
        }
    },

    publish() {
        const {fileId, succCount, sendUserType} = this.model.toJSON();

        if (!succCount) {
            alert('导入成功人数为0，不能发布通知！');
            return;
        }

        const ifNeedSendWx = this.$el.find('[name="ifNeedSendWx"]').prop('checked') ? 1 : 0;
        const content = this.um.getContent();
        const plainText = this.um.getContentTxt();
        const createrName = common.getUserInfo().userNickname || common.getUserInfo().userAccount.split('@')[0];

        const isTeacherRole = global.permissions.IS_TEACHER_ROLE;

        if (isTeacherRole) {
            //如果是班主任, 需要校验消息内容
            if (!content) {
                alert('请填写消息内容！');
            }

            if (confirm('确认发布消息吗？消息发布后不可撤回！')) {
                const reqParams = {
                    fileId,
                    succCount,
                    content,
                    plainText,
                    createrName,
                    ifNeedSendWx,
                }

                service.addTeacherGroupBatch(reqParams, (response) => {
                    if (response.rs) {
                        alert('发布消息成功！');
                        window.location.hash = '#groupMessage';
                    } else {
                        alert(response.rsdesp);
                    }
                })
            }
        } else {
            //非班主任
            const params = common.getFormData({
                formId: 'systemMessageForm'
            });

            for (let k in params) {
                params[k] = decodeURIComponent(params[k]);
            }

            params.ifNeedSendWx = ifNeedSendWx;
            params.succCount = succCount;

            //必填校验
            const requestParams = {
                title: {
                    requested: true,
                    // maxlength: 20, // 长度校验交给rd维护
                    errorMsg: {
                        requested: '请填写标题',
                        // maxlength: '标题不可超过20字'
                    }
                },
                messagePublishTime: '请选择发布时间！',
                messageTypeId: '请选择消息类型！',
                // batchAbstract: {
                //     requested: true,
                //     maxlength: 30,
                //     errorMsg: {
                //         requested: '请填写消息简介',
                //         maxlength: '消息简介不可超过30字'
                //     }
                // }
            }

            //params里的值都是encode之后的，为了对长度进行校验，需要decode来判断
            for (let k in requestParams) {
                if (typeof requestParams[k] === 'object') {
                    for (let request in requestParams[k]) {
                        switch(request) {
                            case 'requested':
                                if (!params[k]) {
                                    alert(requestParams[k].errorMsg.requested);
                                    return;
                                }
                            break;
                            case 'maxlength':
                                if (params[k].length > requestParams[k][request]) {
                                    alert(requestParams[k].errorMsg.maxlength);
                                    return;
                                }
                            break;
                            case 'errorMsg':
                            break;
                        }
                    }
                } else {
                    if (!params[k]) {
                        alert(requestParams[k]);
                        return;
                    }
                }
            }

            //跳转类型
            const {skipTypeDesc} = params;
            switch(skipTypeDesc) {
                case 'detail': //跳转到详情页
                    params.skipType = TYPES.DETAIL;

                    //需要对内容进行判断
                    if (!plainText) {
                        alert('请填写消息内容！');
                        return;
                    }
                    // 字数上限的校验，交给rd维护
                    // if (plainText.length > 2000) {
                    //     alert('最多允许输入2000字符！');
                    //     return;
                    // }

                    params.content = content.replace(/\.\/images\//g, `${location.origin}/community-mgr-war/images/`)
                    params.plainText = plainText.substr(0, 100);

                    delete params.editorValue;

                    break;
                case 'apppage':
                    const appPageInfo = this.appPage.getData();

                    const {pageKey, isHaveParam} = appPageInfo;
                    params.skipName = pageKey;

                    if (isHaveParam) {
                        params.skipType = TYPES.WITH_PARAM; //有参数跳转
                        const {skipId} = appPageInfo;
                        if (!skipId) {
                            alert('请填写要跳转app页面的id');
                            return;
                        }
                        params.skipId = skipId;
                    } else {
                        params.skipType = TYPES.NO_PARAM; //无参数跳转
                    }
                    break;
                case 'thirdparty': //跳转到第三方页面
                    params.skipType = TYPES.THIRD_PARTY;
                    params.skipName = params.thirdpartyUrl;
                    break;
            }

            // 新增对通配符的校验 - 注释掉，相关校验交于rd维护
            // if (!this.validateMatcher(params.title)) {
            //     alert('标题中包含非法的通配符，请检查后重新提交')
            //     return
            // }

            // if (!this.validateMatcher(this.um.um.getContentTxt())) {
            //     alert('正文中包含非法的通配符，请检查后重新提交')
            //     return
            // }

            //校验通过 
            if (confirm('确认发布消息吗？消息发布后不可撤回！')) {
                if (sendUserType !== undefined) {
                    params.sendUserType = sendUserType
                }
                service.addGroupBatch({
                        ...params,
                        createrName: common.getUserInfo().userNickname,
                    }, (response) => {
                        if (response.rs) {
                            alert('发布消息成功！');
                            window.location.hash = '#groupMessage';
                        } else {
                            alert(response.rsdesp);
                        }
                    })
            }
        }
    },

    // 暂时注释掉，相关校验交于rd维护
    // validateMatcher(source = '') {
    //     let start = -1
    //     let end = -1

    //     let rst = true

    //     for (let i = 0; i < source.length; i++) {
    //         if (source[i] === '{') {
    //             if (start !== -1) {
    //                 rst = false
    //             }

    //             start === -1 && (start = i)
    //         }

    //         if (source[i] === '}') {
    //             if (start === -1) {
    //                 rst = false
    //             } else {
    //                 end = i

    //                 const regValue = source.substring(start + 1, end)

    //                 if (['用户姓名', '缺勤次数', '入学天数', '休眠天数', '报考地域'].indexOf(regValue) === -1) {
    //                     rst = false
    //                     // 重置
    //                     end = -1
    //                     start = -1
    //                 }
    //             }
    //         }
    //     }

    //     return rst
    // },

    preview() {
        // const title = this.$el.find('[name="title"]').val().trim();
        const title = 354651
        if (!title) {
            alert('标题不能为空');
            return;
        }
        // const content = this.um.getContent();
        const content = 132132
        if (!content) {
            alert('内容不能为空');
            return;
        }

        this.$el.find('#previewer').show();

        this.frame = this.$el.find("iframe")[0];
        this.frame.contentWindow.initPage(title, content);
    },

    hidePreviewer() {
        this.$el.find('#previewer').hide();
        this.frame.contentWindow.clearPage();
    },

    toggleEmotionBox() {
        if (!this.emotionBox) {
            this.emotionBox = new EmotionBox({
                el: this.$el.find('#emotionBoxContainer')[0]
            });
        }

        this.$el.find('#emotionBoxContainer').toggleClass('hide');
    },

    insertEmotion(e) {
        const emotion = $(e.currentTarget).attr('emotion');
        this.um.insertEmotion(emotion);

        this.toggleEmotionBox();
    },

    getFileDetail() {
        const {fileId} = this.model.toJSON();
        const getFileDetailAction = global.permissions.IS_TEACHER_ROLE ? 'getGroupMessageFileDetail' : 'getFileDetail';

        service[getFileDetailAction]({
            fileId
        }, (response) => {
            if (response.rs) {
                this.model.set({...response.resultMessage});
            } else {
                alert(response.rsdesp);
            }
        })
    },

    format(data) {
        data.canSetPublishTime = global.permissions.SET_PUBLISH_TIME ? 1 : 0;
        data.showMsgTitleSubjectOpt = global.permissions.IS_TEACHER_ROLE ? 0 : 1;

        data.isTeacher = global.permissions.IS_TEACHER_ROLE;
        // 1为付费用户，可以选择更多通配符
        data.showMoreMatches = data.sendUserType === 1

        return data;
    },

    // destroy() {
    //     this.um.destroy();
    // },

    initMessageReact() {
        const that = this
        // 页面加载直接渲染leftNav react 组件
        const props = {
            ...this.model.toJSON(), // 获取model中的所有数据
        }
        ReactDom.render(
            <Message 
                {...props} 
            />,
            document.getElementById('reactContainer'),
        )
    },
    render() {
        editorSeq++;
        let data = this.format(this.model.toJSON());
        if (data.isTeacher) {
            this.$el.html(teacherTpl({
                ...data,
                editorSeq
            }))
        } else {
            // console.log(this)
            this.$el.html(systemTpl({
                ...data,
                editorSeq,
                messageTypeList: MESSAGE_TYPE_LIST,
                skipTypeList: SKIP_TYPE_LIST,
                weixinEntry: global.permissions['WEI_XIN_REMINDER']
            }));
            // this.appPage = new AppPage({
            //     reqUrl: 'getAllSkipPage'
            // });
            // this.$el.find('#selectContainer').html(this.appPage.$el);
            this.initMessageReact()
        }
        
    }
})

export {Publish}
