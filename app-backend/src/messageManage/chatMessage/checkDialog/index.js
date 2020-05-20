import { service } from '../../../common/service'
// import { common } from '../../../common/common'
import { transferEmotionTextToImg } from '../../../common/emotionUtil'
import { DeltMessageList } from './deltMessageList/index'

const tpl = require('./tpl.html')

const CONSULT_ID = 0
const MESSAGE_ID = 0

const Model = window.Backbone.Model.extend({
    defaults: {
        resultList: [],
        deltResultList: [],
        consultId: CONSULT_ID,
        messageId: MESSAGE_ID,
        canRequest: true,
    },
})

const CheckDialog = window.Backbone.View.extend({
    initialize(options) {
        this.model = new Model()
        this.listenTo(this.model, 'change:resultList', this.render)
        this.listenTo(this.model, 'change:deltResultList', this.renderRecentMessages)
        this.model.set({
            ...options,
        })
        this.render()
        this.initiaChatMessageList()
    },

    events: {
        'click .load-more-btn': 'getDeltChatMessageList',
    },

    initiaChatMessageList() {
        const that = this
        const { params, consultId, messageId } = that.model.toJSON()
        Object.assign(params, { consultId, messageId })
        that.$el.find('#chatRecordLoding').removeClass('hide')
        service.getHistoryMsg(params, response => {
            that.$el.find('#chatRecordLoding').addClass('hide')
            if (response.rs) {
                const resultList = response.resultMessage || []
                // consultId, messageId在resultList数组中的最后一项中含有
                that.model.set({
                    consultId: resultList[resultList.length - 1].consultId,
                    resultList,
                })
            } else {
                alert(response.rsdesp)
            }
        })
    },

    getDeltChatMessageList() {
        const that = this

        const {
            params, consultId, messageId, canRequest,
        } = that.model.toJSON()
        Object.assign(params, { consultId, messageId })
        if (canRequest) {
            that.model.set({ canRequest: false })
            that.$el.find('#chatRecordLoding').removeClass('hide')
            service.getHistoryMsg(params, response => {
                that.$el.find('#chatRecordLoding').addClass('hide')
                if (response.rs) {
                    const resultList = response.resultMessage || []
                    // consultId, messageId在resultList数组中的最后一项中含有
                    if (resultList.length) {
                        that.model.set({
                            consultId: resultList[resultList.length - 1].consultId,
                            deltResultList: resultList,
                            canRequest: true,
                        })
                    } else {
                        that.$el.find('.no-more-text').removeClass('hide')
                        that.$el.find('#loading-more').addClass('hide')
                    }
                } else {
                    alert(response.rsdesp)
                }
            })
        }
    },

    initiaScrollEvent() {
        const $scrollObj = this.$el.find('#checkChatRecord')
        const scrollObj = this.$el.find('#checkChatRecord')[0]
        $scrollObj.on('scroll', () => {
            // 可视区域距顶偏移量
            const { scrollTop, clientHeight, scrollHeight } = scrollObj
            if (scrollTop + clientHeight >= scrollHeight - 3) {
                // console.log('到达底部')
                this.getDeltChatMessageList()
            }
        })
    },

    renderRecentMessages() {
        const { deltResultList } = this.model.toJSON()
        if (deltResultList.length) {
            this.deltMessageList = new DeltMessageList({
                resultList: deltResultList,
            })
            // 添加增量数据前的滚动条的位置
            this.$el.find('#checkChatRecordWrapper').append(this.deltMessageList.el)
            // 滚动条回滚到添加增量数据前的位置
            this.model.set({ deltResultList: [] })
        }
    },

    format(data) {
        const { resultList } = data
        resultList.forEach((item, index) => {
            // 校验[XXX]格式
            // const regFormat = new RegExp(/\[[\s\S]+\]/)
            // const reg = new RegExp(/\[[^\[\]]+\]/g)
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
        this.initiaScrollEvent()
        return this
    },
})

export { CheckDialog }
