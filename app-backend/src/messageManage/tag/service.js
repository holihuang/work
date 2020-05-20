/**
 * @file
 *
 * @auth gushouchuang
 * @date 2018-9-13
 */

import { ajax } from 'getJSON'

const getQuickReplyLabels = params => {
    return ajax('/community-manager-war/teachermessage/getQuickReplyLabels.action', params)
}

const addQuickReplyLabel = params => {
    return ajax('/community-manager-war/server/teachermessage/addQuickReplyLabel', params)
}

const updateQuickReplyLabel = params => {
    return ajax('/community-manager-war/server/teachermessage/updateQuickReplyLabel', params)
}

const delQuickReplyLabel = params => {
    return ajax('/community-manager-war/server/teachermessage/delQuickReplyLabel', params)
}

const adminTopLabel = params => {
    return ajax('/community-manager-war/server/teachermessage/adminTopLabel', params)
}

export default {
    getQuickReplyLabels,
    addQuickReplyLabel,
    updateQuickReplyLabel,
    delQuickReplyLabel,
    adminTopLabel,
}
