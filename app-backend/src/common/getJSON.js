/*
 * @Author: zhangpengyu
 * @Date: 2018-01-18 16:20:49
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-03-07 14:42:47
 */

import {common} from './common';
import { getJSON } from 'dataservice'
import { envCfg } from './envCfg'

let reqList = {};
const thenFunc = _ => {
    return {
        then: _ => {
            return thenFunc()
        },
        catch: _ => {
            return thenFunc()
        }
    }
}
const ajax = function(url, data, theOptions = {}, dataType) {
    const userInfo = common.getUserInfo();
    // 是否允许重复发请求  默认true
    const { requestLock = true } = theOptions

    if (!data.creater) {
        data.creater = userInfo.userAccount;
    }

    data.updater = userInfo.userAccount;
    data.channelCode = data.channelCode || 'CS_BACKGROUND';
    const reqParams = JSON.stringify({url, data});
    if(!reqList[reqParams] || !requestLock) {
        let formData = new FormData();
        formData.append('data', JSON.stringify(data))
        reqList[reqParams] = getJSON(url, formData, theOptions, dataType).then((value) => {
            delete reqList[reqParams]
            return value
        },(value) => {
            delete reqList[reqParams]
            if(value.indexOf('Unexpected token') > -1) {
                value = '网络有点问题，请刷新页面试试'
            }
            return Promise.reject(value);
        })
        return reqList[reqParams]
    } else {
        return thenFunc()
    }
}


export default ajax;
export { ajax }
