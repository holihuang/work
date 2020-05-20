import cfg from './optionCfg'

const iconExpireList = ['1天', '3天', '7天', '15天', '30天', '长期有效']

export default {
    iconExpireList,
    upperIconArr: [{
        label: '标签',
        options: cfg.iconTypeList,
        defaults: 1,
        key: 'iconType',
        show: true,
    }, {
        label: '有效期',
        options: iconExpireList,
        defaults: 7,
        key: 'iconExpire',
        show: true,
    }]
}