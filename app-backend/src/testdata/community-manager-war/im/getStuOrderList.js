
/**
 * @file 获取学员订单列表
 *
 * @author gushouchuang
 * @date 2020-03-05
 */

module.exports = {
    __required: [
        'curItemName',
        'curOrderDetailId',
        'itemList',
    ],
    curItemName: 'string',
    curOrderDetailId: 'number',
    itemList: {
        __type: 'array',
        __required: [
            'orderDetailId',
            'itemName',
        ],
        itemName: 'string',
        orderDetailId: 'number',
    },
}
