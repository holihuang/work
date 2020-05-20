import { service } from '../../../../common/service'
import { common } from '../../../../common/common'
import { Dialog } from '../../../../components/dialog/index'
import tpl from './tpl.html'

let Model = Backbone.Model.extend({
    defaults: {
        totalNum: 0,
        arriveNum: 0,
        readNum: 0,
        flag_channel_dialog: false,
    },
})

let View = window.Backbone.View.extend({
    initialize(options) {
        // let {type, totalNum, arriveNum, readNum, fileSuccUrl, groupId} = options;
        let {appNoticeNumber, appArriveNumber, appReadNumber, appUnReadNumber, weixinNoticeNumber, weixinArriveNumber, weixinReadNumber, 
             weixinUnReadNumber, messageSource, groupId, batchTypeId} = options
        this.model = new Model()
        // this.model.set({type, totalNum, arriveNum, readNum, fileSuccUrl, groupId});
        this.model.set({
            appNoticeNumber, 
            appArriveNumber, 
            appReadNumber, 
            appUnReadNumber,
            weixinNoticeNumber, 
            weixinArriveNumber, 
            weixinReadNumber,
            weixinUnReadNumber,
            messageSource,
            groupId,
            batchTypeId,
        })
        this.listenTo(this.model, 'change:flag_channel_dialog', this.render);
        // 总数API
        if (+messageSource === 1) {
            this.initiaTotalNumber()
        }
        this.render()
    },

    events: {
        // 'click #exportArriveBtn': 'exportArrive',
        // 'click #exportReadBtn': 'exportRead',
        'click #exportAllBtn': 'exportGroupExcel',
    },

    initiaTotalNumber: function() {
        let flag_channel_dialog = false;
        const {groupId} = this.model.toJSON();
        service.getNotifyCount({groupId}, (response) => {
            if(response.rs) {
                const {allReadCount, allUnreadCount} = response.resultMessage;
                this.model.set({
                    allReadCount,
                    allUnreadCount,
                    flag_channel_dialog: true
                });
            } else {
                alert(response.rsdesp)
            }
        })  
    },

    // exportAll() {
    //     this.exportGroupExcel('NOTICE_NUMBER');
    // },

    // //导出到达人数
    // exportArrive() {
    //     this.exportGroupExcel('ARRIVE_NUMBER');
    // },

    // //导出已读人数
    // exportRead() {
    //     this.exportGroupExcel('READ_NUMBER');
    // },

    exportGroupExcel() {
        let {groupId, batchTypeId} = this.model.toJSON();
        service.exportGroupExcel({
            creater: common.getUserInfo().userAccount,
            channelCode: 'CS_BACKGROUND',
            groupId,
            batchTypeId
            // type: exportType,
            // messageSource: type === 'app' ? 0 : 1 
        }, (response) => {
            if (!response.rs) {
                alert(response.rsdesp);
            }
        })
    },

    format(data) {
        data.isApp = data.type === 'app' ? true : false;
        const messageSource = +this.model.get("messageSource");
        // if(!messageSource) {  
        //     let {appReadNumber, appUnReadNumber} = this.model.toJSON();
        //     data.allReadCount = appReadNumber;
        //     data.allUnreadCount = appUnReadNumber;
        // }

        const { appNoticeNumber, appReadNumber, appUnReadNumber, weixinNoticeNumber, weixinReadNumber, weixinUnReadNumber } = this.model.toJSON()

        data.showWxData = [1, 2].includes(messageSource)
        data.showAppData = [0, 1].includes(messageSource)

        switch (messageSource) {
        case 0:
            data.allNoticeNumber = appNoticeNumber
            data.allReadCount = appReadNumber
            data.allUnreadCount = appUnReadNumber
            break
        case 1: 
            data.allNoticeNumber = appNoticeNumber
            break
        case 2:
            data.allNoticeNumber = weixinNoticeNumber
            data.allReadCount = weixinReadNumber
            data.allUnreadCount = weixinUnReadNumber
            break
        default:
            break
        }

        return data
    },

    render() {
        const data = this.format(this.model.toJSON())
        this.$el.html(tpl(data))
    },
})

class ExportDialog {
    constructor(options) {
        this.view = new View(options)
        this.type = options.type
        this.show()
    }

    show() {
        new Dialog({
            // title: this.type === 'app' ? 'app通知人数' : '微信通知人数',
            title: '通知渠道详情',
            type: 4,
            content: this.view.$el,
            showFooter: false
        })
    }
}

export {ExportDialog}
