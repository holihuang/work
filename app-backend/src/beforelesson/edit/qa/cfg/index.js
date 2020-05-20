/**
 * @file cfg
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

export default {
    editText: {
        add: '新增',
        edit: '编辑',
    },




	pageSizeOptions: ['15', '30', '50'],
	liveProvider: [{
        label: '全部',
        value: '0',
    },
    {
        label: '展示互动',
        value: 'gensee',
    },
    {
        label: '欢拓',
        value: 'rye-teach',
    }],
    lessonStatus: [{
        label: '全部',
        value: 0,
    },
    {
        label: '待开始',
        value: 1,
    },
    {
        label: '直播中',
        value: 2,
    },
    {
        label: '已结束',
        value: 3,
    }]
}