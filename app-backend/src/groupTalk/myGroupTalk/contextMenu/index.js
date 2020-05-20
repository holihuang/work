import {common} from '../../../common/common'
import {service} from '../../../common/service'
import moment from 'moment';

var tpl = require('./tpl.html')

const OPERATECONSTANT = {
    '1': {
        btnText:'屏蔽',
        confirmText: '是否屏蔽该消息？屏蔽后该消息只对该学员和群主可见。',
    },
    '2': {
        btnText:'撤回',
        confirmText: '是否撤回该消息？撤回后不可恢复',
    },
}
const SHIELD_TIP = '<div style="color:#f26f21;padding-top: 15px;">（该条消息已屏蔽）</div>'
const WITHDRAW_TIP = '<div class="revoke-text">您撤回了一条消息</div>'
const LOADIMG_MSG = '<img class="msg-loading" src="./assets/f3360f24481fa410c23d518c30bcd801.gif"/>'
var Model = Backbone.Model.extend({
    defaults: {
        left: 0,
        top: 0,
    }
})

var ContextMenu = Backbone.View.extend({
    initialize: function(options) {
        let { left, top, groupId, groupName, imUserId, messageId, messageType, chatContent, btnType, sendtime, msgWrap, withDrawCallback, showRelay, send } = options
        this.model = new Model()
        this.model.set({
            left,
            top,
            groupId,
            groupName,
            imUserId,
            messageId,
            messageType,
            btnType,
            sendtime,
            msgWrap,
            chatContent,
        })

        this.send = send
        this.showRelay = showRelay
        this.withDrawCallback = withDrawCallback
        this.render()
    },

    events: {
        'click': 'close',
        'click #operateMsg': 'msgOperate',
        'click #showRelay': 'clickRelay', // 转发
        
    },

    msgHideRs(data) {
        const response = data
        if (response.rs) {
            const { msgWrap, btnType } = this.model.toJSON()
            alert(`${OPERATECONSTANT[btnType].btnText}成功！`)
            $(msgWrap).attr('data-messagestatus',1).after(SHIELD_TIP)
            this.close()
        } else {
            alert(response.rsdesp)
        }
    },

    // 转发
    clickRelay () {
        const data = this.model.toJSON()
        this.showRelay(data)
    },

    msgOperate(e) {
        const { groupId, groupName, imUserId: imStuId, messageId, messageType, btnType, msgWrap} = this.model.toJSON()
        const { userAccount } = common.getUserInfo()
        const imUserId = common.getUserInfo().imIdForGroup
        if(!confirm(OPERATECONSTANT[btnType].confirmText)){
            return
        }
        
        switch(btnType) {
            case '1':

                this.send({
                    command: 'HIDE_MSG',
                    data: {
                        groupId,
                        groupName,
                        imUserId, //操作人的imid
                        imStuId, //消息发送人的imid
                        messageId,
                        messageType,
                        userAccount,
                    }
                })

                // service.operateMessage({
                //     groupId,
                //     groupName,
                //     imUserId, //操作人的imid
                //     imStuId, //消息发送人的imid
                //     messageId,
                //     messageType,
                //     userAccount,
                // }, (response) => {
                //     if (response.rs) {
                //         alert(`${OPERATECONSTANT[btnType].btnText}成功！`)
                //         $(msgWrap).attr('data-messagestatus',1).after(SHIELD_TIP)
                //         this.close()
                //     } else {
                //         alert(response.rsdesp)
                //     }
                // })
                break
            case '2':
                const loadingItem = $(LOADIMG_MSG)
                $(msgWrap).after(loadingItem)
                this.close()
                this.withDrawCallback({ 
                    messageId, 
                    imUserId, 
                    revokeSuccessCallback: ({successFlag = 1}) => {
                        loadingItem.remove()
                        successFlag === 1 && $(msgWrap).parents('.chatting-item').html(WITHDRAW_TIP)
                    } })
                break
            default:
                break
        }   
        
    },

    close() {
        this.undelegateEvents()
        $('.right-menu').remove()
        $('#messagesPanel').css('overflow-y', 'auto')
    },

    format(data) {
        const { btnType, sendtime, messageType } = data
        data.btnText = OPERATECONSTANT[btnType].btnText
        // 显示转发
        if (btnType == '2') {
            if (messageType == '17' || messageType == '19') {
                data.showRelay = true
            } else {
                data.showRelay = false
            }
        } else {
            data.showRelay = false
        }
        
        
        // 显示撤回和屏蔽
        if(btnType == 2) {
            const fen = moment().diff(moment(sendtime),'minutes');
            data.showBack = fen < 2
        } else if (btnType == 1) {
            data.showBack = true 
        }
        return data
    },

    render: function() {
        let data = this.format(this.model.toJSON())
        this.$el.append(tpl(data))
    }
})

export {ContextMenu}
