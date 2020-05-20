/**
 * @file title cfg
 *
 * @auth gushouchuang
 * @date 2018-2-6
 */

const getCfg = props => {
    return {
        title: '公开课配置',
        btnProps: [{
            label: '新增',
            onClickCb: () => {
                props.dispatch('add')
            },
        }]
    }
}

export default getCfg