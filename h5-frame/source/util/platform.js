import getUrlParams from './getUrlParams'

const envSetArr = [{
    key: 'sunlandapp',
    text: '主版app',
    from: 'jsBridge',
}, {
    key: 'liteapp',
    text: '极速版app',
    from: 'jsBridge',
}, {
    key: 'empapp',
    text: '员工版app',
    from: 'jsBridge',
}, {
    key: 'wx',
    text: '微信',
    from: 'ua',
}, {
    key: 'web',
    text: 'web',
    from: 'url', // 从ur中获取具体的系统名称
}, {
    key: 'skynet',
    text: '天网精灵PC客户端',
    from: 'url',
}]

export default function () {
    const ua = navigator.userAgent.toLowerCase()
    const urlParams = getUrlParams()

    let envInfo = {
        env: 'web',
        envName: 'web',
        detailInfo: {
            sys: '',
        },
    }

    for(let i = 0; i < envSetArr.length; i++) {
        const { key, text, from } = envSetArr[i]
        // url
        if(from ==='url') {
            if(key === urlParams.env) {
                return {
                    ...envInfo,
                    env: key,
                    envName: text,
                    detailInfo: {},
                }
            } else {
                return {
                    ...envInfo,
                    detailInfo: {
                        sys: urlParams.env
                    },
                }
            }
        } else if(from === 'ua') {
            // 微信环境
            if(/MicroMessenger/i.test(ua)) {
                return {
                    ...envInfo,
                    env: key,
                }
            }
        } else if(from === 'jsBridge') {
            // app环境
            if(typeof JSBridge !== 'undefined') {
                if(JSBridge.getData) {
                    const deviceInfo = JSON.parse(JSBridge.getData('deviceInfo')) || {}
                    const userInfo = JSON.parse(JSBridge.getData('userInfo')) || {}
                    return {
                        ...envInfo,
                        env: key,
                        envName: text,
                        detailInfo: {
                            deviceInfo,
                            userInfo,
                        },
                    }
                }
            }
        }
    }
}