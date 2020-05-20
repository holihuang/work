/*
**@options: {Object} It: 根节点指针
**@options: {Boolean} isShowTopicName:首页话题详情页区分标志位
 */
import { service } from '../../../common/service'
import { Select } from '../../../components/select/index'

const tpl = require('./innerSearch.html')

const Model = Backbone.Model.extend({
    defaults: {
        pageSize: 25,
        pageNo: 1,
        topicNameList: [],
    },
})

const InnerSearch = Backbone.View.extend({

    initialize(options) {
        this.model = new Model()
        const {
            isShowTopicName, typeNum, recommendedPositionVal, type, It, pageSize, pageNo,
        } = options
        this.options = options
        this.listenTo(this.model, 'change:topicNameList', this.render)
        this.initTopicNameList()
        this.listenTo(this.model, 'change:isShowTopicName', this.render)
        this.model.set({
            isShowTopicName,
            typeNum,
            recommendedPositionVal,
            type,
            pageSize,
            pageNo,
            It,
        })
        this.render()
    },

    events: {
        'click #innerQuery': 'innerQuery',
        'change #vipTabRecContent': 'toggleRecContent',
    },

    innerQuery() {
        const {
            typeNum, pageSize, pageNo, type,
        } = this.model.toJSON()
        const selectVal = this.$el.find('#topicNameSelect .selectedItemsText').val()

        if (!typeNum) {
            this.options.onQueryRecommendData({ pageSize, pageNo, type })
        } else {
            this.options.onQueryShieldData({ pageSize, pageNo, type })
        }
    },


    initTopicNameList() {
        const isPage = 0
        const params = { isPage }
        let { topicNameList } = this.model.toJSON()
        service.getTopicNameList(params, response => {
            if (response.rs) {
                topicNameList = response.resultMessage.resultList
                this.model.set({
                    topicNameList,
                })
            } else {
                alert('获取话题名称下拉列表选项失败，请刷新重试！')
            }
        })
    },

    toggleRecContent() {
        const { pageSize, pageNo, typeNum } = this.model.toJSON()
        const selectedOptionValue = this.$el.find('#vipTabRecContent option:selected').val()
        this.caseOption(selectedOptionValue)
        if (typeof this.options.onQueryRecommendData === 'function' && typeNum == 0) {
            this.options.onQueryRecommendData({ pageSize, pageNo })
        } else if (typeof this.options.onQueryRecommendData === 'function' && typeNum == 1) {
            this.options.onQueryShieldData({ pageSize, pageNo })
        }
    },

    caseOption(opt) {
        const {
            It, pageSize, pageNo, typeNum,
        } = this.model.toJSON()
        typeNum == 0 && this.$el.find('.inner-search-input').removeClass('hide-important')
        this.$el.find(".inner-search-input input[name='recContentInput']").attr('type', 'number')
        typeNum == 0 && It.$el.find('#suggestedTable th:lt(2)').removeClass('hide')
        typeNum == 0 && It.$el.find('#suggestedTable th:eq(2)').text('用户归属')
        let placeholderText
        if (opt == 0) {
            typeNum == 0 && this.$el.find('.inner-search-input').addClass('hide-important')
            this.$el.find(".inner-search-input input[name='recContentInput']").attr('type', 'text')
        } else if (opt == 1) {
            placeholderText = '请输入帖子id'
            typeNum == 1 && It.$el.find('#cancelRecTable th:first').text('帖子ID')
        } else if (opt == 2) {
            placeholderText = '请输入话题名称'
            this.$el.find(".inner-search-input input[name='recContentInput']").attr('type', 'text')
        } else if (opt == 3) {
            placeholderText = '请输入用户userid'
        } else if (opt == 4 || +opt === 7) {
            typeNum == 0 && this.$el.find('.inner-search-input').addClass('hide-important')
        } else if (opt == 5) {
            placeholderText = '请输入问题Id'
            typeNum == 0 && It.$el.find('#suggestedTable th:lt(2)').addClass('hide')
            typeNum == 0 && It.$el.find('#suggestedTable th:eq(2)').text('问题ID')
            typeNum == 1 && It.$el.find('#cancelRecTable th:first').text('问题ID')
        }
        this.$el.find(".inner-search-input input[name='recContentInput']").attr('placeholder', `${placeholderText}`).val('')
    },

    renderTopicNameSelect(topicNameList, id) {
        const list = this.convertToValTxtObj(topicNameList)
        this.topicNameSelect && this.topicNameSelect.undelegateEvents()
        this.topicNameSelect = new Select({
            el: this.$el.find(id)[0],
            itemList: list,
            name: 'innerTopicName',
            selectedItemsText: '全部',
        })
    },

    convertToValTxtObj(list) {
        const arr = []
        list.forEach((item, index) => {
            arr.push({
                value: item.topicId,
                text: item.topicTitle,
            })
        })
        return arr
    },

    // to do
    // 话题详情页-innerSearch新需求暂时不开通前端权限-隐藏本次开发的需求
    hideInnerSearchOfNewDeveloped(type) {
        if (type == 2) {
            this.$el.find('.inner-search-recommendcontent').addClass('hide-important')
            this.$el.find('.inner-search-showstate').addClass('hide-important')
        }
    },

    initiaContentTypeSelect(typeNum) {
        const { length: optionLength } = this.$el.find('#vipTabRecContent').children()
        if (typeNum == 0) {
            this.$el.find('#vipTabRecContent option:lt(5)').removeClass('hide')
        } else if (typeNum == 1) {
            this.$el.find('#vipTabRecContent option:lt(5)').addClass('hide')
            this.$el.find(`#vipTabRecContent option:eq(${optionLength - 1})`).addClass('hide')
            this.$el.find('#vipTabRecContent option:eq(1)').removeClass('hide')
            this.$el.find('#vipTabRecContent').val('1')
        }
    },

    render() {
        const data = this.model.toJSON()
        this.$el.html(tpl(data))
        const {
            topicNameList, isShowTopicName, recommendedPositionVal, typeNum, type,
        } = data
        topicNameList && this.renderTopicNameSelect(topicNameList, '#topicNameSelect')
        if (isShowTopicName) {
            this.$el.find('.inner-search-topicname').removeClass('hide-important')
        } else {
            this.$el.find('.inner-search-topicname').addClass('hide-important')
        }
        this.initiaContentTypeSelect(+typeNum)
        if (typeNum == '1') {
            // 取消推荐tab下隐藏推荐内容，展示状态
            // this.$el.find(".inner-search-recommendcontent").addClass("hide-important");
            if (!isShowTopicName) {
                this.$el.find('.inner-search-recommendcontent').removeClass('hide-important')
            } else {
                this.$el.find('.inner-search-recommendcontent').addClass('hide-important')
            }
            this.$el.find('.inner-search-showstate').addClass('hide-important')
        } else if (typeNum == '0') {
            // vip学员推荐tab下显示推荐内容，展示状态
            if (!isShowTopicName) {
                this.$el.find('.inner-search-recommendcontent').removeClass('hide-important')
                this.$el.find('.inner-search-showstate').removeClass('hide-important')
            } else {
                this.$el.find('.inner-search-recommendcontent').addClass('hide-important')
                this.$el.find('.inner-search-showstate').addClass('hide-important')
            }
        }
        if (recommendedPositionVal == '1') {
            // 推荐位置：首页时，隐藏屏蔽tab的查询按钮
            if (typeNum == '1') {
                this.$el.find('.inner-search-query').addClass('hide-important')
            }
        } else if (recommendedPositionVal == '2') {
            // 推荐位置：话题详情页时，显示屏蔽tab的查询按钮
            if (typeNum == '1') {
                this.$el.find('.inner-search-query').removeClass('hide-important')
            }
        }

        // to do
        // 话题详情页-innerSearch新需求暂时不开通前端权限-隐藏本次开发的需求
        this.hideInnerSearchOfNewDeveloped(type)
    },
})

export { InnerSearch }
