import { ajax } from 'getJSON'

// 获取子订单
const getStuOrderList = params =>
    ajax('/community-manager-war/im/getStuOrderList.action', params)

// 快捷回复列表
const getAdjectiveLinkList = params =>
    ajax('/community-manager-war/im/getAdjectiveLinkList.action', params)

// 获取快捷发送内容
const getLinkChatContent = params =>
    ajax('/community-manager-war/im/getLinkChatContent.action', params)

export default {
    getStuOrderList,
    getAdjectiveLinkList,
    getLinkChatContent,
}
