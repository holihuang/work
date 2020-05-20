import moment from 'moment';

import {envCfg} from '../../common/envCfg';
import {common} from '../../common/common';
import {service} from '../../common/service';
import {Table} from '../../components/table/index';
import {Pager} from '../../components/pager/index';
import {Dialog} from '../../components/dialog/index';
import tpl from './tpl.html';

const DATEPICKER_CFG = {
    format: 'yyyy-mm-dd',
    autoclose: true,
    todayBtn: true,
    minView: 'month',
    forceParse: true,
}

const Model = Backbone.Model.extend({
    defaults: {
        type: 'report',  //report || review （待审核举报||审核记录）
        searchParams: {
            reportedType: 1, //帖子
            createTime: moment().format('YYYY-MM-DD'),
            hasReview: 0, //帖子
        },
        resultList: null,
        pageNo: -1,
        pageSize: 25
    }
});

const PicReport = Backbone.View.extend({
    initialize(options) {
        const { type = 'report' } = options;
        this.model = new Model();
        this.model.set({ type });
        this.listenTo(this.model, 'change:resultList', this.renderTable);
        this.listenTo(this.model, 'change:pageNo', this.renderPager);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.render();
        //初始化时间选择器
        this.initDatepicker();
        //查询
        this.search();
    },

    events: {
        'change #reportedType': 'search',
        'change #hasReview': 'search',
        'change #createTime': 'search',
        'click .accept-btn': 'accept',
        'click .reject-btn': 'reject'
    },

    initDatepicker() {
        this.$el.find('#createTime').datetimepicker(DATEPICKER_CFG);
    },

    //查询
    search() {
        const params = common.getFormData({
            formId: 'searchForm'
        });

        let {searchParams} = this.model.toJSON();
        searchParams = Object.assign({}, searchParams, params);
        //存储查询条件
        this.model.set({
            searchParams,
            //重置页码，触发pager的重新render
            pageNo: -1
        });

        const {pageSize} = this.model.toJSON();
        this.getPageData({pageSize});
    },

    getPageData({pageNo = 1, pageSize = 25} = {}) {
        const {searchParams, type} = this.model.toJSON();
        const reqUrl = type === 'report' ? 'adminReportList' : 'adminReviewList';
        service[reqUrl]({
            ...searchParams,
            pageSize,
            pageNo
        }, (response) => {
            if (response.rs) {
                const {countPerPage: pageSize, pageIndex: pageNo, pageCount, totalCount, resultList} = response.resultMessage;
                this.model.set({
                    resultList,
                    pageNo,
                    pageSize,
                    pageCount
                });
            } else {
                alert(response.rsdesp);
            }
        })
    },

    accept(e) {
        const index = +$(e.currentTarget).attr('index');
        const {resultList} = this.model.toJSON();
        const {id} = resultList[index];
        if (confirm('确认举报属实并删除本条记录吗？')) {
            service.adminReview({
                id,
                hasReview: 1,
                reportedType: 1, //1为帖子，2为举报人；
            }, (response) => {
                if (response.rs) {
                    this.getPageData();
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    reject(e) {
        const index = +$(e.currentTarget).attr('index');
        const {resultList} = this.model.toJSON();
        const {id} = resultList[index];
        const that = this;

        new Dialog({
            title: '填写驳回理由',
            content: '<textarea id="rejectReason" rows="10" class="ipt-textarea w_100 p5"></textarea>',
            type: 4,
            ok: function() {
                const rejectReason = this.$el.find('#rejectReason').val().trim();
                if (!rejectReason) {
                    alert('请输入驳回理由');
                    return;
                }
                service.adminReview({
                    id,
                    rejectReason,
                    hasReview: 2,
                    reportedType: 1, //帖子
                }, (response) => {
                    if (response.rs) {
                        that.getPageData();
                        this.closeDialog();
                    } else {
                        alert(response.rsdesp);
                    }
                })
            }
        })
    },

    renderTable() {
        let columns = [
            {
                field: '被举报对象ID',
                content: (item) => {
                    const {reportedUserId} = item;
                    return `<a href="${envCfg.postBaseUrl}${reportedUserId}" target="_blank">${reportedUserId}</a>`
                },
                escapeHtml: false
            }, {
                field: '类型',
                content: (item) => {
                    const {reportedType} = item;
                    switch(reportedType) {
                        case 1:
                            return '帖子';
                        // case 2:
                        //     return '举报人';
                    }
                }
            }, {
                field: '举报人ID',
                content: 'userId'
                // content: (item) => {
                //     const {userId} = item;
                //     return `<a href="${envCfg.pcBBSBaseUrl}#userHome/${userId}" target="_blank">${userId}</a>`
                // },
                // escapeHtml: false
            }, {
                field: '举报理由',
                content: (item) => {
                    switch(item.reportedReason) {
                        case "1":
                            return '头像、资料作假';
                        case "2":
                            return '骚扰广告';
                        case "3":
                            return '诈骗/托';
                        case "4":
                            return '色情低俗';
                        case "5":
                            return '恶意骚扰';
                        case "6":
                            return '负面、违法信息';
                        case "7":
                            return '违法/政治敏感';
                        case "8":
                            return '其他';
                    }
                }
            }, {
                field: '发布时间',
                // content: 'releaseTime'
                content: (item) => {
                    return item.releaseTime.split(' ')[0].replace(/-/ig, '.');
                }
            }, {
                field: '举报时间',
                // content: 'createTime'
                content: (item) => {
                    return item.createTime.split(' ')[0].replace(/-/ig, '.');
                }
            }
        ];
        const {resultList, type} = this.model.toJSON();
        if (type === 'review') {
            columns.push({
                field: '审核结果',
                content: (item) => {
                    switch(item.hasReview) {
                        case 1:
                            return '<span class="blue">举报属实</span>'
                        case 2:
                            return '<span class="red">驳回举报</span>'                   
                    }
                },
                escapeHtml: false
            }, {
                field: '驳回理由',
                content: 'rejectReason'
            });
        } else {
            columns.push({
                field: '操作',
                content: (item, index) => {
                    return `
                        <span class="blue pointer accept-btn" index="${index}">举报属实</span><br/>
                        <span class="red pointer reject-btn" index="${index}">驳回举报</span>
                    `
                },
                escapeHtml: false
            })
        }
        this.table && this.table.destory && this.table.destory();
        this.table = new Table({
            el: this.$el.find('#tableContainer'),
            columns: columns,
            dataList: resultList
        });
    },

    renderPager() {
        const {pageSize, pageNo, pageCount} = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer'),
            pageSize,
            pageNo,
            pageCount,
            onChange: (options) => {
                const {pageSize, pageNo} = options;
                this.getPageData({pageSize, pageNo});
            }
        })
    },

    format(data) {
        const {type} = data;
        data.isReview = type === 'review';
        data.reportActiveClass = type === 'report' ? 'active' : '';
        data.reviewActiveClass = type === 'review' ? 'active' : '';
        data.createTime = moment().format('YYYY-MM-DD'); //举报事件默认显示当前日期
        return data;
    },

    render() {
        const data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

export { PicReport }
