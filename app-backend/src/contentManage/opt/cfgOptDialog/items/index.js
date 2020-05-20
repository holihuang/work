import tpl from './tpl.html';

let itemId = 0;

const Model = Backbone.Model.extend({
    defaults: {
        resultList: [],
        checkedAll: ''
    }
});

const Items = Backbone.View.extend({
    initialize(options) {
        const {resultList, checkedAll = ''} = options;
        itemId++;
        this.model = new Model();
        this.model.set({resultList, checkedAll, itemId});
        this.render();
    },

    events: {
        'click input': 'handleClickInput',
        'click .check-all-ipt': 'checkAll',
    },

    handleClickInput(e) {
        const {itemId} = this.model.toJSON();
        const value = $(e.currentTarget).val();
        if ($(e.currentTarget).prop('checked')) {
            //被选中
            //判断是否所有的input都被选中了
            let hasAllChecked = true;
            this.$el.find('.ipt').each(function() {
                if (!$(this).prop('checked')) {
                    hasAllChecked = false;
                }
            })

            if (hasAllChecked) {
                this.$el.find(`#allIpt${itemId}`).prop('checked', true);
            }
        } else {
            //取消选中
            this.$el.find(`#allIpt${itemId}`).prop('checked', false);
        }
    },

    checkAll(e) {
        if ($(e.currentTarget).prop('checked')) {
            //选择全部
            this.$el.find('input').each(function() {
                $(this).prop('checked', true);
            })
        } else {
            //取消选择全部
            this.$el.find('input').each(function() {
                $(this).prop('checked', false);
            })
        }
    },

    getData() {
        let rs = [];

        if (this.$el.find('.check-all-ipt').prop('checked')) {
            return ['ALL'];
        }

        this.$el.find('input').each(function() {
            if ($(this).prop('checked') && !$(this).hasClass('check-all-ipt')) {
                rs.push($(this).val());
            }
        })

        return rs;
    },

    format(data) {
        return data;
    },

    render() {
        const data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}
