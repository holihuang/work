import {service} from '../../../common/service';
import {Table} from '../../../components/table/index';
import {Pager} from '../../../components/pager/index';
import {CfgOptDialog} from '../cfgOptDialog/index';
import {MultiSelectDialog} from './multiSelectDialog/index';
import {SubContent} from './subContent/index';
import cfg from '../cfg'
import tpl from './tpl.html';

const PAGE_SIZE = 25;

const stateList = [
    {
        value: 0,
        text: '审核失败'
    }, {
        value: 1,
        text: '待审核'
    }, {
        value: 2,
        text: '等待上线'
    }, {
        value: 3,
        text: '上线展示'
    }, {
        value: 4,
        text: '已下线'
    }
]

const Model = Backbone.Model.extend({
    defaults: {
        infoType: 1,  //类型，1-首页banner；2-app开屏；3-首页弹窗
        resultList: [],
        corpsSearchParams: [],
        collegeSearchParams: [],
    }
});

const Opt = Backbone.View.extend({
    initialize(options = {}) {
        const {infoType} = options;

        this.model = new Model({
            corpsSearchParams: [],
            collegeSearchParams: [],
        });

        infoType && this.model.set({infoType});

        this.listenTo(this.model, 'change:resultList', this.renderResultList);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.render();
        this.getOptList();
    },

    events: {
        'click #collegeTab': 'goToCollegePage',
        'click #contentTab': 'goToCotentPage',
        'click #addNewBtn': 'add',
        'click #showCorpsPanelBtn': 'showCorpsPanel',
        'click #showCollegePanelBtn': 'showCollegePanel',
        'click #searchBtn': 'search',
        'click #clearBtn': 'clear',
        'click .look-into': 'lookInto',
    },

    goToCollegePage() {
        const {infoType} = this.model.toJSON();
        location.hash = `#opt/${infoType}/2`;
    },

    goToCotentPage() {
        const {infoType} = this.model.toJSON();
        location.hash = `#opt/${infoType}/1`;
    },

    getOptList(params = {}) {
        const {infoType, collegeSearchParams, corpsSearchParams} = this.model.toJSON();

        const {pageSize = PAGE_SIZE, pageNo = 1} = params;
        service.adminGetOptListByCollege({
            infoType,
            pageSize,
            pageNo,
            collegeList: collegeSearchParams,
            corpsList: corpsSearchParams,
        }, (response) => {
            if (response.rs) {
                const {countPerPage, pageIndex, pageCount, totalCount, resultList} = response.resultMessage;

                this.model.set({
                    pageSize: countPerPage,
                    pageNo: pageIndex,
                    resultList,
                    pageCount,
                })

                $(window).scrollTop(0);
            } else {
                alert(response.rsdesp);
            }
        })
    },

    add() {
        const {infoType} = this.model.toJSON();
        new CfgOptDialog({
            infoType,
            callback: () => {
                const {pageSize, pageNo} = this.model.toJSON();
                this.getOptList({
                    pageSize,
                    pageNo
                });
            }
        });
    },

    showCorpsPanel() {
        const {corpsSearchParams} = this.model.toJSON();
        new MultiSelectDialog({
            title: '请选择军团',
            reqUrl: 'listAllCorps',
            name: 'corpsName',
            key: 'corpsName',
            checkedList: corpsSearchParams,
            callback: (checkedList) => {
                this.model.set({
                    corpsSearchParams: checkedList
                })
                this.setSearchPanel();
            }
        });
    },

    showCollegePanel() {
        const {collegeSearchParams} = this.model.toJSON();
        new MultiSelectDialog({
            title: '请选择学院',
            reqUrl: 'listAllCollege',
            name: '.',
            key: '.',
            checkedList: collegeSearchParams,
            callback: (checkedList) => {
                this.model.set({
                    collegeSearchParams: checkedList
                })
                this.setSearchPanel();
            }
        })
    },

    setSearchPanel() {
        const {collegeSearchParams, corpsSearchParams} = this.model.toJSON();
        this.$el.find('#searchParamsPanel').html(`
            ${collegeSearchParams.join(',')}<br/>${corpsSearchParams.join(',')}
        `)
    },

    search() {
        this.getOptList();
    },

    clear() {
        this.model.set({
            collegeSearchParams: [],
            corpsSearchParams: []
        });
        this.setSearchPanel();
    },

    lookInto(e) {
        const index = +$(e.currentTarget).attr('index');
        const {resultList, infoType} = this.model.toJSON();
        const {college, businessUnit, family, corps} = resultList[index];

        this.$el.find('#parentContentContainer').hide();
        this.$el.find('#subContentContainer').show();

        new SubContent({
            el: this.$el.find('#subContentContainer')[0],
            firstProject: college || businessUnit,
            secondProject: family || corps,
            isCollege: college,
            isBusiness: businessUnit,
            onBack: () => {
                this.$el.find('#parentContentContainer').show();
                this.$el.find('#subContentContainer').hide();
            },
            infoType,
            stateList,
        });
    },

    renderResultList() {
        const {resultList} = this.model.toJSON();
        this.collegeTable && this.collegeTable.destroy();
        this.collegeTable = new Table({
            columns: [
                {
                    field: '一级部门',
                    content: item => item.college || item.businessUnit
                }, {
                    field: '二级部门',
                    content: (item) => {
                        return item.family || item.corps;
                    }
                }, {
                    field: '在线内容数',
                    content: 'onlineCount'
                }, {
                    field: '等待上线数',
                    content: 'checkedCount'
                }, {
                    field: '操作',
                    escapeHtml: false,
                    content: (item, index) => {
                        return `
                            <span class="look-into orange" index="${index}">查看</span>
                        `
                    }
                }
            ],
            dataList: resultList
        })

        this.$el.find('#tableContainer').html(this.collegeTable.$el);
    },

    renderPager() {
        const {pageSize, pageNo, pageCount} = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer')[0],
            pageSize,
            pageNo,
            pageCount,
            onChange: (options) => {
                this.getOptList(options);
            }
        });
    },

    format(data) {
        const {infoType, listType} = data;
        //switch(+infoType) {
        //    case 1:
        //        data.title = '首页banner管理';
        //        break;
        //    case 2:
        //        data.title = 'APP开屏管理';
        //        break;
        //    case 3:
        //        data.title = '首页弹窗管理';
        //        break;
        //    default:
        //        break;
        //}
        data.title = cfg['title'][infoType]

        switch(+listType) {
            case 1:
                //受众部门
                data.byCollege = true;
                data.collegeTabActiveClass = 'active';
                break;
            case 2:
                //内容
                data.byContent = true;
                data.contentTabActiveClass = 'active';
                break;
        }

        data.stateList = [
            {
                text: '请选择内容状态',
                value: ''
            }
        ].concat(stateList);

        return data;
    },

    render() {
        const data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Opt}
