/**
 * @file select 组件
 * @author hualuyao
 * 
 * 使用：
 * new Select({
 *      el: XXXX, 组件父容器
 *      itemList{array} 列表项, 无值时接收一个空数组
 *      itemList[i]{object} {value, text, checked},  checked选填项
 *      name {string} 用于区分多个select框
 *      ?spliter {string} 多选拼接符, 默认值为',';
 *      ?canSearch{boolean} 是否可以筛选，目前筛选为前端主动过滤，不调用接口；默认为不可筛选
 *      ?noResultTip{string} 如果可筛选，筛选无结果时显示的话术，如“未找到符合条件的结果”；默认为“没有符合条件的结果”
 *      ?selectedItemsText{string} 默认值placeholder，如“请选择学院”
 *      ?isShowNoResultTip{Boolean}是否显示“没有符合条件的结果”提示
 *      ?onChecked{function}选中回调函数，选填项
 *      ?divider{boolean} 是否显示分割线,可选项
 * })
 * 
 * 获取数据
 * let select = new Select({....});
 * select.getData()
 * @return {
 *      //使用spliter拼接得到的字符串
 *      values{string},
 *      texts{string} 
 * }
 */

import './style.less';

let tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        isShowNoResultTip: false,  //默认不显示
        canSearch: false, //默认不可以筛选
        selectedItemsText: '请选择',
        selectedItemsValue: '',
        searchDefaultText: '请输入筛选条件',
        itemList: [],
        hideClass: 'hide', //默认下拉框隐藏
        noResultTip: '没有符合条件的结果',
        spliter: ',',
        divider: false     //是否显示分割线
    }
})

var Select = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.options = options;
        //必填项
        let {itemList, name} = options;
        this.model.set({
            itemList,
            name
        });

        //选填项
        let {spliter, canSearch, noResultTip, selectedItemsText} = options;
        spliter           && this.model.set({spliter});
        canSearch         && this.model.set({canSearch});
        noResultTip       && this.model.set({noResultTip});
        selectedItemsText && this.model.set({selectedItemsText});

        this.needBindBody = true;
        this.render();
        //默认渲染选中的checkbox
        this.handleChooseItem();
    },

    events: {
        'click [name="selectedItemsText"]': 'toggleListContainer',
        'click input[type="checkbox"]': 'handleChooseItem',
        'input [name="searchIpt"]': 'search',
        'keydown [name="selectedItemsText"]': 'handleChooseItem',
        'keyup [name="selectedItemsText"]': 'handleChooseItem',
        'click .select-container': 'stoppropagation'
    },

    handleBlur() {
        this.hideListContainer();
    },

    stoppropagation(e) {
        e.stopPropagation();
        if (this.needBindBody) {
            $('body').one('click', () => {
                this.hideListContainer();
            })

            this.needBindBody = false;
        }
    },

    handleFocus() {
        this.$el.find('.select-container').focus();
    },

    handleDisable() {
        const firstChecked = this.$el.find('input[type="checkbox"]:first').prop('checked');
        if(firstChecked) {
            this.$el.find('input[type="checkbox"]:gt(0)').each(function() {
                $(this).removeAttr('checked');
                $(this).attr('disabled', true);
            })
            this.$el.find('[name="selectedItemsText"]').val('全部');
        } else {
            this.$el.find('input[type="checkbox"]:gt(0)').each(function() {
                $(this).removeAttr('disabled');
            })  
        } 
    },

    handleChooseItem() {
        //获取当前所有选中项
        let checkedItems = this.$el.find('input:checked');
        if(checkedItems.length) {
            let valueList = [];
            let textList = [];

            checkedItems.each(function() {
                let value = $(this).val();
                let text = $(this).attr('text');

                valueList.push(value);
                textList.push(text);
            })

            let {spliter} = this.model.toJSON();
            this.$el.find('[name="selectedItemsText"]').val(textList.join(spliter));
            this.$el.find('[name="selectedItemsValue"]').val(valueList.join(spliter));
            this.model.set({selectedItemsText: textList.join(spliter), selectedItemsValue: valueList.join(spliter)});
            //选中回调
            //选中"全部"，只传"全部"
            if(textList.join(spliter).indexOf("全部") !== -1) {
                this.options.onChecked && this.options.onChecked("全部");  
            } else {
                this.options.onChecked && this.options.onChecked(textList.join(spliter));
            }
            
            //帖子状态-对敏感词-屏蔽原因的启用和禁用
            this.options.onChangeState && this.options.onChangeState(valueList.join(spliter));
        } else {
            this.$el.find('input[name="selectedItemsText"]').val('');
        }
        this.handleDisable();  
    },

    search(e) {
        let searchContent = $(e.currentTarget).val();
        let hasResult = false;
        this.$el.find('input[type="checkbox"]').each(function() {
            let text = $(this).attr('text');
            if (text.indexOf(searchContent) == -1) {
                $(this).parent().hide();
            } else {
                $(this).parent().show();
                hasResult = true;
            }
        })

        if (hasResult) {
            this.$el.find('.no-result').addClass('hide');
        } else {
            this.$el.find('.no-result').removeClass('hide');
        }
    },

    toggleListContainer(e) {
        this.$el.find(".item-list-container").toggleClass("hide");

        if (!this.$el.find('.item-list-container').hasClass('hide')) {
            this.needBindBody = true;
        }
    },

    hideListContainer() {
        this.$el.find('.item-list-container').addClass('hide');
    },

    getData() {
        let {selectedItemsValue: values, selectedItemsText: texts} = this.model.toJSON();
        return {
            values,
            texts
        }
    },

    format(data) {
        let {itemList, selectedItemsValue = '', searchContent, noResultTip, isShowNoResultTip} = data;
        let checkedItems = selectedItemsValue.split(',') || [];
        
        if(!itemList.length) {
            isShowNoResultTip = true;
            Object.assign(data, {isShowNoResultTip});
        }
        itemList.forEach((item, index) => {
            item.index = index;
            // if (checkedItems.indexOf('' + item.value) != -1) {
            //     item.checked = 'checked';
            // } else {
            //     item.checked = '';
            // }

            if (!searchContent) {
                item.display = 1; //没有搜索，全部展示
            } else {
                if (item.text.indexOf(searchContent) != -1) {
                    item.display = 1;
                } else {
                    item.display = 0;
                }
            }
        })

        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        const {isShowNoResultTip} = data;
        this.$el.html(tpl(data));
        if(isShowNoResultTip) {
            this.$el.find(".no-result").removeClass("hide");
        }
    }
})

export {Select}
