import { InputItem as Input, Button } from 'antd-mobile'
import UploadPic from './common/UploadPic'

export default {
    list: [{
        label: '姓名',
        key: 'name',
        component: Input,
        className: 'ipt',
        maxLength: 10,
    }, {
        label: '介绍',
        key: 'description',
        component: Input,
        className: 'ipt',
        maxLength: 12,
    }, {
        label: '头像',
        key: 'portrait',
        component: UploadPic,
        className: 'upload',
        picType: 1,
    }, {
        label: '二维码',
        key: 'qrCode',
        component: UploadPic,
        className: 'upload',
        picType: 2,
    }],
    btnList: [{
        label: '取消修改',
        key: 'cancel',
        component: Button,
        props: {
            type: 'default',
        },
    }, {
        label: '保存并展示',
        key: 'save',
        component: Button,
        props: {
            type: 'primary',
        },
    }],
    tipTxt: '上传您常用的公司微信账号二维码，请勿上传个人二维码。',
}