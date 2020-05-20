/**
 * @file app native 页面选择跳转位置
 *
 * @author hualuyao
 * @date 2017-12-14
 */

import {service} from '../../common/service';
import tpl from './tpl.html';

const Model = Backbone.Model.extend({
    defaults: {
        reqUrl: '',
        pages: [],
        isHaveParam: 0,
        pageKey: '',
    }
})

const AppPage = Backbone.View.extend({
    initialize(options = {}) {
        const {reqUrl = 'getAllNativePage'} = options;
        this.model = new Model();
        this.model.set({reqUrl});
        this.listenTo(this.model, 'change', this.render);
        this.getPages();
    },

    events: {
        'change #skipName': 'handleSkipNameChange'
    },

    handleSkipNameChange() {
        //当选择的native page变化时，判断是否带参数
        const [pageKey, isHaveParam] = this.$el.find('#skipName').val().split('-');

        this.model.set({
            isHaveParam: +isHaveParam,
            pageKey
        });
    },

    getPages() {
        const {reqUrl} = this.model.toJSON();
        service[reqUrl]({}, (response) => {
            if (response.rs) {
                const {resultMessage} = response;
                this.model.set({
                    pages: resultMessage
                })
            } else {
                alert(response.rsdesp);
            }
        })
    },

    //获取选择结果
    getData() {
        const {pageKey, isHaveParam} = this.model.toJSON();
        let skipId;
        
        if (isHaveParam) {
            skipId = this.$el.find('#skipId').val();
            
            if (!skipId) {
                alert('请填写跳转页面id');
                return null;
            }

            return {
                pageKey,
                isHaveParam,
                skipId
            }
        }

        return {
            pageKey,
            isHaveParam
        }
    },

    format(data) {
        const {pages, pageKey} = this.model.toJSON();

        pages.forEach(item => {
            item.selected = item.pageKey == pageKey ? 'selected' : '';
        });

        return data;
    },

    render() {
        const data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

export {AppPage}
