import {chatInfoModelUtil} from '../messageManage/conversation/chatInfo';
import {common} from './common';

const openFuncList = [];
const messageFuncList = [];
const closeFuncList = [];

class WsUtilTool {
    constructor(options = {}) {
        const {wsUrl, onOpen, onMessage, onClose, autoReconnect = true, reconnectTimes = 4} = options;
        this.wsUrl = wsUrl;
        openFuncList.push(onOpen);
        messageFuncList.push(onMessage);
        closeFuncList.push(onClose);
        this.init();
        this.leftTimes = reconnectTimes;
    }

    init(isFirst = true) {
        const startTime = new Date();

        const online = chatInfoModelUtil.model.get('online');
        this.ws = new WebSocket(`${this.wsUrl}&online=${online}`);
        this.ws.onopen = _ => {
            //记录ws连接耗时
            const endTime = new Date();
            try {
                if (endTime - startTime > 2000) {
                    //大于2s，上报
                    BJ_REPORT.report('本次连接耗时为：' + (endTime - startTime));
                }
            } catch(e) {
                //do nothing
            }

            this.startHeartBeat(); //开始心跳
            this.handleWsOpen(isFirst);
        }
        // isFirst && (this.ws.onopen = this.handleWsOpen);
        this.ws.onmessage = e => {
            const {command, data} = common.parseJSON(e.data);
            if (command === 'KICK_NOTICE') {
                this.stopHeartBeat();
                this.forceClose();
                return;
            }
            this.handleWsMessage(e);
        }

        this.ws.onclose = this.handleWsClose;
    }

    startHeartBeat() {
        this.heartbeatInterval = setInterval(_ => {
            if (this.ws.readyState === 1) {
                // this.ws.send('1');
                this.send({
                    command: 'ALIVE_ACK',
                    data: {
                        online: +chatInfoModelUtil.model.get('online'),
                        imUserId: +common.getUserInfo().imUserId,
                    }
                });
            }

            this.timer && clearTimeout(this.timer);
            this.timer = setTimeout(_ => {
                this.ws.close();
            }, 20000) //如果20s后没有收到后端返回，则判定当前连接断掉了

        // }, 30000); //每30s发送一次心跳
        }, 25 * 1000); // 每25s发送一次心跳
    }

    stopHeartBeat() {
        this.heartbeatInterval && clearInterval(this.heartbeatInterval);
    }

    handleWsOpen = isFirst => {
        this.isPending = true
        isFirst && (openFuncList.forEach(func => func && func()));
        const userAccountPrefix = (window.userInfo.userAccount || '').replace('@sunlands.com', '')
        // 如果Cookie中有关于单通道的老师stat状态值记录，且为0（离线）
        const online = common.getCookie(`wsSingleStat-${userAccountPrefix}`) === '0' ? 0 : 1

        chatInfoModelUtil.model.set({
            online
        })

        this.send({
            command: 'UPDATE_TEACHER_STATUS',
            data: {
                online,
                imUserId: +common.getUserInfo().imUserId
            }
        });

        try {
            BJ_REPORT.info(new Date() + 'WS OPEN and online status is' + online);
        } catch(e) {
            //do nothing
        }
    }

    handleWsMessage = e => {
        this.timer && clearTimeout(this.timer);

        messageFuncList.forEach(func => func && func(e));
    }

    handleWsClose = _ => {
        console.log('close');
        try {
            BJ_REPORT.info(new Date() + 'WS CLOSE');
        } catch(e) {
            //do nothing
        }

        this.stopHeartBeat();

        this.isPending = false;
        //自动重连
        if (this.leftTimes--) {
            this.init(false);
            return;
        }

        closeFuncList.forEach(func => func && func(this.isNormalClose));
    }

    forceClose() {
        //强制退出
        this.leftTimes = 0;

        this.isNormalClose = true;

        this.ws.close();
    }

    send = (data, callback) => {
        if (this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(data));

            if (typeof callback === 'function') {
                callback();
            }

            return true;
        }

        alert('连接已断开，请刷新重试！');
    }

    register({onOpen, onMessage, onClose}) {
        onOpen && openFuncList.push(onOpen);
        onMessage && messageFuncList.push(onMessage);
        onClose && closeFuncList.push(onClose);

        return {
            open: openFuncList.length - 1,
            message: messageFuncList.length - 1,
            close: messageFuncList.length - 1
        }
    }

    removeListener(eventIndex) {
        const {open, message, close} = eventIndex;
        const indexArr = [open, message, close];
        [openFuncList, messageFuncList, closeFuncList].forEach((arr, index) => arr.splice(indexArr[index], 1, null));
    }
}

let ws;

const wsUtil = function(options) {
    let eventIndex = {};
    if (!ws) {
        ws = new WsUtilTool(options);
    } else {
        //事件
        const {onOpen, onMessage, onClose} = options;
        eventIndex = ws.register({
            onOpen,
            onMessage,
            onClose
        });
    }

    return {
        ws,
        eventIndex
    };
}

wsUtil.isPending = function() {
    return ws && ws.isPending;
}


export {wsUtil}
