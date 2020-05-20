
/**
 * @file 校验模板
 *
 * @author gushouchuang
 * @date 2019-12-09
 */

module.exports = {
    __type: 'object',
    __required: [
        'pageIndex',
        'countPerPage',
        'pageCount',
        'totalCount',
        'data',
    ],
    pageIndex: 'number',
    countPerPage: 'number',
    pageCount: 'number',
    totalCount: 'number',
    data: {
        __type: 'array',
        __required: [
            'projectId',
            'projectNo',
            'title',
            'stuName',
            'coverImageUrl',
            'effectTime',
            'onlineStatus',
            'onlineStatusDesc',
        ],
        projectId: 'number',
        projectNo: 'string',
        title: 'string',
        stuName: 'string',
        coverImageUrl: 'string',
        effectTime: 'string',
        onlineStatus: 'string',
        onlineStatusDesc: 'string',
    },
}
