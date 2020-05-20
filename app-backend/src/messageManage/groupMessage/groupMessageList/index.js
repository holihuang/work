import moment from 'moment';

import {service} from '../../../common/service';
import {global} from '../../../common/global';
import {envCfg} from '../../../common/envCfg';
import {Table} from '../../../components/table/index';
import {Pager} from '../../../components/pager/index';
import {common} from '../../../common/common';
import {Dialog} from '../../../components/dialog/index';
import {ExportDialog} from './exportDialog/index';
import {PopupDialog} from './popupDialog/index';
import {TYPES} from '../constants';

const DATEPICKER_CFG = {
    format: 'yyyy-mm-dd',
    autoclose: true,
    todayBtn: true,
    minView: 'month',
    forceParse: true,
}

const PAGE_SIZE = 10;

let tpl = require('./tpl.html');

let Model = Backbone.Model.extend({
    defaults: {
        showDownLoadBtn: false,
        searchParams: {
            messageSource: 0,
            keyWord: '',
            creater: ''  
        },
        resultList: [],
        pageSize: PAGE_SIZE,
        pageNo: 1,
        pageCount: 0 //初始默认总页数为0
    }
})

let GroupMessageList = Backbone.View.extend({
    initialize(options) {
        this.model = new Model();
        // this.listenTo(this.model, 'change:resultList', this.renderTable);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.render();
        const { userRole, userAccount } = window.userInfo;
        this.model.set({ userRole, creater: userAccount });
        this.listGroupBatch();
    },

    events: {
        'click #searchBtn': 'search',
        'click .delete': 'deleteGroupBatch',
        'click .notify-title': 'showNotifyDetailDialog',
        'click .people-num': 'showPeopleNumDialog',
        'click .update': 'configPopup',
        'click #downLoadBtn': 'downLoad',
        'click #publishStartTime': 'showStDatepicker',
        'click #publishEndTime': 'showEtDatepicker',
        'click #linkImport': 'linkToImport',
    },

    linkToImport() {

        if (global.permissions.IS_TEACHER_ROLE) {
            location.hash = '#groupMessage/import'
        } else {
            location.hash = '#groupMessage/importsys'
        }
    },

    showStDatepicker(e) {
        $(e.currentTarget).datetimepicker(DATEPICKER_CFG).datetimepicker('show');
    },

    showEtDatepicker(e) {
        $(e.currentTarget).datetimepicker(DATEPICKER_CFG).datetimepicker('show');
    },

    search() {
        let params = common.getFormData({formId: 'form'});
        this.model.set({pageCount: 0, searchParams: params});
        this.listGroupBatch();
    },

    downLoad: function() {
        const { userRole } = this.model.toJSON(); 
        let params = common.getFormData({formId: 'form'});
        Object.assign(params, {channelCode: 'CS_BACKGROUND', role: userRole});
        service.exportGroupBatchs(params, (response) => {
            if(!response.rs) {
                alert(response.rsdesp);
            }
        });
    },

    showNotifyDetailDialog(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        const {content, skipType, skipName} = resultList[index];

        //根据跳转类型做不同的动作
        if (global.permissions.IS_TEACHER_ROLE) {
            new Dialog({
                title: '消息详情',
                content: content
            })
        } else {
            switch(skipType) {
                case TYPES.DETAIL: //跳转到详情页
                    new Dialog({
                        title: '消息详情',
                        content: content
                    })
                    break;
                case TYPES.NO_PARAM: //APP内无参数跳转
                    alert('请在App端查看通知内容');
                    break;
                case TYPES.WITH_PARAM: //APP内有参数跳转
                    const {skipId} = resultList[index];
                    if (skipName === 'bbs_postdetail') {
                        window.open(`${envCfg.mBaseUrl}#post/${skipId}`);
                    } else {
                        alert('请在App端查看通知内容');
                    }
                    break;
                case TYPES.THIRD_PARTY: //第三方页面跳转
                    window.open(skipName);
                    break;
                case TYPES.MINI_PROGRAM://小程序
                    alert('请在App端或微信端查看通知内容');
                    break;
            }
        }
    },

    showPeopleNumDialog(e) {
        let index = +$(e.currentTarget).attr('index');
        let type = $(e.currentTarget).attr('type');
        let {resultList} = this.model.toJSON();
        let item = resultList[index];
        const appUnReadNumber = item.appArriveNumber - item.appReadNumber;
        const weixinUnReadNumber = item.weixinArriveNumber - item.weixinReadNumber;

        new ExportDialog({
            type,
            groupId: item.groupId,
            batchTypeId: item.batchTypeId,
            // totalNum: type === 'app' ? item.appNoticeNumber : item.weixinNoticeNumber,
            // arriveNum: type === 'app' ? item.appArriveNumber : item.weixinArriveNumber,
            // readNum: type === 'app' ? item.appReadNumber : item.weixinReadNumber,
            // fileSuccUrl: type === 'app' ? item.fileSuccUrl : ''
            appNoticeNumber: item.appNoticeNumber,
            appArriveNumber: item.appArriveNumber,
            appReadNumber: item.appReadNumber,
            appUnReadNumber,
            weixinNoticeNumber: item.weixinNoticeNumber,
            weixinArriveNumber: item.weixinArriveNumber,
            weixinReadNumber: item.skipType === 5 ? '--':item.weixinReadNumber,
            weixinUnReadNumber,
            messageSource: item.messageSource
        })
    },

    //获取群发消息列表
    listGroupBatch(options = {}) {
        let {pageSize = PAGE_SIZE, pageNo = 1} = options;

        let { searchParams, userRole, creater } = this.model.toJSON();

        service.listGroupBatch({
            pageSize,
            pageNo,
            creater,
            role: userRole,
            ...searchParams,
            messageSource: +searchParams.messageSource,
        }, (response) => {
            if (response.rs) {
                let {countPerPage, pageCount, pageIndex, totalCount, resultList} = response.resultMessage;
                this.model.set({
                    resultList,
                    pageCount,
                    pageNo: pageIndex,
                    pageSize: countPerPage,
                    totalCount
                });
                this.showOrHidePager();
                this.renderTable();
            } else {
                alert(response.rsdesp);
            }
        })
    },
    //pageCount==0 pager组件隐藏，pageCount有值pager组件显示
    showOrHidePager() {
        const pageCount = +this.model.get("pageCount");
        if(!pageCount) {
            this.$el.find('#pagerContainer').hide();
        } else {
            this.$el.find('#pagerContainer').show();
        }
    },

    deleteGroupBatch(e) {
        const HOUR_TIME = 60 * 60 * 1000;
        const TEN_MINUTES = 10 * 60 * 1000;
        let index = +$(e.currentTarget).attr('index');
        let {groupId, messagePublishTime} = this.model.get('resultList')[index];

        const isTeacherRole = global.permissions.IS_TEACHER_ROLE;
        if (isTeacherRole) {
            //距离发布时间1小时之内的消息，不可以删除
            if (moment(messagePublishTime).valueOf() - moment().valueOf() < HOUR_TIME) {
                alert('此消息不可删除');
                return;
            }
        } else {
            //系统通知，10分钟之内
            if (moment(messagePublishTime).valueOf() - moment().valueOf() < TEN_MINUTES) {
                alert('此消息不可删除');
                return;
            }
        }

        if (confirm('确认删除此群发消息吗？删除后不可更改')) {
            service.deleteGroupBatch({
                groupId
            }, (response) => {
                if (response.rs) {
                    alert('删除成功！');
                    //删除成功后刷新列表
                    let {pageSize, pageNo} = this.model.toJSON();
                    this.listGroupBatch({
                        pageSize,
                        pageNo
                    });
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    //配置弹窗
    configPopup(e) {
        let index = +$(e.currentTarget).attr('index');

        let {resultList} = this.model.toJSON();
        let {popupId, skipId, fileId, groupId, title, messagePublishTime} = resultList[index];

        new PopupDialog({
            popupId,
            skipId,
            fileId,
            groupId,
            title,
            messagePublishTime,
            callback: () => {
                let {pageSize, pageNo} = this.model.toJSON();
                this.listGroupBatch({
                    pageSize,
                    pageNo
                });
            }
        })
    },

    filterCreaterSuffix: function(list) {
        list.forEach((item, index) => {
            item.creater = item.creater.split('@')[0];
        })
        return list;
    },

    renderTable() {
        let {resultList} = this.model.toJSON();
        //过滤掉创建人的"@sunlands.com"后缀
        resultList = this.filterCreaterSuffix(resultList);
        this.table = new Table({
            columns: [
                {
                    field: '消息标题',
                    escapeHtml: false,
                    content: (item, index) => {
                        return `<span class="orange notify-title" index="${index}">${item.title}</span>`
                    }
                }, {
                    field: '跳转页面',
                    content: (item) => {
                        if(item.skipType === 1 || item.skipType === 2){
                            return 'App页';
                        }else if(item.skipType === 3){
                            return '第三方H5';
                        }else if(item.skipType === 4){
                            return '详情页';
                        }else{
                            return '小程序页';
                        }
                    }
                }, {
                    field: '消息渠道',
                    content: (item) => {
                        // return item.messageSource ? 'APP/微信' : 'APP';
                        return {
                            0: 'APP',
                            1: 'APP/微信',
                            2: '微信',
                        }[item.messageSource] || ''
                    }
                },{
                    field: '通知对象',
                    // content: (item) => {
                    //     const {} = item;
                    //     return fileSuccUrl.replace(/\S+\/(\S+).xls/, '$1');
                    // }
                    content: 'userObject'
                }, {
                    field: '创建人',
                    content: 'creater'
                }, {
                    field: '创建时间',
                    content: 'createTime'
                }, {
                    field: '消息发布时间',
                    content: 'messagePublishTime'
                }, {
                    field: '渠道：<span class="pink w40">已读人数/</span><span class="blue w40">到达人数/</span><span class="w40">总人数</span>',
                    escapeField: false,
                    escapeHtml: false,
                    content: (item, index) => {
                        let rs = ''
                        switch (+item.messageSource) {
                            case 0:
                                rs = `
                                    <p class="people-num" index="${index}" type="app">app：
                                        <span class="pink w40 tac">${item.appReadNumber}</span>
                                        <span class="blue w40 tac">${item.appArriveNumber}</span>
                                        <span class="w40 tac">${item.appNoticeNumber}</span>
                                    </p>`;
                                break
                            case 1:
                                rs = `
                                    <p class="people-num" index="${index}" type="app">app：
                                        <span class="pink w40 tac">${item.appReadNumber}</span>
                                        <span class="blue w40 tac">${item.appArriveNumber}</span>
                                        <span class="w40 tac">${item.appNoticeNumber}</span>
                                    </p>
                                    <p class="people-num" index="${index}" type="wx">微信：
                                        <span class="pink w40 tac">${item.skipType === 5 ? '--':item.weixinReadNumber}</span>
                                        <span class="blue w40 tac">${item.weixinArriveNumber}</span>
                                        <span class="w40 tac">${item.weixinNoticeNumber}</span>
                                    </p>
                                    `
                                break
                            case 2:
                                rs = `
                                    <p class="people-num" index="${index}" type="wx">微信：
                                        <span class="pink w40 tac">${item.skipType === 5 ? '--':item.weixinReadNumber}</span>
                                        <span class="blue w40 tac">${item.weixinArriveNumber}</span>
                                        <span class="w40 tac">${item.weixinNoticeNumber}</span>
                                    </p>
                                    `
                                break
                            default:
                                break                           
                        }

                        // let rs = `
                        //     <p class="people-num" index="${index}" type="app">app：
                        //         <span class="pink w40 tac">${item.appReadNumber}</span>
                        //         <span class="blue w40 tac">${item.appArriveNumber}</span>
                        //         <span class="w40 tac">${item.appNoticeNumber}</span>
                        //     </p>`;

                        // rs += item.messageSource ? `
                        //     <p class="people-num" index="${index}" type="wx">微信：
                        //         <span class="pink w40 tac">${item.skipType === 5 ? '--':item.weixinReadNumber}</span>
                        //         <span class="blue w40 tac">${item.weixinArriveNumber}</span>
                        //         <span class="w40 tac">${item.weixinNoticeNumber}</span>
                        //     </p>
                        // ` : '';
                       
                       return rs;
                    }
                }, {
                    field: '弹窗状态',
                    content: (item) => {
                        switch(item.status) {
                            case 0:
                                return '展示结束';
                            case 1:
                                return '展示中';
                            case 2:
                                return '即将展示';
                            case 3:
                                return '无弹窗';
                            default:
                                return;
                        }
                    }
                }, {
                    field: '操作',
                    escapeHtml: false,
                    content: (item, index) => {
                        let rs = '';

                        if (global.permissions.CONFIG_POP) {
                            if (+item.messageSource === 2) {
                                rs += `
                                    <span class="" style="color: gray; margin-right: 8px; padding-right: 8px; border-right: 1px solid gray">配置APP弹窗</span>
                                `
                            } else {
                                rs += `
                                    <span class="orange update" index="${index}">配置APP弹窗</span>
                                `
                            }
                        }

                        // rs += global.permissions.CONFIG_POP ? `
                        //     <span class="orange update" index="${index}">配置APP弹窗</span>
                        // ` : '';

                        rs += global.permissions.DELETE_GROUP_BATCH ? `
                            <span class="orange delete" index="${index}">删除</span>
                        ` : '';

                        // 配置 '院长删除本人发的系统通知' 权限
                        if(window.userInfo.userRole == 'SCH_DEAN') {
                            if(!(global.permissions.DELETE_GROUP_BATCH)) {
                                if(item.creater == window.userInfo.userAccount.split('@')[0]) {
                                    rs += `<span class="orange delete" index="${index}">删除</span>`;
                                }
                            }
                        }

                        return rs;
                    }
                }
            ],
            dataList: resultList
        })

        this.$el.find('#tableContainer').html(this.table.$el);
    },

    renderPager() {
        let {pageCount, pageSize, pageNo, totalCount} = this.model.toJSON();
        //每次重新查询时，为了保证触发分页的重新渲染，会先将pageCount置为0
        if (pageCount) {
            this.pager && this.pager.undelegateEvents();
            this.pager = new Pager({
                el: this.$el.find('#pagerContainer'),
                pageCount,
                pageSize,
                pageNo,
                totalCount,
                showCountTip: true,
                onChange: this.listGroupBatch.bind(this),
                optionsList: [
                    {
                        value: 10,
                        optionsChecked: '',
                        valueText: '10'
                    },
                    {
                        value: 25,
                        optionsChecked: '',
                        valueText: '25'
                    },
                    {
                        value: 50,
                        optionsChecked: '',
                        valueText: '50'
                    },
                    {
                        value: 100,
                        optionsChecked: '',
                        valueText: '100'
                    }
                ]
            })
        }
    },

    format(data) {
        data.canUploadNotifyFile = global.permissions.UPLOAD_NOTIFY_FILE;
        
        //判断角色是否是"SOP"或"DEV"
        const {userRole} = window.userInfo;
        let showDownLoadBtn = false;
        let arr = userRole.split(',');
        
        for(let i = 0; i < arr.length; i++) {
            if(arr[i] == "DEV" || arr[i] == "SOP") {
                showDownLoadBtn = true;
                break;
            } 
        }

        return Object.assign(data, {showDownLoadBtn});
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {GroupMessageList}
