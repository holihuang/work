const testEnv = {
    postStatisticsUrl: 'https://hm.baidu.com/hm.js?7818ce00771ac318fe7d8ecf8ce803c8',
    mlinkTest: true
}

const productEnv = {
    postStatisticsUrl: 'https://hm.baidu.com/hm.js?fcf2048c0a9ed8c99bf6e08cf074b278',
    mlinkTest: false
}

var envCfg;
switch (location.hostname) {
    case "luntan.sunlands.com":
        envCfg = productEnv;
        break;
    default:
        envCfg = testEnv;
        break;
}                                                                                                                                                                            ;

export {envCfg};
