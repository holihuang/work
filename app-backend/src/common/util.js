/*
 * @file 该文件包含一些通用的函数
 * @author hualuyao
 */
import { common } from './common'

const util = {
    slog: (eventName, params) => {
        const userInfo = common.getUserInfo()

        try {
            if (window.slog) {
                window.slog.dot(eventName, { // event id
                    userId: userInfo.userId,
                    userAccount: userInfo.userAccount,
                    ...params,
                })
            }
        } catch(e) {
            console.error('slog script load fail.')
        }
    },
}

export default util
