/**
 * @file table组件
 * @author hualuyao
 * @params {object} options
 * @params {array<object>} options.columns
 * @params {string} options.columns.field 表头字段名称
 * @params {string | function} options.columns.content 列表项内容
 * @params {?boolean} options.columns.escapeHtml 是否转义　默认为true
 * @params {array} options.dataList 数据
 * @params {?boolean} options.showCheckBox 是否支持全选 默认false
 */

import tpl from './tpl.html';

let Model = Backbone.Model.extend({
    defaults: {
        columns: [],
        dataList: [],
        showCheckBox: false,
    }
});

let Table = Backbone.View.extend({
    initialize(options) {
        let {columns, dataList, showCheckBox} = options;
        this.model = new Model();
        this.model.set({columns, dataList});
        showCheckBox && this.model.set({showCheckBox});
        this.render();
    },

    events: {
        'click .check-all': 'toggleCheckAll',
    },

    toggleCheckAll(e) {
        const checked = $(e.currentTarget).prop('checked');
        this.$el.find('.check-ipt').each(function() {
            $(this).prop('checked', checked);
        })
    },

    format(data) {
        let {columns, dataList, showCheckBox} = data;
        let rows = [];
        dataList.forEach((d, index) => {
            let row = columns.map((item) => {
                let {escapeHtml = true, escapeField = true} = item;
                return {
                    escapeHtml,
                    content: typeof item.content === 'function' ? item.content(d, index) : d[item.content]
                }
            })

            rows.push({
                showCheckBox,
                index,
                items: row
            });
        })

        return {
            columns,
            rows,
            showCheckBox,
            colsNum: columns.length 
        }
    },

    getCheckedItemsIndex() {
        let rs = [];
        this.$el.find('.check-ipt').each(function() {
            if ($(this).prop('checked')) {
                rs.push($(this).attr('index'));
            }
        })

        return rs;
    },

    destroy() {
        this.undelegateEvents();
        this.$el.empty();
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Table}
