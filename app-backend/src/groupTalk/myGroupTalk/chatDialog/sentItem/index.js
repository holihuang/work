import moment from 'moment'
import { transferEmotionTextToImg } from '../../../../common/emotionUtil'
import { AudioPlayer } from '../../../../common/audioPlayer'

const tpl = require('./tpl.html')

const Model = window.Backbone.Model.extend({
    defaults: {
        status: 0, // 0|1|2 --- 正在发送|成功|失败，默认为正在发送状态
        type: 1, // 消息类型 1|2|3|4 文本|图片|文件|音频 默认为文本类型
        chatContent: '', // 消息内容
        latestTime: 0, // 当前最新消息的发送时间
    },
})

const SentItem = window.Backbone.View.extend({
    initialize(options) {
        const {
            chatContent, teacherUrl, teacherNickname, latestTime, type = 1,
        } = options
        this.model = new Model()
        this.listenTo(this.model, 'change', this.render)
        this.model.set({
            chatContent,
            latestTime,
            type,
            teacherNickname,
            teacherUrl,
            currentTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        })
    },

    events: {
        'click .audio': 'play',
    },

    update(data) {
        const oriData = this.model.toJSON()
        this.model.set(Object.assign({}, oriData, data))
    },

    play(e) {
        const src = $(e.currentTarget).attr('src')
        const d = new AudioPlayer({
            src,
        })
        console.log(d)
    },

    format(data) {
        const {
            status, latestTime, currentTime, type, chatContent,
        } = data
        data.sendTime = currentTime
        switch (status) {
        case 0:
            data.isUploading = true
            break
        case 1:
            data.isSuccess = true
            break
        case 2:
            data.isFailed = true
            break
        default:
            break
        }

        switch (type) {
        case 17: // 1
            data.chatContentFormatted = transferEmotionTextToImg(chatContent)
            data.isNormal = true
            break
        case 19: // 2
            data.chatContentFormatted = `<img src="${chatContent}" style="max-width: 200px;" class="chat-img">`
            data.isImg = true
            break
            // 合并这两项
        case 20: // 3
        case 21: // 5
            data.chatContentFormatted = ''
            data.isFile = true

            const { fileName, fileSize, fileUrl } = chatContent
            const fileType = fileName.substr(fileName.lastIndexOf('.') + 1).toUpperCase()
            switch (fileType) {
            case 'DOC':
                data.fileTypeClass = 'file-docx'
                break
            case 'DOCX':
                data.fileTypeClass = 'file-docx'
                break
            case 'PPT':
                data.fileTypeClass = 'file-ppt'
                break
            case 'PPTX':
                data.fileTypeClass = 'file-ppt'
                break
            case 'XLS':
                data.fileTypeClass = 'file-xlsx'
                break
            case 'XLSX':
                data.fileTypeClass = 'file-xlsx'
                break
            case 'PDF':
                data.fileTypeClass = 'file-pdf'
                break
            case 'MP4':
                data.fileTypeClass = 'file-mp4'
                break
            default:
                data.fileTypeClass = 'file-default'
                break
            }

            // 文件大小处理
            // 转化成M为单位
            const Mb = 1024 * 1024
            data.fileSize = (fileSize / Mb)
            data.fileSize = `${data.fileSize.toFixed(2)}MB`

            data.fileName = fileName
            data.fileUrl = fileUrl
            break
        case 18: // 4
            data.fileUrl = chatContent.fileUrl
            data.duration = chatContent.duration ? `${chatContent.duration}"` : ''
            data.chatContentFormatted = ''
            data.isAudio = true
            break
        default:
            break
        }

        if (moment(currentTime) - moment(latestTime) > 2 * 60 * 1000) {
            data.shouldShowTime = true
        }

        // 添加消息类型
        data.messageType = type

        return data
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
    },
})

export { SentItem }
