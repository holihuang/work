/**
 * @file title cfg
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

const getCfg = props => {
    return {
        title: '专业管理',
        btnProps: [{
            label: '新增专业',
            onClickCb: () => {
                props.dispatch('add')
            },
        }]
    }
}

export default getCfg