/**
 * @file title cfg
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

const getCfg = props => {
    return {
        title: '编辑专业',
        link: {
            label: '< 返回',
            onChangeCb() {
                //hash changes here
                window.location.hash = '#beforelesson'
            },
        },
    }
}

export default getCfg