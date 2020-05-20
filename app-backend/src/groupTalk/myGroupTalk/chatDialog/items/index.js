import { common } from '../../../../common/common'
import { transferEmotionTextToImg } from '../../../../common/emotionUtil'
import { AudioPlayer } from '../../../../common/audioPlayer'

const tpl = require('./tpl.html')

const NOT_SHOW_LABEL = ['普通学员', '老师']

const Model = window.Backbone.Model.extend({
    defaults: {

    },
})

const Items = window.Backbone.View.extend({
    initialize(options) {
        const {
            messageList, latestTime, needInsertTimeMsg,
        } = options
        this.model = new Model()
        // 防止对原有数据产生影响，这里用副本
        this.model.set({
            latestTime,
            needInsertTimeMsg,
            messageList: JSON.parse(JSON.stringify(messageList)),
        })
        this.render()
    },

    events: {
        'click .audio': 'play',
    },

    play(e) {
        const src = $(e.currentTarget).attr('src')
        const d = new AudioPlayer({
            src,
        })
        console.log(d)
    },

    format(data) {
        const { messageList = [], latestTime, needInsertTimeMsg } = data
        // messageList为按时间倒排，第一条为最新的消息
        // 我们渲染时为从上到下，最上应为最老的消息
        // 所以首先将messageList反转
        messageList.reverse()
        messageList.forEach((item, index) => {
            const {
                imUserId, chatContent, messageType, displayMode = 1,
            } = item

            if (+imUserId === +common.getUserInfo().imIdForGroup) {
                item.isSend = true
            } else {
                item.isSend = false
                if (item.memberDegree && item.memberDegree.label) {
                    if (NOT_SHOW_LABEL.indexOf(item.memberDegree.label) === -1) {
                        item.memberDegreeName = item.memberDegree.label
                    }
                }
            }

            switch (messageType) {
            case 17: // 1
                item.chatContentFormatted = transferEmotionTextToImg(chatContent)
                item.isNormal = true
                break
                // 合并这两项
            case 19: // 2
            case 23: // 8
                item.chatContentFormatted = `<img src="${chatContent}" style="max-width: 200px;" class="chat-img">`
                item.isImg = true
                break
                // 合并这两项
            case 20: // 3
            case 21: // 5
                item.chatContentFormatted = ''
                item.isFile = true

                let fileInfo
                if (typeof item.chatContent === 'string') { // ws 返回
                    fileInfo = JSON.parse(item.chatContent)
                } else { // ajax返回
                    fileInfo = item.chatContent
                }

                const { fileName, fileSize } = fileInfo

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
                case 'MP4':
                    item.fileTypeClass = 'file-mp4'
                    break
                default:
                    item.fileTypeClass = 'file-default'
                    break
                }

                item.fileName = fileName

                // 转化成M为单位
                const Mb = 1024 * 1024
                item.fileSize = (fileSize / Mb)
                item.fileSize = `${item.fileSize.toFixed(2)}MB`

                break
            case 18: // 4
                let audioFileInfo
                if (typeof item.chatContent === 'string') { // ws 返回
                    audioFileInfo = JSON.parse(item.chatContent)
                } else { // ajax返回
                    audioFileInfo = item.chatContent
                }

                item.fileUrl = audioFileInfo.mp3FileUrl || audioFileInfo.linkUrl || audioFileInfo.fileUrl
                item.chatContentFormatted = ''
                item.isAudio = true
                item.duration = `${audioFileInfo.duration}"`
                break
            case 6: // 不动
                item.isNotify = true
                break
            case 22: // 7
                item.chatContentFormatted = '暂不支持此消息类型，请去app查看~'
                item.isNormal = true
                break
            case 32: // 撤回的操作消息  不显示 但是把原消息替换成XXX撤回了一条消息
                $(`.chatting-item-${item.chatContent}`).replaceWith(`<div class="revoke-text">${item.isSend ? '您' : item.userNickname}撤回了一条消息</div>`)
                item.isOperateMsg = true
                break
            case 33: // 屏蔽的操作消息  不显示
                item.isOperateMsg = true
                break
            default:
                break
            }

            switch (displayMode) {
            // 1表示正常，2表示敏感词 3表示撤回，4表示屏蔽
            case 3:
                item.isRevoke = true
                break
            case 4:
                item.isShield = true
                // 加一个注释 为何发版不是最新 TODO待删
                item.messageStatus = 1 // 屏蔽的信息，右键不让再屏蔽
                break
            default:
                break
            }
        })

        if (messageList.length) {
            const _oldestTime = messageList[0].sendTime

            if ((new Date(_oldestTime) - new Date(latestTime) > 1000 * 60 * 2) || needInsertTimeMsg) {
                // 处理时间
                let currentIndex = 0
                const indexArr = []
                indexArr.push(currentIndex)
                messageList.forEach((item, index) => {
                    const currentTime = messageList[currentIndex].sendTime
                    const d1 = new Date(item.sendTime)
                    const d2 = new Date(currentTime)
                    if (d1 - d2 > 1000 * 60 * 2) {
                        // 相差大于两分钟
                        currentIndex = index
                        indexArr.push(currentIndex)
                    }
                })

                for (let i = 0, len = indexArr.length; i < len; i += 1) {
                    const time = messageList[indexArr[i]].sendTime
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
        }
        return data
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
    },
})

export { Items }
