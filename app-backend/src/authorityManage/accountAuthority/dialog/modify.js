const tpl = require('./modify.html');

const banStateLists = {
    0: '禁言中',
    1: '未曾禁言过',
    2: '已解除',
}

const Model = Backbone.Model.extend({
    defaults: {
        banRangeFirst: '',
        banRangeSecond: '',
        banRangeThird: '',
    },
})

const Modify = Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        this.options = options
        const { resultListItem } = options
        this.model.set(
            resultListItem,
        )
        this.render()
    },

    events: {
        'click input[name="banRange"]': 'partialClikable',
    },

    partialClikable() {
        const checkedFirst = this.$el.find("#banRangeFirst").prop('checked')
        const checkedSecond = this.$el.find("#banRangeSecond").prop('checked')
        const checkedThird = this.$el.find("#banRangeThird").prop('checked')

        if (!checkedFirst && !checkedSecond) {
            this.$el.find("#banRangeThird").attr('disabled', false)
        } else {
            this.$el.find("#banRangeThird").attr('disabled', true)
        }

        if (checkedThird) {
            this.$el.find("#banRangeFirst").attr('disabled', true)
            this.$el.find("#banRangeSecond").attr('disabled', true)
        } else {
            this.$el.find("#banRangeFirst").attr('disabled', false)
            this.$el.find("#banRangeSecond").attr('disabled', false)
        }
    },

    format(data) {
        let { banState, banRange, banRangeFirst, banRangeSecond, banRangeThird } = data

        const banStateText = banStateLists[banState] || ''

        // 默认回显禁言范围，并且在选中时单聊（内容）和无disabled属性互斥
        switch (banRange) {
        case '-1':
            banRangeFirst = ''
            // banRangeSecond = ''
            banRangeThird = 'checked'
            break
        case '0':
            banRangeFirst = ''
            // banRangeSecond = ''
            banRangeThird = 'checked'
            break
        case '1':
            banRangeFirst = 'checked'
            // banRangeSecond = ''
            banRangeThird = ''
            break
        case '2':
            banRangeFirst = ''
            // banRangeSecond = 'checked'
            banRangeThird = ''
            break
        case '1、2':
            banRangeFirst = 'checked'
            // banRangeSecond = 'checked'
            banRangeThird = ''
            break
        default:
            break
        }
        return Object.assign(data, { banStateText, banRangeFirst, banRangeSecond, banRangeThird })
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
        this.partialClikable()
    },
})

export { Modify }