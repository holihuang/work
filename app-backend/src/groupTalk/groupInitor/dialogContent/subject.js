/**
 * @file 选择科目
 *
 * @auth gushouchuang
 * @date 209-09-16
 */

import { service } from 'common/service'

const subjectContentTpl = require('./subjectContentTpl.html')

const Model = window.Backbone.Model.extend({
    defaults: {
        selectId: '',
        selectName: '',
        list: [],
        rstIsEmpty: false,
    },
})

const Subject = window.Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        this.options = options
        this.render()
        this.listenTo(this.model, 'change:list', this.render)
        this.listenTo(this.model, 'change:rstIsEmpty', this.render)
    },
    events: {
        'click #sub-search': 'querySublist',
        'click .subject-item': 'selectItem',
    },

    selectItem(e) {
        const cNode = $(e.target)

        const selectId = cNode.attr('value')
        const selectName = cNode.html()

        this.model.set({
            selectId,
            selectName,
        })

        this.$el.find('.select-name').html(`已选科目：${selectName}`).show().attr('title', selectName)
    },

    querySublist() {
        const keyword = this.$el.find('#subject-keyword').val().trim()
        const params = {
            keyword,
        }

        if (keyword === '') {
            alert('关键词不能为空。')
            return
        }
        // 请求一旦发出 model中的数据做重置。
        this.model.set({
            selectId: '',
            selectName: '',
            list: [],
            rstIsEmpty: false,
        })

        this.$el.find('.select-name').html('').hide()

        service.getGroupSubjectList(params, response => {
            if (response.rs) {
                const {
                    resultMessage,
                } = response

                this.model.set({
                    list: resultMessage,
                    rstIsEmpty: resultMessage.length === 0,
                })
            } else {
                alert('查询失败！')
            }
        })
    },

    format() {
        const data = this.model.toJSON()
        data.hasList = data.list.length > 0
        data.hasSelect = !!data.selectId

        return data
    },

    render() {
        const data = this.format()
        this.$el.html(subjectContentTpl(data))
    },
})

export { Subject }
