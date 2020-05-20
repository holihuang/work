
/**
 * @file 校验模板
 *
 * @author gushouchuang
 * @date 20200205
 */

module.exports = {
    __type: 'object',
    __required: [
        'countPerPage',
        'pageCount',
        'pageIndex',
        'totalCount',
        'resultList',
    ],
    countPerPage: 'number',
    pageCount: 'number',
    pageIndex: 'number',
    totalCount: 'number',
    resultList: {
        __type: 'array',
        __required: [
            'id',
            'postId',
            'title',
            'studentId',
            'studentName',
            'contentLabel',
            'postSource',
            'postCreateTime',
            'showStatus',
            'showWeight',
            'postUrl',
            'iconType',
        ],
        id: 'number',
        postId: 'number',
        title: 'string',
        studentId: 'number',
        studentName: 'string',
        contentLabel: 'array',
        postSource: 'string',
        postCreateTime: 'string',
        showStatus: 'number',
        showWeight: 'number',
        postUrl: 'string',
        iconType: 'number',
    },
}
