import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import { createSelector } from 'reselect';
import { url } from '@sunl-fe/util';
import moment from 'moment';
import weixinShare from '@sunl-fe/wechat-tools';
import classNames from 'classnames';
import styles from '../../styles/less/school.less';
import { ml10 } from '../../styles/less/common.less';
import util from '../../common/util';
import { EMOTION_CN_TO_EN, EMOTION_EN_TO_CN } from '../../common/emotion';
import FixedTop from '../../components/fixedTop/Index';
import { envCfg } from '../../common/envCfg';
import GetMore from '../../components/getMore/Index';

import { GET_SCHOOL_PAGE_DATA_REQUESTED } from '../../constants/school';

class School extends React.Component {
    static defaultProps = {
        postMaster: {},
        resultList: []
    }

    constructor(props) {
        super(props);

        this.state = {
            isFold: true
        }
    }

    componentDidMount() {
        const {videoId} = this.props.params;
        this.getPageData(videoId);
    }

    getPageData(videoId) {
        const {dispatch} = this.props;
        dispatch({
            type: GET_SCHOOL_PAGE_DATA_REQUESTED,
            videoId
        })
    }

    //微信二次分享配置
    componentWillReceiveProps(nextProps) {
        if (nextProps.params.videoId != this.props.params.videoId) {
            this.getPageData(nextProps.params.videoId);
        }

        const {videoDetail} = nextProps;
        if (videoDetail) {
            const {name, videoBrief, shortUrl} = videoDetail;
            weixinShare({
                title: name,
                desc: videoBrief || '学习是一种信仰',
                py: {
                    imgUrl: shortUrl
                }
            });
        }
    }

    componentDidUpdate() {
        //滚动到最顶部
        window.scrollTo(0, -1000);
    }

    attachCustomAttributes(domNode) {
        if (domNode) {
            domNode.setAttribute('webkit-playsinline', true);
            domNode.setAttribute('playsinline', true);
        }
    }

    createVideoDetail() {
        const {videoDetail} = this.props;
        const {videoUrl, videoBrief, videoType, name, playCount, userPraiseCount, address, tel, workTime} = videoDetail;
        const numClass = classNames(styles['text--gray8'], ml10);
        return (
            <div>
                <video 
                    ref={this.attachCustomAttributes}
                    className={styles.video} 
                    src={videoUrl} 
                    controls="controls" 
                    autoPlay>
                </video>
                <h1 className={styles.title}>{name}</h1>
                <div className={styles['num-panel']}>
                    <div className={styles.fl}>
                        <i className={styles['icon-eye']}></i>
                        <span className={numClass}>{playCount}</span>
                    </div>
                    <div className={styles.fr}>
                        <i className={styles['icon-praise']}></i>
                        <span className={numClass}>{userPraiseCount}</span>
                    </div>
                </div>
                {
                    videoType === 3 ? ( //分校
                        <div className={styles.content}>
                            <div>
                                <p className={styles.address}>
                                    <i className={styles['icon-address']}></i>
                                    {address}
                                    <a href={ "tel:" + tel } className={styles['icon-phone']}></a>
                                </p>
                            </div>
                            <div>
                                <p className={styles.time}>
                                    <i className={styles['icon-time']}></i>
                                    {workTime}
                                </p>
                            </div>
                        </div>
                    ) : (
                        videoBrief ? (
                            this.state.isFold ? (
                                <div className={styles.ellipsis}>
                                    <div className={styles['ellipsis-container']}>
                                        <div className={styles['ellipsis-content']}>
                                            {videoBrief}
                                        </div>
                                        <div className={styles['ellipsis-ghost']}>
                                            <div className={styles['ellipsis-placeholder']}></div>
                                            <div className={styles['ellipsis-more']} onClick={this.unfold}>...更多</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.content}>
                                    {videoBrief} <span className={styles.red} onClick={this.fold}>收起</span>
                                </div>
                            )
                        ) : null
                    )
                }
            </div>
        )
    }

    createVideoList() {
        const {suggestedVideoList = []} = this.props;
        return suggestedVideoList.map((item, index) => {
            const {videoId, name, brief, shortUrl, videoType, schoolAddress, schoolTel} = item;

            return (
                <li className={styles['list-item']} key={index} onClick={_ => this.handleClickItem(videoId)}>
                    <div className={styles['pic-wrapper']}>
                        <img src={shortUrl} className={styles.pic} />
                        <div className={styles.mask}></div>
                        <i className={styles['icon-video']}></i>
                    </div>
                    <h2 className={styles['title--small']}>{name}</h2>
                    {
                        videoType === 3 ? (
                            <div>
                                <p className={styles['brief--line']}>地址：{schoolAddress}</p>
                                <p className={styles['brief--line']}>电话：{schoolTel}</p>
                            </div>
                        ) : (
                            <p className={styles.brief}>{brief}</p>
                        )
                    }
                </li>
            )
        })
    }

    handleClickItem = (videoId) => {
        hashHistory.push(`/school/${videoId}`);
    }

    unfold = _ => {
        this.setState({
            isFold: false
        });
    }

    fold = _ => {
        this.setState({
            isFold: true
        })
    }

    //统计“打开app”的点击次数
    statOpenApp = _ => {
        const {videoDetail} = this.props;
        //videoDetail 默认值为null
        if (videoDetail) {
            const {videoId} = videoDetail;
            _hmt.push(['_trackEvent', 'click_openapp', 'click', 'video_id', videoId]);
        }
    }

    render() {
        const {videoDetail, suggestedVideoList} = this.props;

        if (videoDetail) {
            const {videoId, videoType, videoUrl} = videoDetail;
            const paramValue = `${videoId},${videoType},${videoUrl}`; //唤起app参数

            return (
                <div>
                    <FixedTop pagedetail='schoolvideo' param={videoId} videourl={videoUrl} videotype={videoType}/>
                    <div className={styles['video-info']}>
                        {this.createVideoDetail()}
                    </div>
                    <div className={styles['list-wrapper']}>
                        <p className={styles['list-title']}>相关推荐</p>
                        <div className={styles['list']}>
                            {this.createVideoList()}
                        </div>
                    </div>
                </div>
            )
        } else {
            return null;
        }
    }
}

const getSchool = (state) => {
    return state.school;
}
const selectors = createSelector(
    [getSchool],
    (school) => {
        return {...school};
    }
)

export default connect(selectors)(School);
