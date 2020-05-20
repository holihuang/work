/**
 * @file IM智能回复
 *
 * @auth zhangpengyu
 * @date 2018-5-19
 */

import { ajax } from 'getJSON'

const managerQuestionAssist = params =>
    ajax('/community-manager-war/singleChatManager/ManagerQuestionAssist.action', params)

// 获取智能搜索开关的状态（新增）
const getIntelligentSearch = params =>
    ajax('/community-manager-war/server/teachermessage/adminAssistStatus.action', params)

export default {
    managerQuestionAssist,
    getIntelligentSearch,
}
