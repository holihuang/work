import accountIcon from '../../images/wxBind_account.png'
import passwordIcon from '../../images/wxBind_password.png'

export default {
    iptMaxLength: {
        key: 'employ263',
        maxlength: 40,
    },
    bindInputList: [{
        type: 'account',
        key: 'employ263',
        icon: accountIcon,
        placeholder: '请输入您的263账号',
    }, {
        type: 'password',
        key: 'code',
        icon: passwordIcon,
        placeholder: '请输入您的验证码',
        countdownTxt: '发送验证码',
    }],
    passwordTipTxt: '*验证码将发送至您的员工APP中，有效期5分钟',
    submitBtnTxt: '提交',
    guideTxt: `使用说明：<br>当您完成绑定后，在微信中转发同事分享的学员故事内容，将自动将转发阅读的归属改为您的263账号。<br><br>享有以下特权：<br>
    1.读者阅读记录将第一时间推送至您的员工APP或天网精灵PC端。<br>
    2.转发展示内容中，将可配置显示您所使用的公司微信二维码名片。`,
    unBindIptList: [{
        type: 'account',
        key: 'employ263',
        icon: accountIcon,
        placeholder: '请输入您的263账号',
    }],
    unBindBtnTxt: '解除绑定',
    codeParamsKeys: ['openId', 'employ263'],
    required: {
        bindParamsKeys: [{ key: 'employ263', label: '263账号'}, { key: 'code', label: '验证码'}],
        unBindParamsKeys: [{key: 'employ263', label: '263账号'}],
    },
    unBindTipTxt: '是否解除当前263账号绑定？',
}