

var global = {
    sideEffect: {
        pageNo: 1,
        scrollTop: 0,
        productType: '-1',
        selectedTab: '',
    },
    setBodyScroll: () => {
        document.body.style.overflow = ''
    },
    publicBenefitHome: {
        pageNo: 1,
        scrollTop: 0,
    },
    publicBenefitList: {
        pageNo: 1,
        scrollTop: 0,
    },
    platformInfo: {
        env: 'web',
        envName: '',
        envSet: {
            sunlandapp: '主版app',
            liteapp: '极速版app',
            empapp: '员工版app',
            wx: '微信',
            web: 'web',
            skynet: '天网精灵PC客户端',
        },
        detailInfo: {},
    },
    referrer: '',
    referrerHash: '',
}

window.global = global;

export default global;
