import React, { Component, PropTypes } from 'react'
import { hashHistory, Link } from 'react-router'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import styles from '../../styles/less/course.less'
import throttle from 'lodash/throttle'
import { Toast, Carousel, Icon } from 'antd-mobile'
import ShowAll from '../../components/showAll/Index'

import Topic from '../../components/topic/Index'
import util from '../../common/util'
import { GET_MAJOR_INFO_REQUESTED, GET_POST_BY_MAJORID_REQUESTED } from '../../constants/course'

import playImg from '../../images/course/play.png'
import tip1 from '../../images/course/tip-1.png'
import tip2 from '../../images/course/tip-2.png'
import tip3 from '../../images/course/tip-3.png'
import teacherBox1 from '../../images/course/box1.png'
import teacherBox2 from '../../images/course/box2.png'
import teacherBox3 from '../../images/course/box3.png'
import titleBg1 from '../../images/course/title1.png'
import titleBg2 from '../../images/course/title2.png'
import titleBg3 from '../../images/course/title3.png'
import class1 from '../../images/course/class1.png'
import class2 from '../../images/course/class2.png'
import class3 from '../../images/course/class3.png'
import class4 from '../../images/course/class4.png'

const tipListWithColor = [
    {
        imgSrc: tip1,
        color: '#FE7A7A',
    },
    {
        imgSrc: tip2,
        color: '#719DFC',
    },
    {
        imgSrc: tip3,
        color: '#2ED2DE',
    }
]
const teacherListWithBox = [
    {
        boxSrc: teacherBox1,
        titleBg: titleBg1,
    },
    {
        boxSrc: teacherBox2,
        titleBg: titleBg2,
    },
    {
        boxSrc: teacherBox3,
        titleBg: titleBg3,
    },
]
const classListWithColor = [
    {
        imgSrc: class1,
        color: '#FF7573',
    },
    {
        imgSrc: class2,
        color: '#5E84FF',
    },
    {
        imgSrc: class3,
        color: '#CB5CE9',
    },
    {
        imgSrc: class4,
        color: '#2BBEDF',
    }
]
const basicInfoKeys = [
    { key: 'majorCode', name: '专业代码' },
    { key: 'school', name: '主考院校' },
    { key: 'degreeType', name: '学位类型' },
    // { key: 'courseCount', name: '考试科目' },
    { key: 'condition', name: '报考条件' },
    { key: 'majorProperty', name: '专业性质' },
    { key: 'learnYears', name: '学制' },
    { key: 'examTime', name: '考试时间' },
    { key: 'introduction', name: '专业简介' },
]
var startX, startY, moveEndX, moveEndY, X, Y
const scroolXProps = {
    onTouchMove:
        e => {
            // e.preventDefault()
            moveEndX = e.changedTouches[0].pageX
            moveEndY = e.changedTouches[0].pageY
            X = moveEndX - startX
            Y = moveEndY - startY
            startX = moveEndX
            startY = moveEndY
            const currentTransform = e.currentTarget.style.transform.match(/translateX\((.*)px\)/)
            const listWidth = e.currentTarget.scrollWidth
            const transformWidthNow = currentTransform && currentTransform.length > 1 ? +(currentTransform[1]) : 0
            const maxWidth = listWidth - window.innerWidth
            let translateWidth = X + transformWidthNow
            if (translateWidth > maxWidth) {
                translateWidth = 0
            } else if (translateWidth < -(listWidth - window.innerWidth)) {
                translateWidth = -(listWidth - window.innerWidth)
            }
            e.currentTarget.style.transform = `translateX(${translateWidth > 0 ? 0 : translateWidth}px)`
        },
    onTouchStart:
        e => {
            startX = e.touches[0].pageX
            startY = e.touches[0].pageY
        }
}
class CourseDetail extends React.Component {
    constructor(props) {
        super(props)
        if (typeof JSBridge !== 'undefined') {
            const userInfo = JSON.parse(JSBridge.getData('userInfo'))
            const { userId } = userInfo
            this.userId = userId
        }
        this.state = {
            pageNo: 1,
            pageSize: 10,
            slideIndex: 0,
            teacherIndex: 1,
            navActiveIndex: 0,
            isPlay: false,
            isNavBarFixed: false,
            isLoading: false,
            dataSource: [],
            videoHasPlay: [

            ]
        }
    }

    initNavList = _ => {
        const navArray = []
        const { teacherInfo, schoolInfo, classInfo, learnPlanUrl, lessonFeature } = this.props
        const { dataSource } = this.state
        !!schoolInfo && schoolInfo.length && navArray.push({ key: 'schoolInfo', title: '招生院校' })
        !!teacherInfo && teacherInfo.length && navArray.push({ key: 'teacherInfo', title: '师资实力' })
        !!learnPlanUrl && navArray.push({ key: 'learnPlanUrl', title: '学习规划指导' })
        !!lessonFeature && navArray.push({ key: 'lessonFeature', title: '课程特点' })
        !!classInfo && classInfo.length && navArray.push({ key: 'classInfo', title: '班型介绍' })
        !!dataSource && dataSource.length && navArray.push({ key: 'discuss', title: '学习讨论' })
        return navArray
    }

    handlePlay = type => {
        console.log('video play click', this.videoElems)

        if (typeof JSBridge !== 'undefined') {
            const userInfo = JSON.parse(JSBridge.getData('userInfo'))
            const { isWifi } = userInfo
            if (isWifi !== 'true' && isWifi !== true) {
                Toast.info('非wifi状态，播放将消耗流量')
            }
        }
        const { slideIndex } = this.state
        //this.requestFullScreen(this.videoElems[slideIndex])
        type !== 'controls' && this.videoElems[slideIndex].videoObj.play()
        const copyVideoArray = [...this.state.videoHasPlay]
        copyVideoArray[slideIndex] = true
        this.setState({
            isPlay: true,
            videoHasPlay: copyVideoArray
        })
        this.clickLog('视频播放')
    }
    handleVideoControlPlay = _ => {
        this.handlePlay('controls')
    }

    handlePause = e => {
        this.setState({
            isPlay: false
        })
        this.clickLog('视频暂停')
    }
    requestFullScreen = elem => {
        var elem = document.documentElement
        if (elem.requestFullscreen) {
            elem.requestFullscreen()
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen()
        } else if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen()
        }
    }
    //退出全屏
    exitFullscreen = elem => {
        if (elem.exitFullscreen) {
            elem.exitFullscreen()
        } else if (elem.mozCancelFullScreen) {
            elem.mozCancelFullScreen()
        } else if (elem.webkitCancelFullScreen) {
            elem.webkitCancelFullScreen()
        }
    }

    scrollToAnchor = (anchorName) => {
        if (anchorName) {
            let anchorElement = document.getElementById(anchorName)
            if (anchorElement) {
                anchorElement.scrollIntoView()
                this.wrapper.scrollTop -= 100
            }
        }
    }

    renderTips = list => {
        const tips = list.map((item, index) => {
            return <li key={item} style={{ color: tipListWithColor[index % 3].color }}><img src={tipListWithColor[index % 3].imgSrc} />{item}</li>
        })
        return tips.length ?
            <ul className={styles['character-tips']}>
                {tips}
            </ul> : null
    }

    componentDidMount = () => {
        const { dispatch } = this.props
        const { majorId = '', typeId = '', regionId = '', majorName = '' } = this.props.location.query
        dispatch({
            type: GET_MAJOR_INFO_REQUESTED,
            payload: {
                params: {
                    majorId,
                    typeId,
                    regionId,
                },
            }
        })
        this.getTopicList()
        if (typeof JSBridge !== 'undefined' && majorName) {
            JSBridge.doAction('actionSetTitle', '{}', JSON.stringify({
                title: majorName
            }))
        } else {
            document.title = majorName
        }
    }

    // componentWillReceiveProps = (nextProps) => {
    //     const { course: { topicList: { resultList = [], pageIndex, pageCount, countPerPage } } } = nextProps
    //     const { dataSource } = this.state
    //     if (resultList.length && pageIndex !== this.props.course.topicList.pageIndex) {
    //         this.setState({
    //             dataSource: dataSource.concat(topicList),
    //         })
    //     }
    // }


    renderClassList = classList => {
        return classList.map((item, index) => {
            const { className, classFeatureList = [], price } = item
            return <div className={styles['class-item']}
                style={{
                    backgroundImage: `url(${classListWithColor[index % 4].imgSrc})`,
                    // backgroundSize: 'cover',
                }}
            >
                {/* <img src={classListWithColor[index % 4].imgSrc} /> */}
                <p className={styles['class-title']}> {className}</p>
                <ul className={styles['class-tips']}>
                    {classFeatureList.map(tip => {
                        return <li key={tip} style={{ background: classListWithColor[index % 4].color, backgroundSize: 'cover', }}>{tip.substring(0, 8)}</li>
                    })}
                </ul>
                <p className={styles['price']}><span>￥&nbsp;</span>{price}</p>
            </div>
        })
    }

    handleScroll = e => {
        if (this.navBar && e.target === e.currentTarget) {
            const { scrollTop } = e.currentTarget
            if (!this.navBarOffsetTop)
                this.navBarOffsetTop = this.navBar.offsetTop
            this.setState({
                isNavBarFixed: scrollTop > (this.navBarOffsetTop - 10)
            })
            this.setNavActiveOnScroll(scrollTop)
        }
    }

    setNavActiveOnScroll = throttle(scrollTop => {
        this.navBlocks.forEach((item, index) => {
            const num = item.getBoundingClientRect().top
            if ((num < 200 && num > -200) || (index === 0 && num > 300)) {
                this.setState({
                    navActiveIndex: +index
                
                }, _ => {
                    const { isNavBarFixed } = this.state
                    isNavBarFixed && this.navBar.childNodes[+index].scrollIntoView()
                })
                return
            }
        })
    }, 100)

    handleNavClick = e => {
        if (e.target.tagName === 'LI') {
            const { index, name } = e.target.dataset
            this.scrollToAnchor(name)
            this.setState({
                navActiveIndex: +index
            })
        }
    }

    renderSchoolList = list => {
        const schoolList = []
        for (let i = 0; i < list.length; i = i + 2) {
            schoolList.push(
                <div className={styles['college-double']}>
                    <Link onClick={_ => { this.clickLog(list[i].schoolName) }} to={{ pathname: 'supply', query: { schoolId: list[i].schoolId } }} className={styles['college-item']}
                    // style={{
                    //     background: `url(${list[i].schoolLogo}) 100%`,
                    //     backgroundSize: 'cover',
                    // }}    
                    >
                        <img src={list[i].schoolLogo} width='100%' height='100%' style={{ opacity: 0.7 }} />
                        <div className={styles['college-bg']}>
                            <p className={styles['college-name']}>{list[i].schoolName}</p>
                        </div>

                    </Link>
                    {
                        list[i + 1] ?
                            <Link onClick={_ => { this.clickLog(list[i + 1].schoolName) }} to={{ pathname: 'supply', query: { schoolId: list[i + 1].schoolId } }} className={styles['college-item']}
                            // style={{
                            //     background: `url(${list[i].schoolLogo}) 100%`,
                            //     backgroundSize: 'cover',
                            // }}  
                            >
                                <img src={list[i + 1].schoolLogo} width='100%' height='100%' style={{ opacity: 0.7 }} />
                                <div className={styles['college-bg']}>
                                    <p className={styles['college-name']}>{list[i + 1].schoolName}</p>
                                </div>
                            </Link> : null
                    }
                </div>)
        }
        return schoolList
    }


	/**
	 * 获取话题列表
     * @params {number} params  //若传递次参数则以此参数覆盖默认参数
	 */
    getTopicList = (params) => {
        const { dispatch } = this.props
        const { majorId = '' } = this.props.location.query
        const { pageNo, pageSize } = this.state
        this.setState({
            isLoading: true,
        })
        dispatch({
            type: GET_POST_BY_MAJORID_REQUESTED,
            payload: {
                params: {
                    majorId,
                    pageNo,
                    pageSize,
                    userId: this.userId || -1,
                    ...params,
                },
                cb: topicList => {
                    const { countPerPage, pageIndex, resultList, pageCount } = topicList
                    const { dataSource } = this.state
                    this.setState({
                        pageNo: pageIndex,
                        pageSize: countPerPage,
                        dataSource: dataSource.concat(resultList),
                        pageCount,
                        isLoading: false
                    })
                }
            }
        })
    }

    getMoreTopics = _ => {
        const { pageNo } = this.state
        this.getTopicList({ pageNo: pageNo + 1 })
    }

    createTopicList = _ => {
        const { dataSource, pageCount, pageNo, isLoading } = this.state
        if (dataSource.length) {
            let topicList = []
            topicList = dataSource.map((item) => {
                if (!item) return
                return <div
                    onClick={_ => { this.clickLog('社区帖子') }}
                    className={styles['topic-wrap']}>
                    <Topic kye={item.postMasterId} isOpenNative={true} onClick={this.gotoNativePostPage} {...item} />
                </div>
            })
            return <div>
                {topicList}
                {
                    isLoading ?
                    <div className={styles['more-topics']} onClick={this.getMoreTopics}>加载中...</div>
                    :
                    (pageCount > pageNo ?
                    <div className={styles['more-topics']} onClick={this.getMoreTopics}>加载更多</div>
                    : null)
                }

            </div>
        } else {
            return (<div></div>)
        }
    }

    renderBasicMajorInfo = _ => {
        const { majorId = '', majorName = '', regionId = '' } = this.props.location.query
        const infoList = basicInfoKeys.map(item => {
            const { key, name } = item
            if (this.props[key]) {
                if (key === 'courseCount') {
                    return <li key={name}>{name}：
                                <Link
                            onClick={_ => { this.clickLog('查看全部科目') }}
                            to={{ pathname: 'major', query: { majorId, majorName, regionId, count: this.props[key] } }}
                        >
                            <span className={styles['subject-count']}>{this.props[key]}科 <Icon className={styles['course-right']} style={{ color: '#fe8685' }} type="circle-o-right" /></span>
                        </Link>
                    </li>
                }
                if (this.props[key].length > 20) {
                    return <li key={name}>
                        <ShowAll
                            content={`${name}：${this.props[key]}`}
                            lines={3} ellipsis={<span>... <Icon style={{ color: '#ce0000' }} className={styles['show-all']} type="down" /></span>}>
                        </ShowAll>
                    </li>
                } else {
                    return <li key={name}>{name}：{this.props[key]}</li>
                }
            }
        })
        return <ul className={styles['character-list']}>
            {infoList}
        </ul>
    }

    clickLog = eventName => {
        util.log('clickSubmit.jpg', {
            sendtime: new Date().getTime(),
            product: 'classLP',
            event: encodeURIComponent(eventName) || '',
        })
    }

    render() {
        this.videoElems = []
        this.navBlocks = []
        const navList = this.initNavList()
        const { isPlay, slideIndex, isNavBarFixed, navActiveIndex, dataSource, videoHasPlay } = this.state
        const { videoList, teacherInfo, schoolInfo, classInfo, learnPlanUrl, lessonFeature, majorFeature } = this.props

        return (
            <div ref={ele => this.wrapper = ele} className={styles['course-wrapper']} onScroll={this.handleScroll}>
                {
                    videoList && videoList.length ?
                        <Carousel className={styles['space-carousel']}
                            frameOverflow="visible"
                            cellSpacing={10}
                            slideWidth={0.95}
                            autoplay={!isPlay}
                            autoplayInterval={5000}
                            dots={false}
                            infinite={false}
                            swipeSpeed={1}
                            beforeChange={(from, to) => {
                                // const { slideIndex } = this.state
                                // this.videoElems[slideIndex].videoObj.pause()
                            }
                            }
                            afterChange={index => this.state.slideIndex !== index && this.setState({ isPlay: false, slideIndex: index }, _ => {
                                const { slideIndex } = this.state
                                //videoHasPlay[slideIndex] && this.videoElems[slideIndex].videoObj.play()
                                this.videoElems[slideIndex - 1] && this.videoElems[slideIndex - 1].videoObj.pause()
                                this.videoElems[slideIndex + 1] && this.videoElems[slideIndex + 1].videoObj.pause()
                            })}
                        >
                            {videoList.map((val, index) => {
                                const { title = '', coverUrl = '', videoUrl = '' } = val
                                return (
                                    <div
                                        key={title}
                                        className={styles['slide-item' + (slideIndex === index ? '--active' : '')]}
                                    >
                                        {
                                            videoHasPlay[index] ? null :
                                                <div>
                                                    <img className={styles['video-img']} src={coverUrl} />
                                                    <p className={styles['video-title']}>{title}</p>
                                                </div>

                                        }
                                        {
                                            isPlay ? null :
                                                <img onClick={this.handlePlay} className={styles.play} src={playImg} />
                                        }

                                        <video
                                            key={title + index}
                                            onPlay={this.handleVideoControlPlay}
                                            onPause={this.handlePause}
                                            preload={true}
                                            ref={item => item && this.videoElems.push({ videoObj: item })}
                                            width='100%'
                                            height='100%'
                                            controls={isPlay && slideIndex === index ? 'controls' : ''}
                                        >
                                            <source src={videoUrl} type="video/mp4" />
                                            Your browser does not support HTML5 video.
                                    </video>
                                    </div>)
                            }
                            )}
                        </Carousel>
                        : null
                }

                <div>
                    {this.renderBasicMajorInfo()}
                    {this.renderTips(majorFeature)}
                </div>
                <div>
                    {
                        navList && navList.length > 3 ?
                            <div>
                                {
                                    isNavBarFixed ? <div className={styles['sticky-place']}></div> : null
                                }
                                <ul onClick={this.handleNavClick} ref={ele => this.navBar = ele} className={styles['sticky-nav' + (isNavBarFixed ? '--fixed' : '')]}>
                                    {
                                        navList.map((item, index) => {
                                            return <li key={item.key} data-name={item.key} data-index={index} className={navActiveIndex === index ? styles['active'] : ''}>{item.title}</li>
                                        })
                                    }
                                </ul>
                            </div>
                            : null
                    }

                    {
                        schoolInfo && schoolInfo.length ?
                            <div id='schoolInfo' style={{overflow: 'hidden'}} ref={ele => ele && this.navBlocks.push(ele)} className={styles['nav-item']}>
                                <div className={styles['item-title--school']}>招生院校</div>
                                <div {...scroolXProps} className={styles['college-list']}>
                                    {
                                        this.renderSchoolList(schoolInfo)
                                    }
                                </div>
                            </div> : null
                    }
                    {
                        teacherInfo && teacherInfo.length ?
                            <div id='teacherInfo' ref={ele => ele && this.navBlocks.push(ele)} className={styles['nav-item']}>
                                <div className={styles['item-title--teacher']}>师资实力</div>
                                <Carousel className={styles['teacher-carousel']}
                                    selectedIndex={1}
                                    frameOverflow="visible"
                                    cellSpacing={12}
                                    slideWidth={406 / 750}
                                    autoplay={false}
                                    dots={false}
                                    infinite={false}
                                    swipeSpeed={1}
                                    beforeChange={(from, to) => {

                                    }
                                    }
                                    afterChange={index => this.state.teacherIndex !== index && this.setState({ teacherIndex: index })}
                                >
                                    {teacherInfo.map((val, index) => {
                                        const { imageUrl, teacherName, feature } = val
                                        return (
                                            <div
                                                onClick={_ => { this.clickLog(teacherName + '&' + feature) }}
                                                key={val}
                                                className={styles['teacher-item' + (this.state.teacherIndex === index ? '--active' : '')]}
                                            >
                                                <div className={styles['avator-wrapper' + (this.state.teacherIndex === index ? '--active' : '')]}>
                                                    <img src={imageUrl} />
                                                    <img className={styles['teacher-box']} src={teacherListWithBox[index % 3].boxSrc} />
                                                    <div className={styles['teacher-name' + (this.state.teacherIndex === index ? '--active' : '')]} style={{ background: `url(${teacherListWithBox[index % 3].titleBg})`, backgroundSize: 'cover', }}>{teacherName}</div>
                                                </div>
                                                <p className={styles['teacher-desc']}>{feature}</p>
                                            </div>)
                                    }
                                    )}
                                </Carousel>
                            </div>
                            : null
                    }
                    {
                        learnPlanUrl && learnPlanUrl.length ?
                            <div id='learnPlanUrl' ref={ele => ele && this.navBlocks.push(ele)} className={styles['nav-item']}>
                                <div className={styles['item-title--study']}>学习规划指导</div>
                                <div className={styles['img-wrapper']}>
                                    <img src={learnPlanUrl} />
                                </div>
                            </div>
                            : null
                    }
                    {
                        lessonFeature && lessonFeature.length ?
                            <div id='lessonFeature' ref={ele => ele && this.navBlocks.push(ele)} className={styles['nav-item']}>
                                <div className={styles['item-title--lesson']}>课程特点</div>
                                <div className={styles['img-wrapper']}>
                                    <img src={lessonFeature} />
                                </div>
                            </div>
                            : null
                    }
                    {
                        classInfo && classInfo.length ?
                            <div id='classInfo' style={{overflow: 'hidden'}} ref={ele => ele && this.navBlocks.push(ele)} className={styles['nav-item']}>
                                <div className={styles['item-title--class']}>班型介绍</div>
                                <div {...scroolXProps} className={styles['class-list']}>
                                    {this.renderClassList(classInfo)}
                                </div>
                            </div>
                            : null
                    }
                    {
                        dataSource && dataSource.length ?
                            <div id='discuss' ref={ele => ele && this.navBlocks.push(ele)} className={styles['nav-item']}>
                                <div className={styles['item-title--discuss']}>学习讨论</div>
                                {this.createTopicList()}
                            </div>
                            : null
                    }


                </div>
            </div>
        )
    }
}

const getCourse = (state) => {
    return state.course
}
const selectors = createSelector(
    [getCourse],
    (course) => {
        return { ...course }
    }
)

export default connect(selectors)(CourseDetail)
