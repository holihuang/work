import debounce from 'lodash/debounce';
import {service} from '../../../../common/service';
import {common} from '../../../../common/common';
import {chatInfoModelUtil} from '../../chatInfo';
import {Items} from './items/index';
import tpl from './tpl.html';

const PAGE_SIZE = 20

const TEACHER_MAP = {
    afterSaleTeacher: 1,
    teacher: 2,
    dutyteacher: 3,
}
let isSearchStudentListWithParams = false
var Model = Backbone.Model.extend({
    defaults: {
        pageNo: 1,
        isLoading: false,
        hasLoadedAllData: false,
        resultList: [],
        searchList: [],
        ts: 0
    }
});

var StudentsList = Backbone.View.extend({
    initialize: function(options) {
        const {send} = options;
        this.send = send;

        this.model = new Model();
        this.render();
        this.listenTo(this.model, 'change:resultList', this.renderStudentsList);
        this.listenTo(this.model, 'change:searchList', this.renderSearchList);
        this.listenTo(this.model, 'change:isLoading', this.handleLoadingStatusChange);
        this.listenTo(this.model, 'change:hasLoadedAllData', this.handleLoadedAllData);
        this.listenTo(chatInfoModelUtil.model, 'change:orderDetailId', this.renderStudentsList);
        this.listenTo(chatInfoModelUtil.model, 'change:orderDetailId', this.renderSearchList);
        this.getMyStudent();
    },

    events: {
        'click #searchStudentBtn': 'searchStudent',
        'keypress #searchStudentIpt': 'handleSearchEnter',
        // 'input #searchStudentIpt': 'handleSearchInput',
        'click .item': 'handleClickItem'
    },

    initScrollEvents() {
        const $studentsList = this.$el.find('#studentItemListContainer');
        const searchResultList = this.$el.find('#searchResultList');
        $studentsList.on('scroll', debounce(() => {
            const h = $studentsList.height();
            const height = $studentsList[0].scrollHeight;

            //获取滚动高度
            const scrollTop = $studentsList.scrollTop();

            if (scrollTop + h > height - 50) { //输入框，有个45px的padding-top
                this.getMyStudent();
            }
        }, 500));

        searchResultList.on('scroll', debounce(() => {
            const h = searchResultList.height();
            const height = searchResultList[0].scrollHeight;

            //获取滚动高度
            const scrollTop = searchResultList.scrollTop();

            if (scrollTop + h > height - 60) { //输入框，有个45px的padding-top
                // this.getMyStudent();
                this.searchStudent({
                    pageNo: this.model.get('pageNo') + 1,
                })
            }
        }, 500));
    },

    handleSearchInput() {
        const {ts} = this.model.toJSON();
        const now = Date.now();
        if (now - ts > 500) {
            this.searchStudent();
            this.model.set({
                ts: now
            })

            clearTimeout(this.timer);
        } else {
            this.timer = setTimeout(_ => {
                this.searchStudent();
                this.model.set({
                    ts: Date.now()
                });
            }, 500 - (now - ts))
        }
    },

    handleSearchEnter(e) {
        if (e.keyCode === 13) {
            this.searchStudent()
            return false;
        }
    },

    searchStudent(options = {}) {
        // 重置pageNo
        this.model.set({
            pageNo: options.pageNo || 1,
        })

        // console.log('enter search')
        //当搜索学员的时候隐藏列表
        const searchContent = this.$el.find('#searchStudentIpt').val().trim();

        if (searchContent) {
            this.$el.find('#studentItemListContainer').hide();
            this.$el.find('#searchResultList').show();
            //查询学员
            this.searchStudentList({
                cnt: searchContent,
                pageNo: 1,
                ...options,
            });
            isSearchStudentListWithParams = true
        } else {
            this.model.set({
                pageNo: 1,
                resultList: [],
                searchList: []
            })

            this.$el.find('#studentItemListContainer').show();
            this.$el.find('#searchResultList').empty().hide();
            isSearchStudentListWithParams = false

            this.getMyStudent()
        }
    },

    searchStudentList(opstions) {

        var userAccount = common.getUserInfo().userAccount;
        var params = {
            pageSize: PAGE_SIZE,
            pageNo: opstions.pageNo,
            searchContent: opstions.cnt,
            userAccount
        };

        params.type = TEACHER_MAP[chatInfoModelUtil.getRole()]

        service.getMyStudent(params, (response) => {
            const { resultList, pageIndex } = response.resultMessage

            let searchList = this.model.get('searchList') || []

            if (!resultList.length && this.$el.find('#searchEmpty').length === 0) {
                this.$el.find('#searchResultList').append(`
                    <div class="tac f12 gray6" id="searchEmpty">无结果~</div>
                `);
            }

            if (pageIndex === 1) {
                searchList = resultList
            } else {
                searchList = [
                    ...searchList,
                    ...resultList,
                ]
            }

            this.model.set({
                pageNo: pageIndex,
                searchList,
            })
        })
    },

    getMyStudent() {
        const {pageNo, isLoading, hasLoadedAllData} = this.model.toJSON();

        if (isLoading || hasLoadedAllData) {
            return;
        }

        this.model.set({
            isLoading: true
        });

        const params = {
            userAccount: common.getUserInfo().userAccount,
            pageSize: PAGE_SIZE,
            pageNo,
        }
        params.type = TEACHER_MAP[chatInfoModelUtil.getRole()]

        service.getMyStudent(params, (response) => {
            this.model.set({
                isLoading: false
            });

            if (response.rs) {
                const {pageNo, resultList} = this.model.toJSON();
                this.model.set({
                    resultList: [...resultList, ...response.resultMessage.resultList],
                    pageNo: pageNo + 1
                });

                if (!response.resultMessage.resultList.length) {
                    this.model.set({
                        hasLoadedAllData: true
                    })
                }
            } else {
                alert(response.rsdesp);
            }
        })
    },

    handleClickItem(e) {
        if ($(e.currentTarget).hasClass('current-checked-item')) {
            return;
        }

        const index = +$(e.currentTarget).attr('index');

        const {resultList, searchList} = this.model.toJSON();

        //是否是在搜索结果中选择的
        const {orderDetailId, imId: studentImId} = (this.$el.find('#searchStudentIpt').val().trim() || isSearchStudentListWithParams) ?
            searchList[index] : resultList[index];

        if (typeof this.send === 'function') {
            const teacherImId = +common.getUserInfo().imUserId;

            this.send({
                command: 'SET_ACTIVE_USER',
                data: {
                    orderDetailId,
                    studentImId,
                    teacherImId,
                    consultId: 0
                }
            }, _ => {
                chatInfoModelUtil.setActive(orderDetailId);
            });

            //默认展示聊天聚合页，所以要主动拉取聚合聊天记录
            // this.send({
            //     command: 'GET_HISTORY_MESSAGE_LIST',
            //     data: {
            //         orderDetailId,
            //         studentImId,
            //         teacherImId,
            //         messageId: 0,
            //         watchType: 2, //为2表示拉取所有记录
            //     }
            // })
        }
    },

    handleLoadingStatusChange() {
        const {isLoading} = this.model.toJSON();
        const $tip = this.$el.find('#tip');
        if (isLoading) {
            $tip.html('<div class="loading-list-items"></div>');
        } else {
            $tip.html('');
        }
    },

    handleLoadedAllData() {
        this.$el.find('#tip').html('<div class="tac p5 gray6">没有更多了~</div>');
    },

    //搜索结果部分渲染
    renderSearchList() {
        const {searchList} = this.model.toJSON();
        const orderDetailId = chatInfoModelUtil.getOrderDetailId();
        const items = new Items({
            studentList: searchList,
            orderDetailId
        });

        this.$el.find('#searchResultList').empty().append(items.$el);
    },

    renderStudentsList() {
        const {resultList} = this.model.toJSON();
        const orderDetailId = chatInfoModelUtil.getOrderDetailId();

        this.items && this.items.destroy();
        this.items = new Items({
            studentList: resultList,
            orderDetailId
        });

        this.$el.find('#studentItemList').empty().append(this.items.$el);
    },

    format(data) {
        return data;
    },

    render: function() {
        var data = this.model.toJSON();
        this.$el.html(tpl(data));
        this.initScrollEvents();
    }
})

export {StudentsList}
