import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {hashHistory} from 'react-router'
import {createSelector} from 'reselect';
import {url} from '@sunl-fe/util';
import moment from 'moment';
import global from '../../common/global'
import weixinShare from '@sunl-fe/wechat-tools';
import classNames from 'classnames';
import styles from '../../styles/less/post.less';
import {mr20, link_blue} from '../../styles/less/common.less';
import util from '../../common/util';
import {EMOTION_CN_TO_EN, EMOTION_EN_TO_CN} from '../../common/emotion';
import FixedTop from '../../components/fixedTop/Index';
import {envCfg} from '../../common/envCfg';
import GetMore from '../../components/getMore/Index';
import BottomNav from '../../components/common/BottomNav'
// import GoFollow from '../../components/goFollow/Index'

const { slog } = util
const skyNet = 'skynet'

import {GET_POST_DETAIL_REQUESTED, GET_PRAISE_USER_LIST_REQUESTED, ON_RESET_POST_STORE,} from '../../constants/post';

class Post extends React.Component {
    static defaultProps = {
        postMaster: {},
        resultList: [],
        pointsInfo: {},
    }

    constructor(props) {
        super(props)
        this.getPostDetail()
        this.getPraiseList()
        this.state = {
            currentListType: '0',
        }
    }

    componentDidMount() {
        global.setBodyScroll()
        // pv| uv
        this.staticPvUv()
    }

    componentWillReceiveProps(nextProps) {
        let {postMaster} = nextProps;
        let {postSubject, content, externalLinks, postLinkList} = postMaster;

        weixinShare({
            title: postSubject,
            desc: content,
            py: {
                imgUrl: (postLinkList && postLinkList.length) ? postLinkList[0].linkUrl : ''
            }
        })

        // 帖子isHide，deleteFlag字段有一个为1时跳转到不可用页面
        if (postMaster.isHide || postMaster.deleteFlag) {
            hashHistory.push('unablePage');
        }
    }

    componentWillUnmount() {
        // reset store
        this.resetStore()
    }

    staticPvUv = _ => {
        // 学员故事
        const { location: { query: { fromProfile, share263, sharewx } }, routeParams: { postMasterId } } = this.props
        const { platformInfo: { env, envName, detailInfo: { userId, account } } } = global

        if (+fromProfile) {
            const slogParams = {
                postId: postMasterId,
                channel: 'staff',
                userId,
                openId: '',
                login263: account,
                share263,
                sharewx,
                source: envName,
            }
            setTimeout(() => {
                slog('post_entry_page', slogParams)
            }, 500)
        }
    }

    resetStore = _ => {
        const { fromProfile = 0 } = this.getHashParams()
        const { dispatch } = this.props
        if (+fromProfile) {
            dispatch({
                type: ON_RESET_POST_STORE,
            })
        }
    }

    getPostDetail = opt => {
        const { pageNo, pageSize, fromProfile = 0 } = opt || {}
        let {postMasterId} = this.props.params;
        if (postMasterId.indexOf('&') != -1) {
            postMasterId = postMasterId.split('&')[0];
        }
        let {dispatch, pageIndex = 1, countPerPage = 10} = this.props
        dispatch({
            type: GET_POST_DETAIL_REQUESTED,
            params: {
                postMasterId,
                osVersion: 'PC',
                appVersion: '',
                pageNo: pageNo || pageIndex,
                pageSize: pageSize || countPerPage,
                userId: -1,
            },
            otherParams: {
                fromProfile
            },
        });
    }

    getPraiseList = opt => {
        const { pageNo, pageSize, fromProfile = 0 } = opt || {}
        let {postMasterId} = this.props.params;
        if (postMasterId.indexOf('&') != -1) {
            postMasterId = postMasterId.split('&')[0];
        }
        let { dispatch, pointsInfo: { pageIndex = 1, countPerPage = 10 } } = this.props
        dispatch({
            type: GET_PRAISE_USER_LIST_REQUESTED,
            params: {
                postMasterId,
                osVersion: 'PC',
                appVersion: '',
                pageNo: pageNo || pageIndex,
                pageSize: pageSize || countPerPage,
                userId: -1,
                channelCode: "CS_BACKGROUND",
            },
            otherParams: {
                fromProfile
            },
        })

    }

    getHashParams = _ => {
        const hash = window.location.hash
        const [, hashStr = ''] = hash.split('?')
        const obj = {}
        hashStr.split('&').forEach(item => {
            const [key, value] = item.split('=')
            obj[key] = value
        })
        return obj
    }

    createAvatar(userId, isVip) {
        const vipClassName = (isVip === 1) ? classNames(styles.icon, styles['icon--vip']) : (
            isVip === 2 ? classNames(styles.icon, styles['icon--teacher']) : ''
        );

        return (
            <div>
                <img src={`http://static.sunlands.com/user_center/newUserImagePath/${userId}/${userId}.jpg`}
                     className={styles.avatar} onError={this.handleAvatarError}/>
                {
                    isVip ? (<i className={vipClassName}></i>) : ''
                }
            </div>
        )
    }

    formatContent(content = '', mobileText, postLinkList = [], postStyleType) {
        const {postMaster} = this.props;
        // 多读取3个字段，userInfoList，postStyleType richText
        const {postSubject, userInfoList, richText } = postMaster;
        if (postStyleType === 2) { // 新的长文帖子。直接使用richText
            
            return {
                __html: richText
            }

        } else  { // 如果不是长文帖子，走之前的逻辑，添加@支持
            const isMixed = mobileText ? true : false;

            const contentToBeFormatted = isMixed ? mobileText : content;

            let emotionPlaceholderArr = [];
            let contentFormatted = contentToBeFormatted.replace(/\r\n/ig, '<br/>');
            //将[XX]转化为img
            for (let k in EMOTION_EN_TO_CN) {
                emotionPlaceholderArr.push('\\\[' + EMOTION_EN_TO_CN[k] + '\\\]');  //[爱慕]
            }

            //将链接转换为a标签
            contentFormatted = util.replaceLinkText(contentFormatted, link_blue);

            let regExpStr = emotionPlaceholderArr.join('|');
            let regExp = new RegExp('(' + regExpStr + ')', 'g');  //全局匹配

            //将匹配到的表情占位符替换为img标签
            let rs;
            while (rs = regExp.exec(contentToBeFormatted)) {
                let imgName = rs[0].replace(/[\[\]]/g, '');
                contentFormatted = contentFormatted.replace(rs[0], `<img src="./images/emotion/${EMOTION_CN_TO_EN[imgName]}.png" class=${styles['emotion']}>`);
            }
            // 匹配@字符
            let atIndex = 0;
            let imgRegExp = new RegExp('\\[X提醒M\\]', 'g');
            while (rs = imgRegExp.exec(contentToBeFormatted)) {
                contentFormatted = contentFormatted.replace(rs[0], `@${userInfoList[atIndex].userNickname}`);
                atIndex++;
            }

            if (!isMixed) {
                //图片
                let picsFormatted = ''
                let renderImg = () => {
                    postLinkList && postLinkList.length && postLinkList.map((item, index) => {
                        picsFormatted += `<img src="${item.linkUrl}" class="${classNames(styles.img, styles[`img--${index}`])}"/>`
                    })
                }
                if (postLinkList.length) {
                    let len = postLinkList.length
                    if (len === 1) {
                        renderImg()
                        contentFormatted += `<div class="${classNames(styles.pictures, styles['pictures--1'])}">${picsFormatted}</div>`
                    } else if (len <= 3) {
                        renderImg()
                        contentFormatted += `<div class="${classNames(styles.pictures, styles['pictures--3'])}">${picsFormatted}</div>`
                    } else if (len === 4) {
                        renderImg()
                        contentFormatted += `<div class="${classNames(styles.pictures, styles['pictures--4'])}">${picsFormatted}</div>`
                    } else if (len <= 6) {
                        renderImg()
                        contentFormatted += `<div class="${classNames(styles.pictures, styles['pictures--6'])}">${picsFormatted}</div>`
                    } else if (len <= 9) {
                        renderImg()
                        contentFormatted += `<div class="${classNames(styles.pictures, styles['pictures--9'])}">${picsFormatted}</div>`
                    }
                }
            } else {
                //图文混排
                let imgIndex = 0;
                let imgRegExp = new RegExp('\\[L图片Y\\]', 'g');
                while (rs = imgRegExp.exec(contentToBeFormatted)) {
                    contentFormatted = contentFormatted.replace(rs[0], `<img src="${postLinkList[imgIndex].linkUrl}" class=${styles.img}>`);
                    imgIndex++;
                }
            }

            return {
                __html: contentFormatted
            }
        }
        
    }

    formatTime(time) {
        let rs = '';
        if (!/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(time)) {
            return time;
        }
        let now = new Date();
        let nYear = now.getFullYear();
        let nMonth = now.getMonth() + 1;
        let nDay = now.getDate();
        let dayInfo = time.split(' ')[0];
        let timeInfo = time.split(' ')[1];
        let year = dayInfo.split('-')[0],
            month = dayInfo.split('-')[1],
            day = dayInfo.split('-')[2];
        if (year == nYear && month == nMonth) {
            //说明同年同月
            if (day == nDay) {
                //今天发的帖子  显示规则：多少秒前，多少分钟前，多少小时前，超过24小时，显示--年--月--日
                let interval = now.getTime() - moment(time).valueOf() //计算时间差
                //计算相差天数
                let intervalDays = Math.floor(interval / (24 * 3600 * 1000))
                //计算出小时数
                let leave1 = interval % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
                let intervalHours = Math.floor(leave1 / (3600 * 1000))
                //计算相差分钟数
                let leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
                let interMinutes = Math.floor(leave2 / (60 * 1000))
                //计算相差秒数
                let leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
                let interSeconds = Math.round(leave3 / 1000)
                if (intervalHours < 1) {
                    if (interMinutes < 1) {
                        rs = `${interSeconds}秒前`
                    } else {
                        rs = `${interMinutes}分钟前`
                    }
                } else {
                    rs = `${intervalHours}小时前`
                }
                return rs;
            }
        }
        return moment(time).format('YYYY-MM-DD');
    }

    handleAvatarError(e) {
        e.target.src = "./images/default.png";
    }

    getMoreListOnCurrent = _ => {
        const { fromProfile = 0 } = this.getHashParams()
        let { resultList, pointsInfo: { pageIndex: pageIdx, countPerPage: countPP }, pageIndex, countPerPage } = this.props
        const { currentListType } = this.state
        const actionMap = {
            0: {
                key: 'getPostDetail',
                pageInfo: {
                    pageNo: ++pageIndex,
                    pageSize: countPerPage,
                }
            },
            1: {
                key: 'getPraiseList',
                pageInfo: {
                    pageNo: ++pageIdx,
                    pageSize: countPP,
                },
            },
        }
        this[actionMap[currentListType].key]({ ...actionMap[currentListType].pageInfo, fromProfile })
    }

    // 在当前页加载更多
    getMoreOnCurrentPage = _ => {
        const { pointsInfo, noMoreData } = this.props
        const { currentListType } = this.state
        const noMore = !+currentListType ? noMoreData : pointsInfo.noMoreData
        return noMore ? null : <div className={styles.moreOnCurrent} onClick={this.getMoreListOnCurrent}>点击查看更多</div>
    } 

    createPostSlaveList() {
        const {resultList, postMaster} = this.props;
        const masterUserId = postMaster.userId;
        let postSlaveList = resultList.map((item, index) => {
            const {userId, isVip, gradeCode, userNickname, createTime, content, mobileText, postLinkList, replyDTOList, praiseCount} = item;
            const levelClassName = gradeCode < 6 ? styles['text--bluebg'] : (
                gradeCode < 11 ? styles['text--yellowbg'] : styles['text--redbg']
            );
            return (
                <div className={styles['post-slave']}>
                    <div className={styles['user-info-panel']}>
                        <div className={styles['user-info-panel-left']}>
                            {this.createAvatar(userId, isVip)}
                            <div className={styles['info-panel--top']}>
                                <span>{userNickname}</span>
                                {(userId === masterUserId) && <span className={styles['text--pinkbg']}></span>}
                            </div>
                            <div className={styles['info-panel--bottom']}>
                                {this.formatTime(createTime)}
                            </div>
                        </div>
                        {/*<div className={styles['user-info-panel-right--reply']}>*/}
                        {/*<span*/}
                        {/*className={classNames(styles['user-info-panel-icon--reply'], styles['user-info-panel-icon--comments'])}></span>*/}
                        {/*<span className={styles['user-info-panel-text']}>评论</span>*/}
                        {/*<span*/}
                        {/*className={classNames(styles['user-info-panel-icon--reply'], styles['user-info-panel-icon--points'])}></span>*/}
                        {/*<span className={styles['user-info-panel-text']}>{praiseCount}</span>*/}
                        {/*</div>*/}
                    </div>
                    <div className={styles.content}
                         dangerouslySetInnerHTML={this.formatContent(content, mobileText, postLinkList)}></div>
                    {(replyDTOList.length == 0) && <div className={styles['reply-container-border']}></div>}
                    {
                        replyDTOList.length ?
                            <ul className={styles['reply-container']}>
                                {this.createReplyList(replyDTOList)}
                            </ul> : ''
                    }
                    {(replyDTOList.length != 0) && <div className={styles['reply-container-border']}></div>}
                </div>
            )
        })

        let postSlaveListEmpty = () => {
            return <div className={styles['post-slave-empty']}>
                <div className={styles['post-slave-empty-text']}>暂时还没有评论 ~</div>
            </div>
        }

        return resultList.length ? postSlaveList : postSlaveListEmpty()
    }

    createReplyList(replyDTOList) {
        const {postMaster} = this.props;
        const masterUserId = postMaster.userId;

        replyDTOList.splice(3);

        let rs = replyDTOList.map(item => {
            const {userId, userNickname, replyToUserNickname, replyToReplyid, content} = item;
            return (
                <li className={styles['reply-item']}>
                    <span className={styles['user-name']}>{userNickname}</span>
                    {
                        userId === masterUserId ?
                            <span className={styles['text--pinkbg']}></span> : ''
                    }
                    {
                        replyToUserNickname &&
                        <span className={styles['user-name']}>
                                &nbsp;回复&nbsp;{replyToUserNickname}
                            </span>
                    }
                    {
                        replyToReplyid === masterUserId &&
                        <span className={styles['text--pinkbg']}></span>
                    }：
                    <span className={styles['text--gray']} dangerouslySetInnerHTML={this.formatContent(content)}></span>
                </li>
            )
        })

        return rs;
    }

    createPointsList = () => {
        const {pointsInfo} = this.props
        const pointsList = pointsInfo.resultList && pointsInfo.resultList.slice()
        const result = (pointsList && (pointsList.length != 0)) && pointsList.map((item, index) => {
            return <div className={styles['parise-line']} key={item.userId + index}>
                <div className={styles['parise-line-left']}>{this.createAvatar(item.userId, item.isVip)}</div>
                <div className={styles['parise-line-right']}><span className={styles.pariseName}>{item.nickname}</span>
                </div>
            </div>
        })
        const pointsListEmpty = () => {
            return <div className={styles['post-slave-empty']}>
                <div className={styles['post-slave-empty-text']}>暂时还没有评论 ~</div>
            </div>

        }
        return (pointsList && (pointsList.length != 0)) ?
            <div className={styles['parise-bg']}>{result}</div> : pointsListEmpty()
    }

    createGetMore() {
        const {resultList = [], pointsInfo = {}} = this.props;
        const pointsList = pointsInfo.resultList && pointsInfo.resultList.slice()
        if ((resultList && pointsList) && (resultList.length == 10 || pointsList.length == 10)) {
            return (
                <GetMore pagedetail='postdetail' param={this.props.params.postMasterId}/>
            )
        } else {
            return null;
        }
    }

    renderBottomNav = _ => {
        const { platformInfo: { env }, sideEffect: { homeHash } } = global
        const { dispatch } = this.props
        const bottomNavProps = {
            dispatch,
            homeHash,
            useForward: false,
        }
        return (
            env === skyNet ? (
                <div className={styles.bottomNavWrapper}>
                    <BottomNav {...bottomNavProps} />
                </div>
            ) : null
        )
    }

    render() {
        const {postMaster, pointsInfo} = this.props
        const {currentListType} = this.state
        const { fromProfile = 0 } = this.getHashParams()
        const {
            userId,
            gradeCode,
            isVip,
            userNickname,
            createTime,
            postSubject,
            content,
            mobileText,
            modifyTime,
            replyCount,
            postLinkList,
            albumParentName,
            praiseCount,
            postStyleType,
        } = postMaster;
        const {totalCount} = pointsInfo
        const praiseClassName = classNames(styles.icon, styles['icon--praise']);
        const replyClassName = classNames(styles.icon, styles['icon--reply']);
        const levelClassName = gradeCode < 6 ? styles['text--bluebg'] : (
            gradeCode < 11 ? styles['text--yellowbg'] : styles['text--redbg']
        );

        return (
            <div>
                {
                    +fromProfile ? null : (
                        <FixedTop pagedetail='postdetail' param={this.props.params.postMasterId}/>
                    )
                }
                <div className={styles.container}>
                    <div className={styles['post-master']}>
                        {postSubject && <div className={styles.title}>{postSubject}</div>}
                        <div className={styles['user-info-panel']}>
                            <div className={styles['user-info-panel-left']}>
                                {this.createAvatar(userId, isVip)}
                                <div className={styles['info-panel--top']}>
                                    {userNickname}
                                    <span
                                        className={classNames(styles['text--lv'], levelClassName)}>Lv.{gradeCode}</span>
                                </div>
                                <div className={styles['info-panel--bottom']}>
                                    <span className={styles['info-panel--bottom-span']}>{albumParentName}</span>
                                    <span>丨</span>
                                    <span
                                        className={styles['info-panel--bottom-span']}>{createTime && this.formatTime(createTime)}</span>
                                </div>
                            </div>
                            {/*去掉关注*/}
                            {/*<GoFollow/>*/}
                        </div>
                        <div className={styles.content}
                             dangerouslySetInnerHTML={this.formatContent(content, mobileText, postLinkList, postStyleType)}>
                        </div>
                        <div className={styles['master-footer']}>
                            <div className={styles['footer-left']}>
                                <span
                                    className={(currentListType === '0') ? styles['footer-left-item--active'] : styles['footer-left-item']}
                                    onClick={() => this.setState({currentListType: '0'})}>
                                    <span className={styles['footer-left-name']}>评论</span>
                                    <span className={styles['footer-left-num']}>{replyCount}</span>
                                    <div
                                        className={(currentListType === '0') ? styles['footer-line-item--active'] : styles['footer-line-item']}></div>
                                </span>
                                <span
                                    className={(currentListType === '1') ? styles['footer-left-item--active'] : styles['footer-left-item']}
                                    onClick={() => this.setState({currentListType: '1'})}>
                                    <span className={styles['footer-left-name']}>赞</span>
                                    <span className={styles['footer-left-num']}>{praiseCount}</span>
                                    <div
                                        className={(currentListType === '1') ? styles['footer-line-item--active'] : styles['footer-line-item']}></div>
                                </span>
                            </div>
                        </div>
                    </div>
                    {currentListType === '0' && this.createPostSlaveList()}
                    {currentListType === '1' && this.createPointsList()}
                    {
                        +fromProfile ? (
                            this.getMoreOnCurrentPage()
                        ) : this.createGetMore()
                    }
                    {
                        +fromProfile ? (
                            this.renderBottomNav()
                        ) : null
                    }
                </div>
            </div>
        )
    }
}

const getPost = (state) => {
    return state.post;
}
const selectors = createSelector(
    [getPost],
    (post) => {
        return {...post};
    }
)

export default connect(selectors)(Post);
