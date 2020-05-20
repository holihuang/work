/**
 * @file   表情插件
 * @author 刘晶晶
 *
 */
import { common } from './common'

const EMOTION = {
    OK: 'OK',
    中国好老师: 'zhongguohaolaoshi',
    么么哒: 'memeda',
    你好: 'nihao',
    做鬼脸: 'zuoguilian',
    傲娇: 'aojiao',
    冰冻: 'bingdong',
    凋谢: 'diaoxie',
    吐血: 'tuxue',
    咖啡: 'kafei',
    嘴唇: 'zuichun',
    困: 'kun',
    太阳: 'taiyang',
    委屈: 'weiqu',
    害羞: 'haixiu',
    尴尬: 'ganga',
    帅: 'shuai',
    帅气: 'shuaiqi',
    庆祝: 'qingzhu',
    弱: 'ruo',
    强: 'qiang',
    心碎: 'xinsui',
    必胜: 'bisheng',
    惊吓: 'jingxia',
    惊讶: 'jingya',
    愤怒: 'fennu',
    憨笑: 'hanxiao',
    我想静静: 'woxiangjingjing',
    打哈欠: 'dahaqie',
    握手: 'woshou',
    握拳: 'woquan',
    撒花: 'sahua',
    晚安: 'wanan',
    棒棒哒: 'bangbangda',
    汗颜: 'hanyan',
    泪奔: 'leiben',
    爱心: 'aixin',
    爱慕: 'aimu',
    甜甜圈: 'tiantianquan',
    生气: 'shengqi',
    疑问: 'yiwen',
    眩晕: 'xuanyun',
    礼物: 'liwu',
    红包: 'hongbao',
    美: 'mei',
    耶: 'yeah',
    胜利: 'shengli',
    蛋糕: 'dangao',
    谄媚: 'chanmei',
    送花: 'songhua',
    金牌: 'jinpai',
    钻石: 'zuanshi',
}

const EMOTION1 = {
    bangbangda: '棒棒哒',
    sahua: '撒花',
    nihao: '你好',
    shengli: '胜利',
    bingdong: '冰冻',
    hanxiao: '憨笑',
    memeda: '么么哒',
    yeah: '耶',
    haixiu: '害羞',
    qingzhu: '庆祝',
    chanmei: '谄媚',
    weiqu: '委屈',
    leiben: '泪奔',
    tuxue: '吐血',
    zuoguilian: '做鬼脸',
    OK: 'OK',
    woxiangjingjing: '我想静静',
    aimu: '爱慕',
    ganga: '尴尬',
    dahaqie: '打哈欠',
    kun: '困',
    yiwen: '疑问',
    jingya: '惊讶',
    fennu: '愤怒',
    shuaiqi: '帅气',
    shengqi: '生气',
    aojiao: '傲娇',
    xuanyun: '眩晕',
    hanyan: '汗颜',
    liwu: '礼物',
    jingxia: '惊吓',
    qiang: '强',
    ruo: '弱',
    bisheng: '必胜',
    woquan: '握拳',
    woshou: '握手',
    shuai: '帅',
    mei: '美',
    songhua: '送花',
    diaoxie: '凋谢',
    aixin: '爱心',
    xinsui: '心碎',
    zuichun: '嘴唇',
    taiyang: '太阳',
    wanan: '晚安',
    hongbao: '红包',
    zhongguohaolaoshi: '中国好老师',
    jinpai: '金牌',
    zuanshi: '钻石',
    tiantianquan: '甜甜圈',
    kafei: '咖啡',
    dangao: '蛋糕',
}

// const NEW_EMOTION_BIG_URL_PREFIX = 'http://store.sunlands.com/common/facebig/'
// const NEW_EMOTION_MINI_URL_PREFIX = 'http://store.sunlands.com/common/facemini/'

const NEW_EMOTION = [
    'niuqi',
    'fadou',
    'wanan',
    'kaifan',
    'aoaoku',
    'aini',
    'haokun',
    'jiaogeiwo',
    'zaoshanghao',
    'xuexi',
    'jingjing',
    'haha',
    'gongzuo',
    'aoye',
    'shangke',
    'youshi',
    'qingyouduzhong',
    'buruxuexi',
    'di',
    '60fen',
    'biguo',
    'gaofen',
    'kuaile',
    'burenshu',
]

class EmotionBox {
    constructor(options = {}) {
        this.options = options
        this.init()
    }

    init() {
        let emotionStr = ''
        let emotionStrNew = ''
        // for (const k in EMOTION) {
        //     emotionStr += `<li emotion='${EMOTION[k]}'><img src='./images/emotion/${EMOTION[k]}.png' class="img-emotion"></li>`
        // }
        const keys = Object.keys(EMOTION)

        for (let i = 0; i < keys.length; i += 1) {
            emotionStr += `<li emotion='${EMOTION[keys[i]]}'><img src='./images/emotion/${EMOTION[keys[i]]}.png' class="img-emotion"></li>`
        }

        const newKeys = Object.keys(NEW_EMOTION)

        for (let i = 0; i < newKeys.length; i += 1) {
            emotionStrNew += `<li emotion='${NEW_EMOTION[newKeys[i]]}'>
                <img style="height: 100px; width: 100px;" src='./images/emotion-new/${NEW_EMOTION[newKeys[i]]}.png' class="img-emotion">
            </li>`
        }

        emotionStr = `<div style="position: relative; height: 329px;">
            <ul class="emotion-list emotion-list-old" style="height: 260px; padding: 0; overflow-y: scroll;">${emotionStr}</ul>
            <ul class="emotion-list emotion-list-new" style="height: 260px; padding: 0; overflow-y: scroll; display: none;">${emotionStrNew}</ul>
            <div class="emotion-tab-container" style="position: absolute; width: 100%; bottom: 0; height: 70px; background: #fff; border: 1px solid #ccc; padding: 10px;">
                <span value="old" class="emotion-tab emotion-tab-old current" style="display: inline-block; cursor: pointer;">
                    <img height='50' width='50' src='./images/emotion-tab/old-selected.png' class="img-emotion-tab">
                </span>
                <span value="new" class="emotion-tab emotion-tab-new" style="display: inline-block; background: #ccc; cursor: pointer;">
                    <img height='50' width='50' src='./images/emotion-tab/new.png' class="img-emotion-tab">
                </span>
                <i style="display: block; position: absolute; bottom: -6px; left: 10px; 
                    width: 10px; height: 10px; background: #fff;transform: rotate(45deg); border-right: 1px solid #ccc; border-bottom: 1px solid #ccc;">
                </i>
            </div>
        <div>`

        this.options.el.innerHTML = emotionStr
    }
}

// 判断一个字符串是否符合链接规则
function testUrl(str) {
    return str.match(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?/g)
}

const formatTextWithEmotion = function (richText) {
    // 将表情img转换为[XX]形式
    const emotionArr = []
    // for (const k in EMOTION) {
    //     emotionArr.push(EMOTION[k])
    // }

    const keys = Object.keys(EMOTION)

    for (let i = 0; i < keys.length; i += 1) {
        emotionArr.push(EMOTION[keys[i]])
    }


    const str = emotionArr.join('|')
    const regStr = `<img src="[\\S\\s]*?/images/emotion/(${str}).png"[\\s\\S]*?>`
    const reg = new RegExp(regStr, 'g')

    let rs = ''
    let textFormatted = richText

    rs = reg.exec(richText)

    while (rs) {
        textFormatted = textFormatted.replace(rs[0], `[${EMOTION1[rs[1]]}]`)

        rs = reg.exec(richText)
    }

    return textFormatted
}

const getNodeText = function (node) {
    const rs = []
    if (node.nodeName === 'P' || node.nodeName === 'DIV' || node.nodeName === 'BR') {
        rs.push('\r\n')
    }

    if (node.nodeName === 'INPUT') {
        rs.push(`${node.value}`)
    }

    if (+node.nodeType === 3) { // textnode
        rs.push(node.nodeValue)
    }

    const { childNodes } = node

    if (childNodes) {
        for (let i = 0, len = childNodes.length; i < len; i += 1) {
            rs.push(getNodeText(childNodes[i]))
        }
    }

    return rs.join('')
}

// 生成img节点
function createImg(name) {
    const _name = name.replace(/[[\]]/g, '')
    return `<img src="./images/emotion/${EMOTION[_name]}.png" class="img-emotion">`
}

const transferEmotionTextToImg = function (content = '') {
    // 防止xss攻击
    content = common.escapeHTML(content)
    // 检测url，用于识别用户手动输入的链接
    const urlArr = testUrl(content)
    if (urlArr) {
        // 判断每个链接外层是否有a标签
        for (let i = 0, len = urlArr.length; i < len; i += 1) {
            // 是否是图片
            const ext = urlArr[i] && urlArr[i].substr(urlArr[i].length - 4, 4)
            if (ext && (ext.toLowerCase() === '.jpg' ||
                ext.toLowerCase() === '.png' ||
                ext.toLowerCase() === '.gif' ||
                ext.toLowerCase() === '.bmp')) {
                // img
                continue
            }

            const urlWithHref = `href="${urlArr[i]}"`
            if (content.indexOf(urlWithHref) === -1) {
                // 加a标签
                content = content.replace(urlArr[i], `<a href="${urlArr[i]}" target="_blank">${urlArr[i]}</a>`)
            }
        }
    }
    // 将[XX]转化为img
    const emotionPlaceholderArr = []
    let contentFormatted = content.replace(/\n/g, '<br/>')

    // for (const k in EMOTION1) {
    //     emotionPlaceholderArr.push(`\\\[${  EMOTION1[k]  }\\\]`) // [爱慕]
    // }

    const keys = Object.keys(EMOTION1)

    for (let i = 0; i < keys.length; i += 1) {
        emotionPlaceholderArr.push(`\\[${EMOTION1[keys[i]]}\\]`) // [爱慕]
    }

    const regExpStr = emotionPlaceholderArr.join('|')
    const regExp = new RegExp(`(${regExpStr})`, 'g') // 全局匹配

    // 将匹配到的表情占位符替换为img标签
    let rs = ''
    rs = regExp.exec(content)

    while (rs) {
        contentFormatted = contentFormatted.replace(rs[0], createImg(rs[0]))

        rs = regExp.exec(content)
    }

    return contentFormatted
}

export { EmotionBox, formatTextWithEmotion, transferEmotionTextToImg, getNodeText, EMOTION1, EMOTION }
