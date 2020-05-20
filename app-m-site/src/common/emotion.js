const EMOTION_EN_TO_CN = {
    'bangbangda': '棒棒哒',
    'sahua': '撒花',
    'nihao': '你好',
    'shengli': '胜利',
    'bingdong': '冰冻',
    'hanxiao': '憨笑',
    'memeda': '么么哒',
    'yeah': '耶',
    'haixiu': '害羞',
    'qingzhu': '庆祝',
    'chanmei': '谄媚',
    'weiqu': '委屈',
    'leiben': '泪奔',
    'tuxue': '吐血',
    'zuoguilian': '做鬼脸',
    'OK': 'OK',
    'woxiangjingjing': '我想静静',
    'aimu': '爱慕',
    'ganga': '尴尬',
    'dahaqie': '打哈欠',
    'kun': '困',
    'yiwen': '疑问',
    'jingya': '惊讶',
    'fennu': '愤怒',
    'shuaiqi': '帅气',
    'shengqi': '生气',
    'aojiao': '傲娇',
    'xuanyun': '眩晕',
    'hanyan': '汗颜',
    'liwu': '礼物',
    'jingxia': '惊吓',
    'qiang': '强',
    'ruo': '弱',
    'bisheng': '必胜',
    'woquan': '握拳',
    'woshou': '握手',
    'shuai': '帅',
    'mei': '美',
    'songhua': '送花',
    'diaoxie': '凋谢',
    'aixin': '爱心',
    'xinsui': '心碎',
    'zuichun': '嘴唇',
    'taiyang': '太阳',
    'wanan': '晚安',
    'hongbao': '红包',
    'zhongguohaolaoshi': '中国好老师',
    'jinpai': '金牌',
    'zuanshi': '钻石',
    'tiantianquan': '甜甜圈',
    'kafei': '咖啡',
    'dangao': '蛋糕'
}

const EMOTION_CN_TO_EN = {
    "OK": "OK",
    "中国好老师": "zhongguohaolaoshi",
    "么么哒": "memeda",
    "你好": "nihao",
    "做鬼脸": "zuoguilian",
    "傲娇": "aojiao",
    "冰冻": "bingdong",
    "凋谢": "diaoxie",
    "吐血": "tuxue",
    "咖啡": "kafei",
    "嘴唇": "zuichun",
    "困": "kun",
    "太阳": "taiyang",
    "委屈": "weiqu",
    "害羞": "haixiu",
    "尴尬": "ganga",
    "帅": "shuai",
    "帅气": "shuaiqi",
    "庆祝": "qingzhu",
    "弱": "ruo",
    "强": "qiang",
    "心碎": "xinsui",
    "必胜": "bisheng",
    "惊吓": "jingxia",
    "惊讶": "jingya",
    "愤怒": "fennu",
    "憨笑": "hanxiao",
    "我想静静": "woxiangjingjing",
    "打哈欠": "dahaqie",
    "握手": "woshou",
    "握拳": "woquan",
    "撒花": "sahua",
    "晚安": "wanan",
    "棒棒哒": "bangbangda",
    "汗颜": "hanyan",
    "泪奔": "leiben",
    "爱心": "aixin",
    "爱慕": "aimu",
    "甜甜圈": "tiantianquan",
    "生气": "shengqi",
    "疑问": "yiwen",
    "眩晕": "xuanyun",
    "礼物": "liwu",
    "红包": "hongbao",
    "美": "mei",
    "耶": "yeah",
    "胜利": "shengli",
    "蛋糕": "dangao",
    "谄媚": "chanmei",
    "送花": "songhua",
    "金牌": "jinpai",
    "钻石": "zuanshi"
}

const emotionLists = [
    [
        {
            emotion: 'bangbangda',
            emotionName: '棒棒哒'
        },
        {
            emotion: 'sahua',
            emotionName: '撒花'
        },
        {
            emotion: 'nihao',
            emotionName: '你好'
        },
        {
            emotion: 'shengli',
            emotionName: '胜利'
        },
        {
            emotion: 'bingdong',
            emotionName: '冰冻'
        },
        {
            emotion: 'hanxiao',
            emotionName: '憨笑'
        }
    ],
    [
        {
            emotion: 'memeda',
            emotionName: '么么哒'
        },
        {
            emotion: 'yeah',
            emotionName: '耶'
        },
        {
            emotion: 'haixiu',
            emotionName: '害羞'
        },
        {
            emotion: 'qingzhu',
            emotionName: '庆祝'
        },
        {
            emotion: 'chanmei',
            emotionName: '谄媚'
        },
        {
            emotion: 'weiqu',
            emotionName: '委屈'
        }
    ],
    [
        {
            emotion: 'leiben',
            emotionName: '泪奔'
        },
        {
            emotion: 'tuxue',
            emotionName: '吐血'
        },
        {
            emotion: 'zuoguilian',
            emotionName: '做鬼脸'
        },
        {
            emotion: 'OK',
            emotionName: 'OK'
        },
        {
            emotion: 'woxiangjingjing',
            emotionName: '我想静静'
        },
        {
            emotion: 'aimu',
            emotionName: '爱慕'
        }
    ],
    [
        {
            emotion: 'ganga',
            emotionName: '尴尬'
        },
        {
            emotion: 'dahaqie',
            emotionName: '打哈欠'
        },
        {
            emotion: 'kun',
            emotionName: '困'
        },
        {
            emotion: 'yiwen',
            emotionName: '疑问'
        },
        {
            emotion: 'jingya',
            emotionName: '惊讶'
        },
        {
            emotion: 'fennu',
            emotionName: '愤怒'
        }
    ],
    [
        {
            emotion: 'shuaiqi',
            emotionName: '帅气'
        },
        {
            emotion: 'shengqi',
            emotionName: '生气'
        },
        {
            emotion: 'aojiao',
            emotionName: '傲娇'
        },
        {
            emotion: 'xuanyun',
            emotionName: '眩晕'
        },
        {
            emotion: 'hanyan',
            emotionName: '汗颜'
        },
        {
            emotion: 'liwu',
            emotionName: '礼物'
        }
    ],
    [
        {
            emotion: 'jingxia',
            emotionName: '惊吓'
        },
        {
            emotion: 'qiang',
            emotionName: '强'
        },
        {
            emotion: 'ruo',
            emotionName: '弱'
        },
        {
            emotion: 'bisheng',
            emotionName: '必胜'
        },
        {
            emotion: 'woquan',
            emotionName: '握拳'
        },
        {
            emotion: 'woshou',
            emotionName: '握手'
        }
    ],
    [
        {
            emotion: 'shuai',
            emotionName: '帅'
        },
        {
            emotion: 'mei',
            emotionName: '美'
        },
        {
            emotion: 'songhua',
            emotionName: '送花'
        },
        {
            emotion: 'diaoxie',
            emotionName: '凋谢'
        },
        {
            emotion: 'aixin',
            emotionName: '爱心'
        },
        {
            emotion: 'xinsui',
            emotionName: '心碎'
        }
    ],
    [
        {
            emotion: 'zuichun',
            emotionName: '嘴唇'
        },
        {
            emotion: 'taiyang',
            emotionName: '太阳'
        },
        {
            emotion: 'wanan',
            emotionName: '晚安'
        },
        {
            emotion: 'hongbao',
            emotionName: '红包'
        },
        {
            emotion: 'zhongguohaolaoshi',
            emotionName: '中国好老师'
        },
        {
            emotion: 'jinpai',
            emotionName: '金牌'
        }
    ],
    [
        {
            emotion: 'zuanshi',
            emotionName: '钻石'
        },
        {
            emotion: 'gangbi',
            emotionName: '钢笔'
        },
        {
            emotion: 'tiantianquan',
            emotionName: '甜甜圈'
        },
        {
            emotion: 'kafei',
            emotionName: '咖啡'
        },
        {
            emotion: 'dangao',
            emotionName: '蛋糕'
        }
    ]
]

export {EMOTION_EN_TO_CN, EMOTION_CN_TO_EN, emotionLists}
