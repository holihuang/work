import {Dialog} from '../../../../components/dialog/index';
import {service} from '../../../../common/service';
import {Pager} from '../../../../components/pager/index';
import {Items} from './items/index';
import tpl from './tpl.html';

const PAGE_SIZE = 25;

const optionsList = [
    {
        value: 16,
        valueText: 16,
    },
    {
        value: 24,
        valueText: 24
    },
    {
        value: 32,
        valueText: 32
    }
]

const Model = Backbone.Model.extend({
    defaults: {
        resultList: [],
        pageCount: 0,
        pageNo: 1,
        pageSize: PAGE_SIZE,
        checkedList: [],
    }
})

const View = Backbone.View.extend({
    initialize(options) {
        this.model = new Model();

        this.listenTo(this.model, 'change:resultList', this.renderResultList);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);

        this.render();

        this.getCorpsList();
    },

    events: {
        'click .topic-item': 'toggleItemChecked',  //css命名不够通用，但是为了复用样式，这里就不再改了
    },

    getCorpsList(options = {}) {
        this.$el.find('#corpsListContainer').html('<img class="img-container">');
        const {pageNo = 1, pageSize = PAGE_SIZE} = options;
        service.listAllCorps({
            pageNo,
            pageSize,
        }, (response) => {
            if (response.rs) {
                let {countPerPage, pageIndex, pageCount, totalCount, resultList} = response.resultMessage;
                this.model.set({
                    pageNo: pageIndex,
                    pageSize: countPerPage,
                    pageCount,
                    resultList,
                });
            } else {
                alert(response.rsdesp);
            }
        })
    },

    toggleItemChecked(e) {
        const $currentEl = $(e.currentTarget);

        $currentEl.toggleClass('checked');

        const code = +$(e.currentTarget).attr('code');

        let {checkedList} = this.model.toJSON();
        checkedList.indexOf(code) === -1 ? checkedList.push(code) : (
            checkedList.splice(checkedList.indexOf(code), 1)
        );
    },

    renderResultList() {
        const {resultList, checkedList} = this.model.toJSON();
        this.items && this.items.destroy();
        this.items = new Items({
            el: this.$el.find('#corpsListContainer')[0],
            resultList,
            checkedList
        });
    },

    renderPager() {
        const {pageSize, pageNo, pageCount} = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer')[0],
            pageSize,
            pageNo,
            pageCount,
            optionsList,
            onChange: (options) => {
                this.getCorpsList(options);
            }
        })
    },

    getData() {
        const {checkedList} = this.model.toJSON();
        return checkedList;
    },

    render() {
        this.$el.html(tpl());
    }
})

class CorpsDialog {
    constructor(options) {
        this.view = new View();
        this.show();
    }

    show() {
        const that = this;
        this.d = new Dialog({
            title: '请选择军团',
            content: this.view.$el,
            type: 4,
            ok: function() {
                const checkedList = that.view.getData();
                this.closeDialog();
            }
        })
    }
}

export {CorpsDialog}
