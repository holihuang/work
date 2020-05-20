import moment from 'moment'
// import {envCfg} from '../../../../common/envCfg'
import { common } from '../../../../common/common'
import { transferEmotionTextToImg } from '../../../../common/emotionUtil'
// import {service} from '../../../../common/service'
import { chatInfoModelUtil } from '../../chatInfo'

const needToLoadAvatar = true

const tpl = require('./tpl.html')

const Items = window.Backbone.View.extend({
    initialize(options = {}) {
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
            if (+day === nDay - 1) {
                // 昨天发的帖子
                rs = `昨天${moment(time).format('HH:mm')}`
                return rs
            }

            return moment(time).format('MM-DD HH:mm')
        }

        return moment(time).format('YYYY-MM-DD HH:mm')
    },

    format(data) {
        const teacherAvatar = chatInfoModelUtil.model.get('avatar')
        const enterRole = chatInfoModelUtil.model.get('role')

        const { messageList = [], teacherImId, studentImId } = data

        messageList.reverse()

        // 处理每条消息类型
        messageList.forEach((item, index) => {
            const { messageType, chatContent } = item

            switch (messageType) {
            case 1:
                item.isText = true
                // 处理表情
                item.chatContent = transferEmotionTextToImg(item.chatContent)
                break
            case 3:
                item.isImg = true
                item.chatContent = `<img src="${chatContent}" style="max-width: 200px;" class="chat-img">`
                break
            case 4:
                item.isFile = true

                try {
                    const { fileName = '文件', fileSize = 0 } = JSON.parse(chatContent)
                    const fileType = fileName.substr(fileName.lastIndexOf('.') + 1).toUpperCase()
                    switch (fileType) {
                    case 'DOC':
                        item.fileTypeClass = 'file-docx'
                        break
                    case 'DOCX':
                        item.fileTypeClass = 'file-docx'
                        break
                    case 'PPT':
                        item.fileTypeClass = 'file-ppt'
                        break
                    case 'PPTX':
                        item.fileTypeClass = 'file-ppt'
                        break
                    case 'XLS':
                        item.fileTypeClass = 'file-xlsx'
                        break
                    case 'XLSX':
                        item.fileTypeClass = 'file-xlsx'
                        break
                    case 'PDF':
                        item.fileTypeClass = 'file-pdf'
                        break
                    default:
                        item.fileTypeClass = 'file-default'
                        break
                    }

                    // 文件大小处理
                    item.fileSize = `${(fileSize / 1024).toFixed(2)}KB`
                    item.fileName = fileName
                } catch (e) {
                    console.log(e)
                }

                break
            case 96: // 班主任工作台群聊
                item.isText = true
                const iwCnt = item.chatContent
                    ? JSON.parse(item.chatContent).content
                    : ''

                const prepareCnt = iwCnt.length > 50
                    ? `${iwCnt.substring(0, 50)}...`
                    : iwCnt
                // 处理表情
                item.chatContent = `【班主任通知】${prepareCnt}`
                break
            case 100: // 快捷回复
                item.isText = true
                const { linkName = '' } = JSON.parse(item.chatContent || '{}')
                item.chatContent = `【快捷跳转链接】${linkName}`
                break
            default:
                break
            }

            // 发送方
            const { fromImUserId } = item
            const isSend = +fromImUserId === +common.getUserInfo().imUserId
            item.isSend = isSend

            // 发送老师的头像
            if (isSend) {
                item.teacherAvatar = item.fromUserImage || teacherAvatar
            }

            // 班主任管理默认是班主任角色，新增机器人角色
            if (enterRole === 'teacher') {
                item.isTeacher = +item.fromIdentity !== 6
            }

            // 值班老师管理默认值班老师角色，新增机器人角色
            if (enterRole === 'dutyteacher') {
                item.isDutyTeacher = +item.fromIdentity !== 6
            }


            item.itemClass = isSend ? 'sent-item' : 'received-item'
            item.avatarWrapperClass = isSend ? 'item-right' : 'item-left'
            item.avatar = item.fromUserImage
            // item.avatar = `${envCfg.imgBaseUrl}${item.fromUserId}/${item.fromUserId}.jpg`;
            item.contentWrapperClass = isSend ? 'item-left' : 'item-right'
            item.index = index

            // 是否是转接的会话，需要显示值班老师的名字和263账号
            item.showTeacherName = (+fromImUserId !== +teacherImId) && (+fromImUserId !== +studentImId)
        })

        // 加入时间
        if (messageList.length) {
            // 处理时间
            let currentIndex = 0
            const indexArr = []
            indexArr.push(currentIndex)
            messageList.forEach((item, index) => {
                const currentTime = messageList[currentIndex].sendTime

                const d1 = new Date(item.sendTime)
                const d2 = new Date(currentTime)

                const THREE_MINUTE = 1000 * 60 * 3
                if (d1 - d2 > THREE_MINUTE) {
                    // 相差大于3分钟
                    currentIndex = index
                    indexArr.push(currentIndex)
                }
            })

            for (let i = 0, len = indexArr.length; i < len; i += 1) {
                const time = this.formatTime(messageList[indexArr[i]].sendTime)
                messageList.splice(indexArr[i], 0, {
                    isTime: true,
                    time,
                })

                // 所有后续index++
                for (let k = i; k < len; k += 1) {
                    indexArr[k] += 1
                }
            }
        }

        return data
    },

    render() {
        const data = this.format(this.options)
        this.$el.html(tpl({
            ...data,
            needToLoadAvatar,
        }))
    },
})

export { Items }
