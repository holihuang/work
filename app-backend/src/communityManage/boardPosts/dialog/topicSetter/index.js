import {Items} from './items/index';
import {Pager} from '../../../../components/pager/index';
import {Dialog} from '../../../../components/dialog/index';
import {service} from '../../../../common/service';

const PAGE_SIZE = 16;

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        postIdList: '',  //设置话题的帖子id列表，这里是为了兼容批量操作，采用了数组
        topicList: [],
        topicIds: [], //原始选中的话题id集合
        selectTopics: [],  //选中的话题的各信息
        pageSize: 16,
        optionsList: [
            {
				value: 16,
				optionsChecked: '',
				valueText: '16'
			},
			// {
			// 	value: 24,
			// 	optionsChecked: '',
			// 	valueText: '24'
			// },
			// {
			// 	value: 32,
			// 	optionsChecked: '',
			// 	valueText: '32'
			// }
        ]
    }
})

var View = Backbone.View.extend({
    initialize: function(options) {
        let {postIdList, topicIds, selectTopics} = options;
        this.model = new Model();
        this.model.set({postIdList, topicIds, selectTopics});
        this.listenTo(this.model, 'change:topicList', this.renderTopicList);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.listenTo(this.model, 'change:pageNo', this.renderPager);
        this.listenTo(this.model, 'change:pageSize', this.renderPager);
        this.listenTo(this.model, 'change:selectTopics', this.setTopicTitle);
        this.render();
        // this.getTopicList();
        this.renderSelectedTopicList(selectTopics)
    },

    events: {
        'click .topic-item': 'selectTopics', //选择话题
        'click #topicSearch': 'handleTopicSearch'
    },

    renderSelectedTopicList(selectTopics) {
        this.model.set({
            topicList: selectTopics.map(item => ({ ...item, activeClass: 'checked' }))
        })
    },

    handleTopicSearch(options = {}) {
        const topicTitle = this.$el.find("input[name='topicName']").val().trim() || ''

        // 话题验空
        if (!topicTitle.length) {
            alert('请您选择话题名称!')
            return
        }

        let { pageNo = 1, pageSize = PAGE_SIZE } = options
        const { topicIds, postIdList } = this.model.toJSON()

        service.adminSearchTopicName({
            postMasterId: postIdList[0],
            oldTopicList: topicIds,
            pageNo,
            pageSize,
            topicTitle,
        }, response => {
            if (response.rs) {
                const { countPerPage, pageIndex, pageCount, totalCount, resultList } = response.resultMessage;
                this.model.set({
                    topicList: resultList,
                    pageNo: pageIndex,
                    pageCount,
                    pageSize
                })
            } else {
                alert(response.rsdesp)
            }
        })
    },

    selectTopics(e) {
        $(e.currentTarget).toggleClass('checked');
        let topicId = +$(e.currentTarget).attr('topicid');
        let topicTitle = $(e.currentTarget).attr('title');
        let {selectTopics} = this.model.toJSON();

        if ($(e.currentTarget).hasClass('checked')) {
            this.model.set({
                selectTopics: selectTopics.concat([
                    {
                        topicId,
                        topicTitle,
                        topicType: 1 //1为官方，2为自定义的
                    }
                ])
            });
        } else {
            let index;
            for (let i = 0, len = selectTopics.length; i < len; i++) {
                if (selectTopics[i].topicId == topicId) {
                    index = i;
                    break;
                }
            }

            let newSelectTopics = JSON.parse(JSON.stringify(selectTopics));
            index > -1 && newSelectTopics.splice(index, 1);

            this.model.set({
                selectTopics: newSelectTopics
            });
        }
    },

    setTopicTitle() {
        let {selectTopics = []} = this.model.toJSON();
        let officialTopics = selectTopics.filter(item => item.topicType === 1);
        let topicsStr = '已选择：';
        officialTopics.forEach((item, index) => {
            topicsStr += `<li class="item-with-border mr10 mt10">${item.topicTitle}</li>`;
        })
        this.$el.find('#selectTopics').html(topicsStr);
    },

    getTopicList(options = {}) {
        this.$el.find('#topicListContainer').html('<img class="img-container">');
        let {pageNo = 1, pageSize = PAGE_SIZE} = options;
        let {topicIds} = this.model.toJSON();
        service.adminGetTopicName({
            oldTopicList: topicIds,
            pageNo,
            pageSize,
            isPage: 1,
            topicState: 1  //这里设置话题时，只展示状态为'显示'的话题
        }, (response) => {
            if (response.rs) {
                let {countPerPage, pageIndex, pageCount, totalCount, resultList} = response.resultMessage;
                this.model.set({
                    topicList: resultList,
                    pageNo: pageIndex,
                    pageCount,
                    pageSize
                });
            } else {
                alert(response.rsdesp);
            }
        })
    },

    renderTopicList() {
        let {topicList, selectTopics} = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({
            el: this.$el.find('#topicListContainer')[0],
            selectTopics,
            topicList
        });
    },

    renderPager() {
        let { pageNo, pageCount, pageSize, optionsList, topicList = [] } = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer')[0],
            pageNo,
            pageCount,
            pageSize,
            optionsList,
            onChange: this.handleTopicSearch.bind(this)
        })
        if (!topicList.length) {
            this.$el.find('#pagerContainer').empty()
        }
    },

    getData() {
        let {postIdList, topicIds, selectTopics} = this.model.toJSON();
        return {
            postIdList,
            topicIds,
            selectTopics
        }
    },

    format(data) {
        let {selectTopics} = data;
        let officialTopics = selectTopics.filter(item => item.topicType == 1);

        return {officialTopics}
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})


class TopicSetter {
    constructor(options) {
        let {onSuccess} = options;
        this.onSuccess = onSuccess;
        this.view = new View(options);
        this.show();
    }

    show() {
        let that = this;
        let d = new Dialog({
            title: '设置话题',
            content: this.view.$el,
            type: 4,
            ok: function() {
                let params = that.view.getData();
                let {postIdList, selectTopics, topicIds} = params;
                //topicId为原始的
                //topicIdList为新设置的
                let topicIdList = selectTopics.map((item) => {
                    return item.topicId;
                });

                service.adminEditTopicOnPost({
                    postIdList,
                    oldTopicList: topicIds,
                    topicIdList,
                }, (response) => {
                    if (response.rs) {
                        alert('编辑成功！');
                        if (typeof that.onSuccess === 'function') {
                            that.onSuccess(); //设置话题成功之后的回调
                        }
                        this.closeDialog();
                    } else {
                        alert(response.rsdesp);
                    }
                })
            }
        })
    }
}

export {TopicSetter}
