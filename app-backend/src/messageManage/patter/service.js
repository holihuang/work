/**
 * @file
 *
 * @auth gushouchuang
 * @date 2018-9-13
 */

import { ajax } from 'getJSON'

const getAllQuickReplys = params => {
    return ajax('/community-manager-war/teachermessage/getAllQuickReplys.action', params)
}

const getQuickReplyLabels = params => {
    return ajax('/community-manager-war/teachermessage/getQuickReplyLabels.action', params)
}

const deleteQuickReply = params => {
    return ajax('/community-manager-war/teachermessage/deleteQuickReply.action', params)
}

const topQuickReply = params => {
    return ajax('/community-manager-war/server/teachermessage/topQuickReply', params)
}

const addQuickReply = params => {
    return ajax('/community-manager-war/teachermessage/addQuickReply.action', params)
}

const editQuickReply = params => {
    return ajax('/community-manager-war/teachermessage/editQuickReply.action', params)
}

export default {
    getAllQuickReplys,
    getQuickReplyLabels,
    deleteQuickReply,
    topQuickReply,
    addQuickReply,
    editQuickReply,
}
