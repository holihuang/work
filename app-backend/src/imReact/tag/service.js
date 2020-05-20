/*
* @file: IM打标签 ajax
* @author: huanghaolei
* date: 2018-6-19
*
* */
import { ajax } from 'getJSON'

//学院标签
const getOrderDetailTagListByBelongId = params => {
    return ajax('/community-manager-war/singleChatManager/getOrderDetailTagListByBelongId.action', params)
}

//操作记录
const getOrderDetailTagListByOrdDetailId = params => {
    return ajax('/community-manager-war/singleChatManager/getOrderDetailTagListByOrdDetailId.action', params)
}

//保存
const saveOrderDetailTag = params => {
    return ajax('/community-manager-war/singleChatManager/saveOrderDetailTag.action', params)
}

export default {
    getOrderDetailTagListByBelongId,
    getOrderDetailTagListByOrdDetailId,
    saveOrderDetailTag,
}
