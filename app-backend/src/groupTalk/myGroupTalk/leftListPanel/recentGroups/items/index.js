import moment from 'moment'

const tpl = require('./tpl.html')

// model
const Model = window.Backbone.Model.extend({
    defaults: {
        display: 1,
    },
})

// view
const Items = window.Backbone.View.extend({
    initialize(options) {
        const {
            messageList, activeGroupId,
        } = options
        this.model = new Model()
        this.listenTo(this.model, 'change', this.render)
        this.model.set({
            messageList,
            activeGroupId,
        })
    },

    formatTime(time) {
        let rs = ''
        if (!/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(time)) {
            return time
        }
        const now = new Date()
        const nYear = now.getFullYear()
        const nMonth = now.getMonth() + 1
        const nDay = now.getDate()

        const dayInfo = time.split(' ')[0]
        // const timeInfo = time.split(' ')[1]
        const year = dayInfo.split('-')[0]
        const month = dayInfo.split('-')[1]
        const day = dayInfo.split('-')[2]
        if (+year === +nYear && +month === +nMonth) {
            // 说明同年同月
            if (+day === +nDay) {
                // 今天发的帖子
                rs = moment(time).format('HH:mm')
                return rs
            }
            if (day === nDay - 1) {
                // 昨天发的帖子
                rs = `昨天${moment(time).format('HH:mm')}`
                return rs
            }
            return moment(time).format('MM-DD')
        }
        if (+year === +nYear) {
            // 今年发的帖子
            return moment(time).format('MM-DD')
        }

        return moment(time).format('YYYY-MM-DD')
    },

    loadImg() {
        this.$el.find('img').each(function () {
            const imgUrl = $(this).data('src')
            const img = new Image()
            img.onload = () => {
                $(this).parent().prepend(img)
                $(this).remove()
            }
            img.src = imgUrl
        })
    },

    format(data) {
        const { messageList = [], activeGroupId } = data

        messageList.forEach(item => {
            item.showMessageCount = !!item.messageCount
            // 由于新增了管理员身份，所以需要知道操作人是管理员（14）还是群主（1）
            item.userIsOwner = item.memberDegree && item.memberDegree.value === 1

            item.currentCheckedClass = +item.groupId === +activeGroupId ? 'current-checked-item' : ''

            // 处理置顶
            item.isTop = +item.onTop === 2
            item.topClass = item.isTop ? 'top-class' : ''

            if (item.replyType === 5) {
                item.isFailed = true
            }

            if (item.currentCheckedClass) { // 如果是激活用户，不显示未读消息数
                item.showMessageCount = false
            }

            const { display = 1 } = item
            item.display = display

            item.lastSendTime = this.formatTime(item.lastSendTime)

            item.groupNameFormatted = item.groupName.length > 10 ? `${item.groupName.substr(0, 9)}...` : item.groupName

            const { messageType } = item

            switch (messageType) {
            case 17: // 1
                item.isText = true
                break
            case 19: // 2
            case 23: // 8
                item.isImg = true
                break
            case 20: // 3
                item.isFile = true
                break
            case 18: // 4
                item.isAudio = true
                break
            case 21: // 5
                item.isVideo = true
                break
            case 22: // 7
                item.isText = true
                item.chatContent = '暂不支持此消息类型，请去app查看~'
                break
            case 32:
                item.isText = true
                item.isRevoke = true
                break
            default:
                break
            }
        })
        return { messageList }
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
        this.loadImg()
    },
})

export { Items }
