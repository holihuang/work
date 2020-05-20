/**
 * @file title cfg
 *
 * @auth gushouchuang
 * @date 2019-12-09
 */

const getCfg = props => ({
    title: '公益项目',
    btnProps: [{
        label: '新增',
        onClickCb: () => {
            props.dispatch('add')
        },
    }],
})

export default getCfg
