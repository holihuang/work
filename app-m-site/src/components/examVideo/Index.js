/*
** @file: ExamVideo组价
** @author: huanghaolei
** @date: 2020-03-03
*/
import React from 'react'
import Constants from 'Constants/examVideo'
import cfg from './cfg'
import style from 'Styles/less/examVideo.less'
import eyeIcon from 'Images/examVideo/eye.png'

class ExamVideo extends React.Component {
    constructor(props) {
        super(props)
        this.events = [{
            event: 'scroll',
            target: window,
            cb: this.handleScroll,
        }]
        this.state = {
            videoId: '',
            videoUrl: '',
        }
    }

    componentDidMount() {
        // this.toggleEvents(1)
        this.setDocTitle()
        this.getVideoList()
    }

    componentWillUnmount() {
        // this.toggleEvents(0)
    }

    setDocTitle = _ => {
        if (typeof JSBridge !== 'undefined') {
            JSBridge.doAction('actionSetTitle', '', JSON.stringify({
                title: cfg.docTitle,
            }))
        }
    }

    toggleEvents = flag => {
        this.events.forEach(item => {
            const { event, target = document, cb = () => {} } = item
            const action = flag ? 'addEventListener' : 'removeEventListener'
            target[action](event, cb, false)
        })
    }

    getScrollTop = _ => {
        let scroll_top = 0
        if (document.documentElement && document.documentElement.scrollTop) {
            scroll_top = document.documentElement.scrollTop
        }
        else if (document.body) {
            scroll_top = document.body.scrollTop
        }
        return scroll_top
    }

    handleScroll = _ => {
        const scroll = this.getScrollTop() 
        // 窗口高度
         const windowHeight = document.documentElement.clientHeight
         // 文档高度
         const docHeight = document.documentElement.scrollHeight
         // 文档底部加载更多
         if (scroll + windowHeight > docHeight * 5 / 6) {
             this.getVideoList()
         }
    }

    getBasicParams = _ => {
        let params = {}
        if (typeof JSBridge !== 'undefined') {
            const { userId, userAuth } = JSON.parse(JSBridge.getData('userInfo'))
            params = {
                stuId: userId,
                userAuth,
            }
        }
        return params
    }

    getVideoList = _ => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.VIDEO_LIST_REQUESTED,
            payload: {
                params: {
                    ...this.getBasicParams()
                },
            },
        })
    }

    handleClkVideo = e => {
        const { id, url } = e.currentTarget.dataset
        this.setState({
            videoId: id,
            videoUrl: url,
        }, () => {
            this.videoPlay()
        })
        this.recordWatch(id)
    }

    recordWatch = id => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.RECORD_WATCH_REQUESTED,
            payload: {
                params: {
                    ...this.getBasicParams(),
                    videoId: id,
                },
            },
        })
    }

    videoPlay = _ => {
        this.refs.video.play()
    }
    
    renderVideoList = _ => {
        const { examVideo: { videoList } } = this.props
        const { videoUrl: videoUrlState, videoId: videoIdState } = this.state
        return videoList.map(item => {
            const { title, coverUrl, videoUrl, watchCnt, videoId } = item
            return (
                <div className={style.itmWrapper}>
                    {
                        +videoIdState === +videoId ? (
                            <video controls="controls" ref="video" className={style.video} src={videoUrlState}>
                                暂不支持
                            </video>
                        ) : (
                            <div onClick={this.handleClkVideo} className={style.coverWrapper} data-id={videoId} data-url={videoUrl}>
                                <img className={style.cover} src={coverUrl} />
                                <div className={style.coverTxtWrapper}>
                                    <div className={style.watchCnt}>
                                        <img src={eyeIcon} className={style.eye} />
                                        <div className={style.number}>{watchCnt}</div>
                                    </div>
                                    <div className={style.bottom}>
                                        <div className={style.txt}>{title}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            )
        })
    }

    render() {
        return (
            <div className={style.videoRoot}>
                <div className={style.titleWrapper}>
                    <div className={style.title}>
                        考前视频必看
                    </div>
                </div>
                <div className={style.videoWrapper}>
                    { this.renderVideoList() }
                </div>
            </div>
        )
    }
}

export default ExamVideo
