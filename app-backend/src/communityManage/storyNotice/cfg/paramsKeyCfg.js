/*
**@file: paramsKeyCfg
**@author: huanghaolei
**date: 2019-10-21
*/
export default {
    // 新建接口字段信息--为了和查询接口字段区分开，对新建接口字段加_Add标识符，新建接口统还原
    addParamsKeyArr: [
        {
            key: 'pushTitle_Add', isRequired: true, text: '通知标题', needTrim: true,
        }, {
            key: 'pushContent_Add', isRequired: true, text: '通知内容', needTrim: true,
        },
        { key: 'contentType_Add', text: '学员故事' }, { key: 'contentId_Add', text: '内容id', isRequired: true },
        { key: 'channel_Add', text: '渠道参数', isRequired: true }, { key: 'file_Add', text: '推送名单', isRequired: true },
        { key: 'pushTime_Add', isRequired: true, text: '推送时间' },
        { key: 'remark_Add', text: '备注', needTrim: true },
    ],
    // 查询接口字段
    queryParamsKeyArr: [
        { key: 'pushTitle' }, { key: 'operator' },
        { key: 'pushTimeStart' }, { key: 'pushTimeEnd' },
        { key: 'pageNo' }, { key: 'pageSize' },
    ],
}
