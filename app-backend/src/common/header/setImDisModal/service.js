/**
 * @file IM留言分配
 *
 * @auth gushouchuang
 * @date 2018-5-23
 */

import { ajax } from 'getJSON'

const adminGetMsgOperator = params =>
    ajax('/community-manager-war/singleChatManager/adminGetMsgOperator.action', params)

const adminSetMsgOperator = params =>
    ajax('/community-manager-war/singleChatManager/adminSetMsgOperator.action', params)

export default {
    adminGetMsgOperator,
    adminSetMsgOperator,
}
