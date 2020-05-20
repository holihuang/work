/**
 * @file 测试环境和生产环境的不同配置
 * @author hualuyao
 */

// const ip = window.location.host.split(':')[0]
// const { protocol } = window.location.protocol

// let groupWsReqUrl
// let wsReqUrl

// switch (protocol) {
// case 'http:':
//     groupWsReqUrl = `ws://${ip}:7080/community-sv-war/groupTalk`
//     // wsReqUrl = /172.16.117.225/.test(location.hostname) ? 'ws://172.16.117.225:7080/community-sv-war/singleChat' : 'ws://socialmgr.sunlands.com/community-sv-war/singleChat';
//     wsReqUrl = `ws://${ip}:7080/community-sv-war/singleChat`
//     break
// case 'https:':
//     groupWsReqUrl = 'wss://socialmgr.sunlands.com/community-sv-war/groupTalk'
//     wsReqUrl = 'wss://socialmgr.sunlands.com/community-sv-war/singleChat'
//     break
// default:
//     groupWsReqUrl = `ws://${ip}:7080/community-sv-war/groupTalk`
//     // wsReqUrl = /172.16.117.225/.test(location.hostname) ? 'ws://172.16.117.225:7080/community-sv-war/singleChat' : 'ws://socialmgr.sunlands.com/community-sv-war/singleChat';
//     wsReqUrl = `ws://${ip}:7080/community-sv-war/singleChat`
//     break
// }

const originPage = encodeURIComponent(window.location.href)

const communityH5Test = 'http://172.16.100.203:7089'
const communityH5Prod = 'http://luntan.sunlands.com'

const testEnv = {
    imgBaseUrl: 'http://static.sunlands.com/user_center_test/newUserImagePath/',
    chatReqIntervalTime: 20000, // 测试环境每10s请求一次
    postBaseUrl: `${communityH5Test}/community-pc-war/#post/`,
    communityH5: communityH5Test,
    userHomeBaseUrl: 'http://172.16.117.225:8000/community-pc-war/#userHome/',
    questionBaseUrl: 'http://172.16.117.225:8000/community-pc-war/m/#question/',
    mBaseUrl: 'http://172.16.117.225:8000/community-pc-war/m/',
    pcBBSBaseUrl: 'http://172.16.117.225:8000/community-pc-war/',
    logoutUrl: `http://172.16.116.136:9091/cas/logout?service=${window.location.href}`,
    loginUrl: `${window.location.protocol}//${window.location.host}/community-manager-war/sso/tologin?originPage=${originPage}`,
    opOrderDetailUrl: 'http://172.16.116.136:7068/op/stuManagement/showStuManagerInfo.action',
    // wsReqUrl: 'ws://172.16.102.127:8080/community-sv-war/singleChat', //先写死指向225
    // wsReqUrl: 'ws://172.16.102.200:8081/community-sv-war/singleChat', //先写死指向225
    // wsReqUrl: 'ws://172.16.100.203:7080/community-sv-war/singleChat', // 先写死指向203
    // wsReqUrl: 'ws://172.16.57.177:8180/community-sv-war/singleChat', //
    wsReqUrl: 'ws://172.16.117.2:7080/community-sv-war/singleChat', //写死指向2
    // wsReqUrl: 'ws://172.16.102.127:8380/community-sv-war/singleChat',
    // wsReqUrl: 'ws://localhost:3100/community-sv-war/singleChat',
    // wsReqUrl: 'ws://socialmgr.sunlands.com/community-sv-war/singleChat',
    // wsReqUrl,
    // wsReqUrl: 'wss://socialchat.sunlands.com/community/singleChat',
    // wsReqUrl: 'ws://172.16.117.2:7180/community-sv-war/singleChat',
    // wsReqUrl: 'ws://172.16.117.2:7121/community-sv-war/singleChat',
    // groupWsReqUrl: 'ws://172.16.117.225:7080/community-sv-war/groupTalk',
    // groupWsReqUrl: `ws://${ip}:7080/community-sv-war/groupTalk`
    // groupWsReqUrl: 'ws://172.16.102.127:8080/community-sv-war/groupTalk'
    // groupWsReqUrl: 'ws://172.16.116.136:7080/community-sv-war/groupTalk'
    // groupWsReqUrl: groupWsReqUrl,
    // wsReqUrl: 'ws://172.16.100.212:8280/community/chatSocket',
    // wsReqUrl: 'ws://172.16.117.225:7080/community-sv-war/chatSocket',
    // groupWsReqUrl: 'ws://172.16.117.225:7088/community-group-chat/groupTalk', // 测试
    groupWsReqUrl: 'ws://172.16.100.203:7088/community-group-chat/groupTalk', // 测试
    // groupWsReqUrl: 'ws://172.16.102.162:8080/community-sv-war/groupTalk', // 芳杰
    // groupWsReqUrl: 'ws://172.16.117.225/community-sv-war/groupTalk'
    // groupWsReqUrl: 'wss://social.sunlands.com/community/groupTalk',
    // wsReqUrl: 'ws://42.62.70.217:8080/community/chatSocket',
    // groupWsReqUrl: 'ws://172.16.117.225:7080/community-sv-war/groupTalk'
}

const productEnv = {
    imgBaseUrl: 'http://static.sunlands.com/user_center/newUserImagePath/',
    chatReqIntervalTime: 20000, // 生产环境每20秒请求一次
    postBaseUrl: `${communityH5Prod}/community-pc-war/#post/`,
    communityH5: communityH5Prod,
    userHomeBaseUrl: 'http://luntan.sunlands.com/community-pc-war/#userHome/',
    questionBaseUrl: 'http://luntan.sunlands.com/community-pc-war/m/#question/',
    mBaseUrl: 'http://luntan.sunlands.com/community-pc-war/m/',
    pcBBSBaseUrl: 'http://luntan.sunlands.com/community-pc-war/',
    logoutUrl: `http://login.sunlands.com/logout?service=${window.location.href}`,
    loginUrl: `${window.location.protocol}//am.sunlands.com/community-manager-war/sso/tologin?originPage=${originPage}`,
    opOrderDetailUrl: 'http://op.shangdejigou.cn/op/stuManagement/showStuManagerInfo.action',
    wsReqUrl: 'wss://socialchat.sunlands.com/community/singleChat',
    groupWsReqUrl: 'wss://socialgroup.sunlands.com/community-group-chat/groupTalk',
}

const evt = {
    envCfg: {},
}

switch (window.location.hostname) {
case 'am.shangdejigou.cn':
    evt.envCfg = productEnv
    break
case 'am.sunlands.com':
    evt.envCfg = productEnv
    break
default:
    evt.envCfg = testEnv
    break
}

const { envCfg } = evt

export { envCfg }

