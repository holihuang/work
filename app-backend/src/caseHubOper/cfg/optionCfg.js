/*
** @file: optionCfg
** @author:huanghaolei
** @date: 2019-06-27
*/
export default {
    contentLabelList: ['学习成果类', '学员访谈类', '学习方法类', '名师专访类', '师生故事类', '自考励志类', '自考资讯类', '自考科普类', '晨读好文'],
    postSourceList: ['PGC', 'UGC', '媒体号'],
    publishStateList: [{
        label: '展示中',
        value: 0,
    }, {
        label: '隐藏',
        value: 1,
    }],
    filterOptions: [
        { key: 'id', type: 'number', defaults: -1 },
        { key: 'title' },
        { key: 'contentLabel' },
        { key: 'postSource' },
        { key: 'showStatus' },
        { key: 'startTime' },
        { key: 'endTime' },
        { key: 'showPostion' },
        { key: 'iconType' },
    ],
    iconTypeList: [{
        label: '未设置',
        value: 0,
    }, {
        label: '新故事',
        value: 1,
    }],
}
