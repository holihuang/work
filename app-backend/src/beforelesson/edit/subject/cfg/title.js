/**
 * @file title cfg
 *
 * @auth gushouchuang
 * @date 2018-2-28
 */

const getCfg = props => {
    return {
        title: '',
        btnProps: [{
            label: '新增',
            onClickCb: () => {
                props.dispatch('addQa')
            },
        }]
    }
}

export default getCfg