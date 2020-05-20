/**
 * @file 在弹窗中分页多选
 * @author hualuyao
 * @params {object} options
 * @property {string} options.title
 * @property {string} options.reqUrl
 * @property {function} options.callback
 * @property {?array} options.checkedList
 * @property {string} options.key
 * @property {string} options.name
 */

import {Dialog} from '../../../../components/dialog/index';
import {service} from '../../../../common/service';
import {Pager} from '../../../../components/pager/index';
import {Items} from './items/index';
import tpl from './tpl.html';

const PAGE_SIZE = 24;

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
        reqUrl: '',
        resultList: [],
        pageCount: 0,
        pageNo: 1,
        pageSize: PAGE_SIZE,
        checkedList: [],
    }
})

const View = Backbone.View.extend({
    initialize(options) {
        const {reqUrl, checkedList, name, key} = options;
        this.model = new Model();
        this.model.set({reqUrl, checkedList, name, key});

        this.listenTo(this.model, 'change:resultList', this.renderResultList);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);

        this.render();

        this.getList();
    },

    events: {
        'click .topic-item': 'toggleItemChecked',  //css命名不够通用，但是为了复用样式，这里就不再改了
    },

    getList(options = {}) {
        this.$el.find('#listContainer').html('<img class="img-container">');
        const {pageNo = 1, pageSize = PAGE_SIZE} = options;
        const {reqUrl} = this.model.toJSON();
        service[reqUrl]({
            pageNo,
            pageSize,
            isPage: 1,
        }, (response) => {
            if (response.rs) {
                if (response.resultMessage instanceof Array) {
                    this.model.set({
                        resultList: response.resultMessage
                    })
                } else {
                    const {countPerPage, pageIndex, pageCount, totalCount, resultList} = response.resultMessage;
                    this.model.set({
                        pageNo: pageIndex,
                        pageSize: countPerPage,
                        pageCount,
                        resultList,
                    });
                }
            } else {
                alert(response.rsdesp);
            }
        })
    },

    toggleItemChecked(e) {
        const $currentEl = $(e.currentTarget);

        $currentEl.toggleClass('checked');

        const code = $currentEl.attr('code');

        let {checkedList} = this.model.toJSON();
        checkedList.indexOf(code) === -1 ? checkedList.push(code) : (
            checkedList.splice(checkedList.indexOf(code), 1)
        );
    },

    renderResultList() {
        const {resultList, checkedList, key, name} = this.model.toJSON();
        this.items && this.items.destroy();

        const resultListFormatted = resultList.map(item => {
            if (key == '.' && name == '.') {
                return {
                    key: item,
                    name: item
                }
            }

            return {
                key: item[key],
                name: item[name]
            }
        });

        this.items = new Items({
            el: this.$el.find('#listContainer')[0],
            resultList: resultListFormatted,
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
                this.getList(options);
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

class MultiSelectDialog {
    constructor(options = {}) {
        const {
            title = '', 
            reqUrl = '', 
            checkedList = [], 
            callback,
            key,
            name,
        } = options;

        this.title = title;
        this.callback = callback;

        this.view = new View({
            reqUrl,
            checkedList,
            key,
            name,
        });

        this.show();
    }

    show() {
        const that = this;
        this.d = new Dialog({
            title: this.title,
            content: this.view.$el,
            type: 4,
            ok: function() {
                const checkedList = that.view.getData();
                if (typeof that.callback === 'function') {
                    that.callback(checkedList);
                }
                this.closeDialog();
            }
        })
    }
}

export {MultiSelectDialog}
