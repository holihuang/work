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

const Answers = Backbone.View.extend({
    initialize(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change:resultList', this.renderTable);
        this.listenTo(this.model, 'change:totalCount', this.renderPager);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.render();
        this.query();
    },

    events: {
        'click #gotoQuestions': 'gotoQuestions',
        'click #searchBtn': 'query',
        'click .content': 'showQuestionDetail',
        'click .delete': 'delete',
        'click .my-hide': 'hide',
        'click .cancel-delete': 'cancelDelete',
        'click .cancel-hide': 'cancelHide',
        'click #batchDeleteBtn': 'batchDelete',
        'click #batchHideBtn': 'batchHide',
        'click #batchRecoverDeleteBtn': 'batchRecoverDelete',
        'click #batchRecoverHideBtn': 'batchRecoverHide',
        'click .cancel-set-hot': 'setOrCancelHot',
        'click .set-hot': 'setOrCancelHot'
    },

    setOrCancelHot(e) {
        const operateType = $(e.currentTarget).hasClass('set-hot') ? 1 : 2;
        const index = +$(e.currentTarget).attr('index');
        const {resultList} = this.model.toJSON();
        const {answerId, questionId} = resultList[index];
        const params = {
            userAccount: common.getUserInfo().userAccount,
            operateType,
            answerId,
            questionId
        };
        const tipText = operateType == 1 ?'确定将该回答设为最热？' : '确定将该回答取消最热？';
        if(confirm(`${tipText}`)) {
            service.adminSetHotAnswer(params, (response) => {
                if(response.rs) {
                    alert('操作成功');
                    this.refresh();
                } else {
                    alert(response.rsdesp);
                }
            });
        }
        
    },

    gotoQuestions() {
        location.hash = '#questions';
    },

    query() {
        //首先将totalCount重置，确保pager会重新render
        this.model.set({
            totalCount: -1,
            pageNo: 1, //点击查询时从第一页开始
        });

        const {pageSize, pageNo} = this.model.toJSON();
        this.getAnswerList({
            pageSize,
            pageNo
        });
    },

    getAnswerList({pageSize, pageNo}) {
        const searchParams = this.search.getSearchParams();
        if (!searchParams) {
            return;
        }
        service.adminAnswerList({
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
    },

    showQuestionDetail(e) {
        const index = +$(e.currentTarget).attr('index');
        const {resultList} = this.model.toJSON();
        const {questionId, answerId} = resultList[index];

        this.questionDetail && this.questionDetail.undelegateEvents();
        this.questionDetail = new Detail({
            questionId,
            answerId,
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

        const answerIdList = checkedItemsIndex.map(item => resultList[item].answerId);

        if (!answerIdList.length) {
            alert('请选择要删除的回答！');
            return;
        }

        //判断是否状态都统一
        for (let i = 0, len = checkedItemsIndex.length; i < len; i++) {
            if (resultList[checkedItemsIndex[i]].deleteFlag) {
                alert('选中的问题中包含已被删除的回答，请重新选择');
                return;
            }
        }

        if (confirm('确定要删除选中的回答吗？')) {
            this.updateAnswerState(answerIdList, 2);
        }
    },

    batchHide() {
        const checkedItemsIndex = this.table && this.table.getCheckedItemsIndex();
        const {resultList} = this.model.toJSON();

        const answerIdList = checkedItemsIndex.map(item => resultList[item].answerId);

        if (!answerIdList.length) {
            alert('请选择要屏蔽的回答！');
            return;
        }

        //判断是否状态都统一
        for (let i = 0, len = checkedItemsIndex.length; i < len; i++) {
            if (resultList[checkedItemsIndex[i]].isHide) {
                alert('选中的问题中包含已被屏蔽的回答，请重新选择');
                return;
            }
            if (resultList[checkedItemsIndex[i]].deleteFlag) {
                alert('选中的问题中包含已被删除的问题，不能被屏蔽，请重新选择');
                return;
            }
        }

        if (confirm('确定要屏蔽选中的回答吗？')) {
            this.updateAnswerState(answerIdList, 1);
        }
    },

    batchRecoverDelete() {
        const checkedItemsIndex = this.table && this.table.getCheckedItemsIndex();
        const {resultList} = this.model.toJSON();

        const answerIdList = checkedItemsIndex.map(item => resultList[item].answerId);

        if (!answerIdList.length) {
            alert('请选择要取消删除的回答！');
            return;
        }

        //判断是否状态都统一
        for (let i = 0, len = checkedItemsIndex.length; i < len; i++) {
            if (!resultList[checkedItemsIndex[i]].deleteFlag) {
                alert('选中的问题中包含未被删除的回答，请重新选择');
                return;
            }
        }

        if (confirm('确定要恢复删除选中的回答吗？')) {
            this.updateAnswerState(answerIdList, 3);
        }
    },

    batchRecoverHide() {
        const checkedItemsIndex = this.table && this.table.getCheckedItemsIndex();
        const {resultList} = this.model.toJSON();

        const answerIdList = checkedItemsIndex.map(item => resultList[item].answerId);

        if (!answerIdList.length) {
            alert('请选择要取消屏蔽的回答！');
            return;
        }

        //判断是否状态都统一
        for (let i = 0, len = checkedItemsIndex.length; i < len; i++) {
            if (!resultList[checkedItemsIndex[i]].isHide) {
                alert('选中的问题中包含未被屏蔽的回答，请重新选择');
                return;
            }
        }

        if (confirm('确定要恢复屏蔽选中的回答吗？')) {
            this.updateAnswerState(answerIdList, 0);
        }
    },

    //单个操作
    delete(e) {
        if (confirm('确认要删除该回答吗？')) {
            const index = +$(e.currentTarget).attr('index');
            const {resultList} = this.model.toJSON();
            const {answerId} = resultList[index];

            this.updateAnswerState([answerId], 2);
        }
    },

    hide(e) {
        if (confirm('确认要屏蔽该回答吗？')) {
            const index = +$(e.currentTarget).attr('index');
            const {resultList} = this.model.toJSON();
            const {answerId} = resultList[index];

            this.updateAnswerState([answerId], 1);
        }
    },

    cancelHide(e) {
        if (confirm('确定要恢复屏蔽该回答吗？')) {
            const index = +$(e.currentTarget).attr('index');
            const {resultList} = this.model.toJSON();
            const {answerId} = resultList[index];

            this.updateAnswerState([answerId], 0);
        }
    },

    cancelDelete(e) {
        if (confirm('确定要恢复删除该回答吗？')) {
            const index = +$(e.currentTarget).attr('index');
            const {resultList} = this.model.toJSON();
            const {answerId} = resultList[index];

            this.updateAnswerState([answerId], 3);
        }
    },

    updateAnswerState(answerIdList, operateType) {
        service.adminUpdateAnswerState({
            answerIdList,
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
        this.getAnswerList({
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
                    field: '回答编号',
                    content: 'answerId'
                }, {
                    field: '问题编号',
                    content: 'questionId'
                }, {
                    field: '回答内容',
                    escapeHtml: false,
                    content: (item, index) => {
                        let answerContent = item.answerContent.length > 25 ? item.answerContent.substr(0, 25) + '...' : item.answerContent;
                        return `<a href="javascript:void(0)" index=${index} class="content">${answerContent}</a>`;
                    }
                }, {
                    field: '赏金回答',
                    content: item => item.isPaid ? '是' : '否'
                }, {
                    field: '回答人昵称',
                    content: 'userNickname'
                }, 
                // 隐藏手机
                // {
                //     field: '回答人手机',
                //     content: 'userMobile'
                // },
                 {
                    field: '回答人ID',
                    content: 'userId'
                }, {
                    field: '问题归属部门',
                    content: item => item.family || item.corps
                }, {
                    field: '回答时间',
                    content: 'createTime'
                }, {
                    field: '被赞数量',
                    content: 'praiseCount'
                }, {
                    field: '当前状态',
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
                    field: '操作',
                    escapeHtml: false,
                    content: (item, index) => {
                        const {isHide, deleteFlag, isHot} = item;
                        let hideStr, deleteStr, setHotStr = '';
                        if (isHide) {
                            hideStr = `<span class="orange cancel-hide" index="${index}">恢复屏蔽</span>`;
                        } else {
                            //已删除的不可以再屏蔽
                            hideStr = deleteFlag ? '' : `<span class="orange my-hide" index="${index}">屏蔽</span>`;
                        }

                        if (deleteFlag) {
                            deleteStr = `<span class="orange cancel-delete" index="${index}">恢复删除</span>`;
                        } else {
                            deleteStr = `<span class="orange delete" index="${index}">删除</span>`;
                        }

                        if(isHot) {
                            //状态"正常"才可"取消最热"操作
                            isHide == 0 && !deleteFlag && (setHotStr = `<span class="orange cancel-set-hot" index="${index}">取消最热</span>`);
                        } else {
                            //状态"正常"才可"设为最热"操作
                            isHide == 0 && !deleteFlag && (setHotStr = `<span class="orange set-hot" index="${index}">设为最热</span>`);
                        }

                        return `
                            ${hideStr}${deleteStr}${setHotStr}
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
                this.getAnswerList(options);
            }
        })
    },

    render() {
        this.$el.html(tpl());
        this.search = new Search({type: 2});
        this.$el.find('#searchPanel').append(this.search.$el);
    }
});

export {Answers}

