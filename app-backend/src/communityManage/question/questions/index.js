import {Table} from '../../../components/table/index';
import {Pager} from '../../../components/pager/index';
import {service} from '../../../common/service';
import {common} from '../../../common/common';
import {Search} from '../components/search/index';
import {Detail} from '../components/detail/index';
import tpl from './tpl.html';

const PAGE_SIZE = 25;

const Model = Backbone.Model.extend({
    defaults: {
        resultList: [], //问题列表
        totalCount: -1, //结果总条数
        pageSize: PAGE_SIZE,
        pageNo: 1,
    }
})

const Questions = Backbone.View.extend({
    initialize(options) {
        let {questionId} = options;
        this.model = new Model();
        this.listenTo(this.model, 'change:resultList', this.renderTable);
        this.listenTo(this.model, 'change:totalCount', this.renderPager);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.render();
        this.query();
        if (questionId) {
            this.model.set({questionId});
            this.showQuestionDetail();
        }
    },

    events: {
        'click #goToAnswers': 'goToAnswers',
        'click #searchBtn': 'query',
        'click .content': 'showQuestionDetail',
        'click .answer': 'showQuestionDetail',
        'click .delete': 'delete',
        'click .my-hide': 'hide',
        'click .cancel-delete': 'cancelDelete',
        'click .cancel-hide': 'cancelHide',
        'click #batchDeleteBtn': 'batchDelete',
        'click #batchHideBtn': 'batchHide',
        'click #batchRecoverDeleteBtn': 'batchRecoverDelete',
        'click #batchRecoverHideBtn': 'batchRecoverHide',
    },

    goToAnswers() {
        location.hash = '#answers';
    },

    query() {
        //首先将totalCount重置，确保pager会重新render
        this.model.set({
            totalCount: -1,
            pageNo: 1, //点击查询时从第一页开始查询
        });

        const {pageSize, pageNo} = this.model.toJSON();
        this.getQuestionList({
            pageSize,
            pageNo
        });
    },

    getQuestionList({pageSize, pageNo}) {
        const searchParams = this.search.getSearchParams();
        if (searchParams) {
            service.adminQuestionList({
                userAccount: common.getUserInfo().userAccount,
                pageSize,
                pageNo,
                ...searchParams
            }, (response) => {
                if (response.rs) {
                    const {resultList, countPerPage: pageSize, pageIndex: pageNo, pageCount, totalCount} = response.resultMessage;
                    this.model.set({
                        resultList,
                        pageSize,
                        pageNo,
                        pageCount,
                        totalCount,
                    });
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    showQuestionDetail(e) {
        let questionId;
        if (e) {
            const index = +$(e.currentTarget).attr('index');
            const {resultList} = this.model.toJSON();
            questionId = resultList[index].questionId;
        } else {
            questionId = this.model.get('questionId');
        }

        this.questionDetail && this.questionDetail.undelegateEvents();
        this.questionDetail = new Detail({
            questionId,
            // isAnswer,
            onBack: () => {
                this.$el.find('#detailContainer').hide();
                this.$el.find('#parentContentContainer').show();
                this.refresh();
            }
        });
        this.$el.find('#detailContainer').html(this.questionDetail.$el).show();

        this.$el.find('#parentContentContainer').hide();
    },

    //批量操作
    batchDelete() {
        const checkedItemsIndex = this.table && this.table.getCheckedItemsIndex();
        const {resultList} = this.model.toJSON();

        const questionIdList = checkedItemsIndex.map(item => resultList[item].questionId);

        if (!questionIdList.length) {
            alert('请选择要删除的问题！');
            return;
        }

        //判断是否状态都统一
        for (let i = 0, len = checkedItemsIndex.length; i < len; i++) {
            if (resultList[checkedItemsIndex[i]].deleteFlag) {
                alert('选中的问题中包含已被删除的问题，请重新选择');
                return;
            }
        }

        if (confirm('确定要删除选中的问题吗？')) {
            this.updateQuestionState(questionIdList, 2);
        }
    },

    batchHide() {
        const checkedItemsIndex = this.table && this.table.getCheckedItemsIndex();
        const {resultList} = this.model.toJSON();

        const questionIdList = checkedItemsIndex.map(item => resultList[item].questionId);

        if (!questionIdList.length) {
            alert('请选择要屏蔽的问题！');
            return;
        }

        //判断是否状态都统一
        for (let i = 0, len = checkedItemsIndex.length; i < len; i++) {
            if (resultList[checkedItemsIndex[i]].isHide) {
                alert('选中的问题中包含已被屏蔽的问题，请重新选择');
                return;
            }
            if (resultList[checkedItemsIndex[i]].deleteFlag) {
                alert('选中的问题中包含已被删除的问题，不能被屏蔽，请重新选择');
                return;
            }
        }

        if (confirm('确定要屏蔽选中的问题吗？')) {
            this.updateQuestionState(questionIdList, 1);
        }
    },

    batchRecoverDelete() {
        const checkedItemsIndex = this.table && this.table.getCheckedItemsIndex();
        const {resultList} = this.model.toJSON();

        const questionIdList = checkedItemsIndex.map(item => resultList[item].questionId);

        if (!questionIdList.length) {
            alert('请选择要取消删除的问题！');
            return;
        }

        //判断是否状态都统一
        for (let i = 0, len = checkedItemsIndex.length; i < len; i++) {
            if (!resultList[checkedItemsIndex[i]].deleteFlag) {
                alert('选中的问题中包含未被删除的问题，请重新选择');
                return;
            }
        }

        if (confirm('确定要恢复删除选中的问题吗？')) {
            this.updateQuestionState(questionIdList, 3);
        }
    },

    batchRecoverHide() {
        const checkedItemsIndex = this.table && this.table.getCheckedItemsIndex();
        const {resultList} = this.model.toJSON();

        const questionIdList = checkedItemsIndex.map(item => resultList[item].questionId);

        if (!questionIdList.length) {
            alert('请选择要恢复屏蔽的问题！');
            return;
        }

        //判断是否状态都统一
        for (let i = 0, len = checkedItemsIndex.length; i < len; i++) {
            if (!resultList[checkedItemsIndex[i]].isHide) {
                alert('选中的问题中包含未被屏蔽的问题，请重新选择');
                return;
            }
        }

        if (confirm('确定要恢复屏蔽选中的问题吗？')) {
            this.updateQuestionState(questionIdList, 0);
        }
    },

    //单个操作
    delete(e) {
        if (confirm('确定要删除该问题吗？')) {
            const index = +$(e.currentTarget).attr('index');
            const {resultList} = this.model.toJSON();
            const {questionId} = resultList[index];

            this.updateQuestionState([questionId], 2);
        }
    },

    hide(e) {
        if (confirm('确定要屏蔽该问题吗？')) {
            const index = +$(e.currentTarget).attr('index');
            const {resultList} = this.model.toJSON();
            const {questionId} = resultList[index];

            this.updateQuestionState([questionId], 1);
        }
    },

    cancelHide(e) {
        if (confirm('确定要恢复屏蔽该问题吗？')) {
            const index = +$(e.currentTarget).attr('index');
            const {resultList} = this.model.toJSON();
            const {questionId} = resultList[index];

            this.updateQuestionState([questionId], 0);
        }
    },

    cancelDelete(e) {
        if (confirm('确定要恢复删除该问题吗？')) {
            const index = +$(e.currentTarget).attr('index');
            const {resultList} = this.model.toJSON();
            const {questionId} = resultList[index];

            this.updateQuestionState([questionId], 3);
        }
    },

    updateQuestionState(questionIdList, operateType) {
        service.adminUpdateQuestionState({
            questionIdList,
            operateType
        }, (response) => {
            if (response.rs) {
                alert('操作成功！');
                this.refresh();
            } else {
                alert(response.rsdesp);
            }
        })
    },

    //刷新列表
    refresh() {
        const {pageSize, pageNo} = this.model.toJSON();
        this.getQuestionList({
            pageSize,
            pageNo
        });
    },

    renderTable() {
        const {resultList} = this.model.toJSON();
        this.table && this.table.destroy();
        this.table = new Table({
            columns: [
                {
                    field: '问题编号',
                    content: 'questionId',
                }, {
                    field: '问题内容',
                    escapeHtml: false,
                    content: (item, index) => {
                        let content = item.content.length > 25 ? item.content.substr(0, 25) + '...' : item.content;
                        return `<a href="javascript:void(0)" index=${index} class="content">${content}</a>`;
                    }
                }, {
                    field: '问题归属部门',
                    content: item => item.corps || item.family
                }, {
                    field: '赏金',
                    content: 'scores'
                }, {
                    field: '提问人昵称',
                    content: 'userNickname'
                }, 
                // 隐藏手机
                // {
                //     field: '提问人手机号',
                //     content: 'userMobile'
                // },
                 {
                    field: '提问人ID',
                    content: 'userId'
                }, {
                    field: '问题归属人',
                    content: item => item.questionOwnerList.join(',')
                }, {
                    field: '提问时间',
                    content: 'createTime'
                }, {
                    field: '问题状态',
                    content: item => {
                        let rs = [];
                        const {isHide, deleteFlag} = item;
                        if (isHide) {
                            rs.push('已屏蔽');
                        }
                        if (deleteFlag) {
                            rs.push('已删除');
                        }

                        if (rs.length) {
                            return rs.join('|');
                        } else {
                            return '正常';
                        }
                    }
                }, {
                    field: '回答数量',
                    content: 'answerCount'
                }, {
                    field: '操作',
                    escapeHtml: false,
                    content: (item, index) => {
                        const {isAnswer, isHide, deleteFlag} = item;
                        let answerStr, hideStr, deleteStr;

                        answerStr = (isAnswer || isHide || deleteFlag) ? '' : `<span class="orange answer" index="${index}">回答</span>`;

                        if (isHide) {
                            hideStr = `<span class="orange cancel-hide" index="${index}">恢复屏蔽</span>`;
                        } else {
                            //已屏蔽和已删除的不可以再屏蔽
                            hideStr = (deleteFlag || isHide) ? '' : `<span class="orange my-hide" index="${index}">屏蔽</span>`;
                        }

                        if (deleteFlag) {
                            deleteStr = `<span class="orange cancel-delete" index="${index}">恢复删除</span>`;
                        } else {
                            deleteStr = `<span class="orange delete" index="${index}">删除</span>`;
                        }

                        return `
                            ${answerStr}${hideStr}${deleteStr}
                        `
                    }
                },
            ],
            dataList: resultList,
            showCheckBox: true,
        })

        this.$el.find('#tableContainer').html(this.table.$el);
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
                this.getQuestionList(options);
            }
        })
    },

    render() {
        this.$el.html(tpl());
        this.search = new Search({type: 1});
        this.$el.find('#searchPanel').append(this.search.$el);
    }
});

export {Questions}
