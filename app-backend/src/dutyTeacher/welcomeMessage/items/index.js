import {service} from '../../../common/service';
import {WelcomeMessageDialog} from '../welcomeMessageDialog/index';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        tip: '没有找到符合条件的记录~'
    }
});

const PAGE_SIZE = 25;
const CHANNEL_CODE = 'CS_BACKGROUND';

var Items = Backbone.View.extend({
    initialize: function(options) {
        let {$el, ...others} = options;
        this.model = new Model();
        this.model.set({...others});
        this.render();
        this.listenTo(this.model, 'change:resultList', this.render);
    },

    events: {
        'click .check': 'check',
        'click .update': 'update',
        'click .delete': 'deleteItem'
    },

    getDefaultParams() {
        let {schoolName, familyName, faqTypeName, pageSize = PAGE_SIZE} = this.model.toJSON();
        return {
            schoolName,
            familyName,
            faqTypeName,
            pageSize,
            channelCode: 'CS_BACKGROUND'
        }
    },

    check(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        let {faqId} = resultList[index];

    },

    update(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        new WelcomeMessageDialog({
            type: 'update',
            ...resultList[index],
            callback: () => {
                this.refresh();
            }
        });
    },

    deleteItem(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        let {id} = resultList[index];

        if (confirm('确定要删除该欢迎语吗？')) {
            service.deleteWelcomeMessage({
                id,
                channelCode: CHANNEL_CODE
            }, (response) => {
                if (response.rs) {
                    alert('删除成功！');
                    this.refresh(); //删除成功后刷新列表
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    refresh() {
        //刷新当前页
        let params = this.getDefaultParams();
        let {pageNo} = this.model.toJSON();
        service.listWelcomes({
            ...params,
            pageNo
        }, (response) => {
            if (response.rs) {
                let {resultList} = response.resultMessage;
                this.model.set({resultList});
            } else {
                alert(response.rsdesp);
            }
        })
    },

    format(data) {
        let {resultList = []} = data;
        resultList.forEach((item, index) => {
            item.index = index;
        })
        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}