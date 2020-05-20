/**
 * @file title cfg
 *
 * @auth gushouchuang
 * @date 2018-2-28
 */

const getCfg = props => {
    return {
        title: '客诉老师管理',
        btnProps: [{
            label: '新增',
            onClickCb: () => {
                props.dispatch('add')
            },
        }]
    }
}

export default getCfg