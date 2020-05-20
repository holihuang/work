import { transferEmotionTextToImg } from '../../../../common/emotionUtil'

const tpl = require('./tpl.html')

const Model = window.Backbone.Model.extend({
    defaults: {},
})

const DeltMessageList = window.Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        this.listenTo(this.model, 'change:resultList', this.render)
        this.model.set({ ...options })
    },

    events: {

    },

    format(data) {
        const { resultList } = data
        resultList.forEach((item, index) => {
            // 校验[XXX]格式
            // const regFormat = new RegExp(/\[[\s\S]+\]/);
            // const reg = new RegExp(/\[[^\[\]]+\]/g);
            const { messageType } = item

            switch (+messageType) {
            // 文本
            case 1:
                item.chatContent = transferEmotionTextToImg(item.chatContent)
                break
            case 100:
                // 快捷回复 后端已处理好chatContent
                break
            case 96:
                const iwCnt = item.chatContent
                    ? item.chatContent.content
                    : ''

                item.chatContent = `【班主任通知】${iwCnt}`

                item.isIwMsg = true // 是班主任通知群发
                break
            // 图片
            case 3:
                item.isPicture = true
                break
            // 文件
            case 4:
                item.fileName = item.chatContent.fileName
                item.isFile = true
                break
            default:
                break
            }
        })

        return Object.assign(data, { resultList })
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
        return this
    },
})

export { DeltMessageList }
