/**
 * @file 通知
 * @author hualuyao
 */
import {envCfg} from './envCfg';

const createNotification = function(options) {
    Notification.requestPermission(function(permission) {
        var content = options.content;
        var avatar = `${envCfg.imgBaseUrl}${options.chatUserId}/${options.chatUserId}.jpg`;

        var config = {
            body: content,
            dir: 'rtl',
            icon: avatar
        };

        var notification = new Notification(options.chatUserName = '通知', config);
        notification.onclick = function() {
            window.focus();
            $('#myConversation')[0].click();
            setTimeout(function() {
                typeof options.callback == 'function' ? options.callback() : '';
            }, 200);
        }
        setTimeout(function(){
            notification.close();
        }, 5000) //5s后关闭通知提示
    })
}

export {createNotification}