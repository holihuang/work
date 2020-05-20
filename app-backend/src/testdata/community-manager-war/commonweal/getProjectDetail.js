
/**
 * @file 校验模板
 *
 * @author gushouchuang
 * @date 2019-12-09
 */

module.exports = {
    __type: 'object',
    __required: [
        'projectId',
        'title',
        'stuName',
        'coverImageUrl',
        'listImageUrl',
        'content',
        'type',
        'effectTime',
    ],
    projectId: 'number',
    title: 'string',
    stuName: 'string',
    coverImageUrl: 'string',
    listImageUrl: 'string',
    content: 'string',
    type: 'string',
    effectTime: 'string',
}
