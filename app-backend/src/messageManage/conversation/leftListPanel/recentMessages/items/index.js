import moment from 'moment'
import { envCfg } from '../../../../../common/envCfg'
import robotIcon from '../../../../../images/robot_icon.png'
import robotIconUnnormal from '../../../../../images/robot_icon_unnormal.png'

const failedList = {}

const tpl = require('./tpl.html')

// view
const Items = window.Backbone.View.extend({
    initialize(options) {
        this.options = options

        this.render()
    },

    formatTime(time) {
        let rs = ''
        if (!/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(time)) {
            return time
        }
        const now = new Date()
        const nYear = now.getFullYear()
        // const nMonth = now.getMonth() + 1
        const nDay = now.getDate()

        const dayInfo = time.split(' ')[0]
        // const timeInfo = time.split(' ')[1]
        const year = dayInfo.split('-')[0]
        // const month = dayInfo.split('-')[1]
        const day = dayInfo.split('-')[2]
        if (+year === +nYear) {
            // 说明同年同月
            if (+day === +nDay) {
                // 今天发的帖子
                rs = moment(time).format('HH:mm')
                return rs
            }
            if (+day === +nDay - 1) {
                // 昨天发的帖子
                rs = `昨天${moment(time).format('HH:mm')}`
                return rs
            }

            return moment(time).format('MM-DD HH:mm')
        }

        return moment(time).format('YYYY-MM-DD HH:mm')
    },

    destroy() {
        this.$el.find('.error').each(function() { // eslint-disable-line
            const userId = $(this).attr('userid')
            failedList[userId] = true
        })

        this.remove()
    },

    format(data) {
        const { messageList, orderDetailId } = data

        messageList.forEach((item, index) => {
            item.showMessageCount = item.orderDetailId != orderDetailId && !!item.messageCount // eslint-disable-line
            item.currentCheckedClass = item.orderDetailId == orderDetailId ? 'current-checked-item' : '' // eslint-disable-line
            item.time = this.formatTime(item.lastSendTime)
            item.messageTop = item.messageTop === 1
            item.topClass = item.messageTop ? 'top-class' : ''
            item.avatar = `${envCfg.imgBaseUrl}${item.userId}/${item.userId}.jpg`
            item.loadFailed = failedList[item.userId]

            // robot
            item.showRobotIcon = (+item.consultType === 2 || +item.consultType === 3)
            if (+item.consultType === 2) {
                item.robotIconUrl = robotIcon
            } else if (+item.consultType === 3) {
                item.robotIconUrl = robotIconUnnormal
            } else {
                item.robotIconUrl = ''
            }

            switch (item.messageType) {
            case 1:
            case 100: // 快捷回复
                item.text = item.chatContent
                break
            case 3:
                item.text = '[图片]'
                break
            case 4:
                item.text = '[文件]'
                break
            case 96:
                const iwCnt = item.chatContent
                    ? JSON.parse(item.chatContent).content
                    : ''

                item.text = `【班主任通知】${iwCnt}`
                break
            default:
                item.text = item.chatContent
                break
            }
        })

        return { messageList }
    },

    render() {
        const data = this.format(this.options)
        this.$el.html(tpl(data))
    },
})

export { Items }
