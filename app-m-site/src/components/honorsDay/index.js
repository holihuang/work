import React from 'react'
import style from '../../styles/less/honorsDay.less'

const getURLParams = () => {
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

    return Object.assign({}, parseParams(decodeURIComponent(location.search)), parseParams(decodeURIComponent(location.hash)));
}

const isApp = navigator.userAgent.indexOf('sunland') !== -1

class HonorsDay extends React.Component {
    componentDidMount() {
        if (isApp) {
            const titleValue = '开学典礼邀请函'
            JSBridge.doAction('actionSetTitle', '{}', JSON.stringify({
                title: titleValue
            }));
            JSBridge.doAction('hideShareButton', JSON.stringify({}), JSON.stringify({}));
        }
    }
    render() {
        const {
            userName,
            classTime,
        } = getURLParams()
        return (
            <div className={style['honors-bg']}>
                <div className={style['honors-title']}>

                </div>
                <div className={style['honors-container']}>
                    <div className={style['honors-content']}>
                        <p>亲爱的{userName}同学：</p>
                        <p className={style['honors-content-retract']}>你好！</p>
                        <p className={style['honors-content-retract']}>首先感谢你对尚德机构的支持和信任，成为我们众多学子中的一员。在未来的一两年的学习时光中，你将会在这里收获知识、快乐和来自师生的陪伴。</p>
                        <p className={style['honors-content-retract']}> 开学典礼将于{classTime}举行，诚挚地邀请你前来参加。通过开学典礼，你将了解如下：</p>
                        <p className={style['honors-content-retract']}>· 关于尚德机构和自考的介绍；</p>
                        <p className={style['honors-content-retract-item']}>· 关于专业的介绍和学习方法；</p>
                        <p className={style['honors-content-retract-item']}>· 平台系统的使用说明；</p>
                        <p className={style['honors-content-retract-item']}> · 关于考试和毕业的介绍。</p>
                        <p className={style['honors-content-retract']}>这是与班主任老师首次见面和交流的时刻，弥足珍贵。选择学历教育，就是在人生的赛道上“再出发”。我们希望为你提供一个好的开始，期待你的如期参加。</p>
                        <p className={style['honors-content-footer']}>尚德机构</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default HonorsDay
