import React from 'react';
import moment from 'moment';
import styles from '../../styles/less/topics.less';
import {mr20, w_100, h_100, psa, red} from '../../styles/less/common.less';
import classNames from 'classnames';

class Topic extends React.Component {
    constructor(props) {
        super(props);
        this.handleAvatarError = this.handleAvatarError.bind(this);
    }

    createMultiImgs(arr) {
        arr.length = arr.length > 3 ? 3 : arr.length;
        let imgClass = classNames(w_100, h_100, psa);
        let rs = arr.map(item => {
            return (
                <div className={styles['img--flex']}>
                    <div className={styles['img--flex-item']}>
                        <img src={item.linkUrl} className={imgClass}/>
                    </div>
                </div>
                )
        });

        return rs;
    }

    createSingleImg(url) {
        return <img className={styles['img--auto']} src={url} />
    }

    createImgs() {
        const {externalLinks, postLinkList} = this.props;
        return postLinkList.length ? (
            postLinkList.length > 1 ? (
                <div className={styles['img-container']}>
                    {this.createMultiImgs(postLinkList)}
                </div>
            ) : (
                <div>
                    {this.createSingleImg(postLinkList[0].linkUrl)}
                </div>
            )
        ) : '';
    }

    handleAvatarError(e) {
        e.target.src="./images/default.png";
    }

    formatTime(time) {
        var rs = '';
        if (!/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(time)) {
        return time;
        }
        var now = new Date();
        var nYear = now.getFullYear();
        var nMonth = now.getMonth() + 1;
        var nDay = now.getDate();

        var dayInfo = time.split(' ')[0];
        var timeInfo = time.split(' ')[1];
        var year = dayInfo.split('-')[0],
            month = dayInfo.split('-')[1],
            day = dayInfo.split('-')[2];
        if (year == nYear && month == nMonth) {
        //说明同年同月
        if (day == nDay) {
            //今天发的帖子
            rs = '今天' + moment(time).format('HH:mm');
            return rs; 
        }
        if (day == nDay - 1) {
            //昨天发的帖子
            rs = '昨天' + moment(time).format('HH:mm');
            return rs; 
        }
            return moment(time).format('MM-DD');
        }
        if (year == nYear) {
            //今年发的帖子
            return  moment(time).format('MM-DD');
        }
        
        return moment(time).format('YYYY-MM-DD');
    }

    formatContent(content = '') {
        let rs, needShowAllBtn = false;

        if (content.length > 90) {
            rs = content.substr(0, 90);
            needShowAllBtn = true;
        } else {
            rs = content;
        }

        let topicsArr = content.match(/#\S+?#/g);
        if (topicsArr && topicsArr.length) {
            //去重
            let topicsUnique = [];
            topicsArr.forEach(item => {
                if (topicsUnique.indexOf(item) === -1) {
                    topicsUnique.push(item);
                }
            })

            topicsUnique.forEach(item => {
                let topicName = item.replace(/#/ig, '');
                let reg = new RegExp(item, 'g');
                rs = rs.replace(reg, `<a href="#topic/${topicName}" class=${styles['text--blue']}>${item}</a>`);
            })
        }

        rs = rs.replace(/\r\n/ig, '<br />').replace(/\n/ig, '<br />');

        needShowAllBtn && (rs += `<span class="${styles['show-all']}">...显示全文</span>`)

        return {
            __html: rs
        }
    }

    gotoNativePostPage = _ => {
        const {
            postMasterId,
            isOpenNative = false, //点击帖子时是否打开app页面
        } = this.props
        if(isOpenNative && typeof JSBridge !== 'undefined') {
            JSBridge.gotoNative('gotoFeedDetail', JSON.stringify({
                postMasterId
            }))
        } else {
            window.location.href = `http://luntan.sunlands.com/community-pc-war/share/share.html?postMasterId=${postMasterId}`
        }
    }

    render() {
        const {
            userId,
            userNickname, //用户昵称
            postSubject, //帖子标题
            postMasterId,
            content = '', //帖子内容
            isVip, //是否是vip
            praiseCount, //点赞数
            replyCount, //评论数
            createTime, //发帖时间
            modifyTime, //最新回复时间
            albumParentName, //父版面名称
            externalLinks, //是否有外链
            postLinkList,
        } = this.props;

        const latestReplyTime = this.formatTime(modifyTime);
        const latestReplyTimeClass = classNames(styles['text--gray'], mr20);
        const praiseWrapperClass = classNames(styles['icon-and-text-wrapper'], mr20);
        const vipLabelClass = classNames(styles.label, styles['label--vip']);
        const teacherLabelClass = classNames(styles.label, styles['label--teacher']);
        const contentWithTopic = this.formatContent(content);
        const postUrl = `http://luntan.sunlands.com/community-pc-war/share/share.html?postMasterId=${postMasterId}`;

        return (
            <a className={styles.panel} onClick={this.gotoNativePostPage}>
                <div className={styles['panel-header']}>
                    <div className={styles['avatar-block']}>
                        <img className={styles.avatar} src={`http://static.sunlands.com/user_center/newUserImagePath/${userId}/${userId}.jpg`} onError={this.handleAvatarError}/>
                        {
                            isVip == 1 && <i className={vipLabelClass}></i>
                        }
                        {
                            isVip == 2 && <i className={teacherLabelClass}></i>
                        }
                    </div>
                    <span className={styles.username}>{userNickname}</span>
                </div>
                {
                    postSubject && <h1 className={styles.title}>{postSubject}</h1>
                }
                <div className={styles.content} dangerouslySetInnerHTML={contentWithTopic}>
                </div>
                {
                    this.createImgs()
                }
                <div className={styles.footer}>
                    <div className={styles['footer-left']}>
                        <span className={latestReplyTimeClass}>{latestReplyTime}</span>
                        {/* <span className={styles['text--gray']}>来自</span>
                        <span className={styles['text--red']}>{albumParentName}</span> */}
                    </div>
                    <div className={styles['footer-right']}>
                        <div className={praiseWrapperClass}>
                            <i className={styles['praise-icon']}></i>
                            <span className={styles['text--gray']}>{praiseCount}</span>
                        </div>
                        <div className={styles['icon-and-text-wrapper']}>
                            <i className={styles['reply-icon']}></i>
                            <span className={styles['text--gray']}>{replyCount}</span>
                        </div>
                    </div>
                </div>
            </a>    
        )
    }
}

export default Topic;
