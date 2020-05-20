import {service} from '../../../../common/service';
import {common} from '../../../../common/common';
import {Pager} from '../../../../components/pager/index';
import {ContentItems} from '../../contentItems/index';
import tpl from './tpl.html';

const PAGE_SIZE = 25;

const datepickerCfg = {
    format: 'yyyy-mm-dd hh:ii:00',
    autoclose: true,
    todayBtn: true,
}

const Model = Backbone.Model.extend({
    defaults: {
        firstProject: '', //一级部门
        secondProject: '', //二级部门
        isCollege: true,
        isBusiness: false,
        resultList: [],
        stateList: [],
        infoType: 1,
        searchParams: {}
    }
});

const SubContent = Backbone.View.extend({
    initialize(options) {
        const {firstProject, secondProject, stateList, infoType, onBack, isBusiness, isCollege, } = options;
        this.onBack = onBack;
        this.model = new Model();
        this.model.set({firstProject, secondProject, stateList, infoType, isBusiness, isCollege, });
        this.listenTo(this.model, 'change:resultList', this.renderResultList);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.render();
        this.getOptList();
    },

    events: {
        'click #subContentSearchBtn': 'search',
        'click #subContentResetBtn': 'reset',
        'click #backToPrevBtn': 'back',
        'click #showTime': 'showDatetimepicker',
    },

    showDatetimepicker(e) {
        $(e.currentTarget).datetimepicker(datepickerCfg);
        $(e.currentTarget).datetimepicker('show');
    },

    search() {
        const params = common.getFormData({
            formId: 'form'
        });

        this.model.set({searchParams: params, pageCount: 0});

        this.getOptList();
    },

    reset() {
        this.$el.find('#form')[0].reset();
    },

    back() {
        this.destroy();
        if (typeof this.onBack === 'function') {
            this.onBack();
        }
    },

    destroy() {
        this.$el.empty();
        this.undelegateEvents();
    },

    getOptList(params = {}) {
        const {infoType, searchParams, firstProject, secondProject, isCollege, isBusiness} = this.model.toJSON();
        const firstProjectName = isCollege ? 'college' : 'businessUnit';
        const secondProjectName = isCollege ? 'family' : 'corps';

        const {pageSize = PAGE_SIZE, pageNo = 1} = params;
        service.adminGetOptList({
            infoType,
            pageSize,
            pageNo,
            [firstProjectName]: firstProject,
            [secondProjectName]: isCollege ? {[firstProject]: [secondProject]} : secondProject,
            ...searchParams
        }, (response) => {
            if (response.rs) {
                const {countPerPage, pageIndex, pageCount, totalCount, resultList} = response.resultMessage;
                
                this.model.set({
                    pageSize: countPerPage,
                    pageNo: pageIndex,
                    pageCount,
                    resultList
                })
            } else {
                alert(response.rsdesp);
            }
        })
    },

    renderResultList() {
        const {resultList, infoType} = this.model.toJSON();
      
        this.contentTable && this.contentTable.destroy();
        this.contentTable = new ContentItems({
            resultList,
            infoType,
            refresh: () => {
                const {pageSize, pageNo} = this.model.toJSON();
                this.getOptList({
                    pageSize,
                    pageNo
                });
            }
        });

        this.$el.find('#tableContainer').html(this.contentTable.$el);
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
        })
    },

    format(data) {
        const {stateList} = data;
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

export {SubContent}
