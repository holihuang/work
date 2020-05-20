import { ajax } from 'getJSON'

// 获取智能搜索开关的状态（新增）
const getIntelligentSearch = params =>
    ajax('/community-manager-war/server/teachermessage/adminAssistStatus.action', params, { requestLock: false })

// 设置智能搜索开关的状态（新增）
const setIntelligentSearch = params =>
    ajax('/community-manager-war/server/teachermessage/adminSearchAssist.action', params)

    // 搜索
const adminGetAllQuickReplys = params =>
    ajax('/community-manager-war/server/teachermessage/adminGetAllQuickReplys.action', params)

    // 获取问答辅助开关的状态（新增）
const getAdminGetQuestionStatus = params =>
    ajax('/community-manager-war/server/teachermessage/adminGetQuestionStatus.action', params)

export default {
    getIntelligentSearch,
    setIntelligentSearch,
    adminGetAllQuickReplys,
    getAdminGetQuestionStatus,
}
