import global from './global';
// import moment from 'moment';

//判断url的正则
const LINKREGEXP = new RegExp("((?:(http|https|Http|Https|rtsp|Rtsp):\\/\\/(?:(?:[a-zA-Z0-9\\$\\-\\_\\.\\+\\!\\*\\'\\(\\)\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,64}(?:\\:(?:[a-zA-Z0-9\\$\\-\\_\\.\\+\\!\\*\\'\\(\\)\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,25})?\\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}\\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|top|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\\:\\d{1,5})?)(\\/(?:(?:[a-zA-Z0-9\\;\\/\\?\\:\\@\\&\\=\\#\\~\\-\\.\\+\\!\\*\\'\\(\\)\\,\\_])|(?:\\%[a-fA-F0-9]{2}))*)?", 'g');
const logHost = location.host == 'luntan.sunlands.com' ? 'dataserviceNew/' : 'dataserviceTest/';

const logUrlPre = 'http://ggtf.sunland.org.cn/dataservice-servers/' + logHost

var util = {

    formatDate(date) {

    },

    deepCopy(data) {
        return JSON.parse(JSON.stringify(data));
    },

    dispatchAsync(action) {
        setTimeout(() => {
            global.store.dispatch(action);
        }, 0);
    },

    isEmptyObject(e) {
        var t;
        for (t in e)
            return !1;
        return !0
    },
    /**
     * 获取URL参数
     * @return {Object} {key:value}
     */
    getURLParams() {
        function parseParams(str) {
            var rs = {};
            var i = str.indexOf('?')
            if (i >= 0) {
                str = str.substr(i + 1);
                var params = str.split('&');
                params.forEach(function (s) {
                    var p = s.split('=');
                    if (p.length >= 2) {
                        rs[p[0]] = p[1];
                    }
                });
            }
            return rs;
        }

        return Object.assign({}, parseParams(location.search), parseParams(location.hash));
    },

    addContextUrl(url) {
        var contextPath = location.pathname.replace('/index.html', '');
        return contextPath + url;
    },



    //  /**
    //   * 转换日期，eg:2016-6-18 20:00
    //   * @param {Date}
    //   * @return {String}
    //   */
    //  formatDateTime(time) {
    //    return moment(time).format('YYYY-MM-DD H:mm');
    //  },
    //  *
    // * 转换日期，eg:6.18
    // * @param {Date}
    // * @return {String}

    //  formatDate(time) {
    //    return moment(time).format('M.D');
    //  },
    //  /**
    // * 转换时间24小时制，eg:20:30
    // * @param {Date}
    // * @return {String}
    // */
    //  formatTime(time) {
    //    return moment(time).format('H:mm');
    //  },

    /**
     * 解析时间，按东八区解析
     * @str {String|Number}
     * @return {Date}
     */
    parseDate(str) {
        if (!str) {
            return new Date();
        }
        if (typeof str == 'number') {
            return new Date(str);
        }
        //东八区时间
        if (typeof str == 'string' && str.indexOf('+08') < 0) {
            str = str + '+08:00';
        }
        return new Date(str);
    },

    testUrl: function (str) {
        return str.match(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g);
    },

    /**
     * 马赛克字符串中指定位置的字符
     * @str {String|Number} 字符串
     * @start {Number} 开始打码的位置索引，从0开始计算，如果不填则默认从第一个开始打码
     * @end {Number} 结束打码的位置索引，从0开始计算，如果不填则默认打码到最后一个
     * @wildchar {String} 马赛克通配符
     * @count {Number} 替换马赛克的个数，如果不填则根据start和end之间的字符个数替换
     * @return {newStr} 打码后的字符串
     */
    mosaicStr(str = '', start = 0, end, wildchar = '*', count) {
        const reg = new RegExp('^(.{' + start + '})(.*)(.{' + (typeof end == 'undefined' ? 0 : (str.length - end - 1)) + '})$', 'g');
        let newStr = str.replace(reg, (match, p1, p2, p3) => {
            return p1 + new Array(p2.length + 1).join(wildchar) + p3
        });
        return newStr
    },
    /**
     * 将文本中的链接文本替换为a标签
     * @param {String} content 文本内容
     * @param {String} classNames 链接的类名
     * @return {String} 替换a标签后的文本
     */
    replaceLinkText(content = '', classNames = '') {
        const linkArray = [];
        let linkNum = 0;
        let rs = [];
        let formatedContent = content;
        while (rs = LINKREGEXP.exec(content)) {
            const linkText = rs[0];
            linkArray.push(`<a href="${(linkText.indexOf('://') > -1 ? '' : 'http://') + linkText}" target="_blank" class='${classNames}'>${linkText}</a>`);
            formatedContent = formatedContent.replace(linkText, 'LINLPLACEHOLDER' + linkNum++);
        }
        linkArray.forEach((item, index) => {
            formatedContent = formatedContent.replace('LINLPLACEHOLDER' + index, item);
        })
        return formatedContent;
    },
    /**
     * 埋点上报
     * @param {String} imgUrl 上报地址
     * @param {Object} params 上报参数
     */
    log(imgUrl, params) {
        let paramsArr = [];
        for (let i in params) {
            paramsArr.push(i + '=' + params[i])
        }
        const img = new Image();
        img.src = logUrlPre + imgUrl + '?' + paramsArr.join('&');
    },

    matchNewAppVersion(version = '', matchVersion = '') {
        // 由于测试环境的version，可能为'3.3.2-debug'，线上不会有-debug后缀，代码层面兼容下
        const prepareTest = version.split('-')
        const versionList = prepareTest[0].split('.')
        const matchVersionList = matchVersion.split('.')
        let rst = true

        // app版本号不应该低于3位
        if (matchVersionList.length < 3 || versionList.length < 3) {
            rst = false
        } else if (
            +versionList[0] < +matchVersionList[0] // 1位置本低于对照版本
            || (versionList[0] === matchVersionList[0] && +versionList[1] < +matchVersionList[1]) // 1位版本相同，2位置版本地域对照
            // 1位和2位版本号一致，但3位版本号低于对照
            || (versionList[0] === matchVersionList[0] && versionList[1] === matchVersionList[1] && +versionList[2] < +matchVersionList[2])
        ) {
            rst = false
        }

        return rst
    },
    slog: (eventName, params) => {
        const {
            userId
        } = global.userInfo || {}
        try {
            if (window.slog) {
                window.slog.dot(eventName, { // event id
                    userId,
                    ...params,
                })
            }
        } catch (e) {
            console.error('slog script load fail.')
        }
    },
    // web 图片下载（注意：图片不能跨域，跨域的图片只能预览，无法下载）
    downloadPic: (url, name = '图片') => {
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    },
    getScrollTop: _ => {
        let scroll_top = 0
        if (document.documentElement && document.documentElement.scrollTop) {
            scroll_top = document.documentElement.scrollTop
        } else if (document.body) {
            scroll_top = document.body.scrollTop
        }
        return scroll_top
    },
    // app版本比较（传入的app版本是否大于等于当前版本）
    appVersionAbove: (version = '') => {
        if(typeof version !== 'string') {
            console.error('传入的app版本不是字符串类型！')
            return
        }
        const { detailInfo: { appVersion = '' } } = util.platformInfo()
        if (!appVersion.length) {
            console.warn('当前不是app环境哦，版本比较无意义！')
        }
        /*
        ** @app版本格式
        ** @线上: '3.2.5'
        ** @测试: '3.2.5-debug'
        */ 
        const currentVersionArr = appVersion.split('.').map(item => item.replace(/\D/g, ''))
        const checkVersionArr = version.split('.')
        const deltVersionArr = currentVersionArr.map((item, index) => +item - (+checkVersionArr[index]))
        for(let i = 0; i < deltVersionArr.length; i++) {
            if(deltVersionArr[i] > 0) {
                return true
            } else if(deltVersionArr[i] === 0) {
                if (i === deltVersionArr.length -1) {
                    return true
                } else {
                    continue
                }
            } else if(deltVersionArr[i] < 0) {
                return false
            }
        }
    },
    /*
    ** @params: flag: 1-从字符串中解析出hash, 0-从location中解析出hash
    */
    getHashParams: (flag = 0, str) => {
        let { location: { hash } } = window
        if(flag) {
            hash = str.split('#')[1] || ''
        }
        const [, hashParams = ''] = hash.split('?')
        const arr = hashParams.split('&')
        const obj = {}
        arr.forEach(item => {
            const [key = '', value = ''] = item.split('=')
            obj[key] = value
        })
        return obj
    },
    // app|wx|web|客户端设备信息
    // flag: 是否通过jsBridge获取app信息, 0: 不使用, 1: 使用
    platformInfo: function (flag = 1) {
        let { platformInfo: { env, detailInfo, envSet } } = global
        if (!flag) {
            const ua = navigator.userAgent.toLowerCase()
            //从url获取环境信息，如：天网精灵客户端，web工作台
            const envObj = this.getHashParams()
            // 1. 从url中解析-天网精灵pc客户端
            if (envObj.env in envSet) {
                env = envObj.env
            } else {
                // web
                detailInfo = {
                    sys: envObj.env || '', // web浏览器中工作台的名称
                }
            }
            // 2. 从内核中解析-微信环境
            if (/MicroMessenger/i.test(ua)) {
                env = 'wx'
            }
            return {
                env,
                envName: envSet[env],
                envSet,
                detailInfo,
            }
        } else {
            // 3. 从jsBridge中解析-app环境（主APP，极速app，员工app）
            if (typeof JSBridge !== 'undefined') {
                if (JSBridge.getData) {
                    const deviceInfo = JSON.parse(JSBridge.getData('deviceInfo')) || {}
                    const userInfo = JSON.parse(JSBridge.getData('userInfo')) || {}
                    env = deviceInfo.app || 'sunlandapp'
                    detailInfo = { ...deviceInfo, ...userInfo }
                }
            }
            return {
                env,
                envName: envSet[env],
                envSet,
                detailInfo,
            }
        }
    }
}

window.mosaicStr = util.mosaicStr

export default util;
