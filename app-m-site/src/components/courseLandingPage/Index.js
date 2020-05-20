/*
** @file: CourseLandingPage
** @author: huanghaolei
** @date: 2019-11-13
*/
import React from 'react'

import BindWxModal from '../common/BindWxModal'
import util from '../../common/util'
import style from '../../styles/less/courseLandingPage.less'
import courseEnd from '../../images/course_cover_end.png'
import courseCup from '../../images/course_cup.png'
import cfg from './cfg'

const { slog, platformInfo } = util

class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showBindWxModal: false
        }
    }

    componentDidMount() {
        this.platform = platformInfo() || {}
        this.staticPvUv()
    }

    staticPvUv = _ => {
        const { location: { query } } = this.props
        const { channel } = query
        const { detailInfo, envName } = this.platform
        const { userId }  = detailInfo || {}
        setTimeout(() => {
            slog('courseLandingPage_entry_page', {
                userId,
                source: envName,
                channel,
            })
        }, 500)
    }

    handleBindWxClk = _ => {
        this.toggleBindWxModal(true)
        this.staticWxPublicAccountClk()
    }

    staticWxPublicAccountClk = _ => {
        const { location: { query } } = this.props
        const { channel } = query
        const { detailInfo, envName } = this.platform
        const { userId }  = detailInfo || {}
        slog('courseLandingPage_clicked_wxPublicAccount', {
            userId,
            source: envName,
            channel,
        })
    }

    onCloseModal = flag => {
        this.toggleBindWxModal(flag)
    }

    toggleBindWxModal = flag => {
        this.setState({
            showBindWxModal: flag
        })
    }

    renderItmPics = opt => {
        const { pic, decPic, mainPicInRight } = opt
        let arr = [{
            pic: decPic,
            isMainPic: false,
        }, {
            pic: pic,
            isMainPic: true,
        }]
        if (!mainPicInRight) {
            arr = arr.reverse()
        }
        return arr.map(item => {
            const { pic, isMainPic } = item
            const picClassName = isMainPic ? 'mainPic': 'decPic'
            return (
                isMainPic ? <img className={style[picClassName]} src={pic} /> : (
                    <div className={style.decPicWrapper}>
                        <img className={style[picClassName]} src={pic} />
                    </div>
                )
            )
        })
    }

    renderGuideList = _ => {
        return cfg.guideList.map((item, index) => {
            const { title, text, pic = '', onlyOnePic = false, mainPicInRight } = item
            const itmPicWrapper = mainPicInRight ? 'guideItmPic' : 'guideItmPicReverse'
            return (
                <div className={style.guideItem} key={index}>
                    <div className={style.guideTitleWrapper}>
                        <div className={style.guideItemOrder}>0{index + 1}</div>
                        <div className={style.guideTitle}>{title}</div>
                    </div>
                    <div className={style.guideTxtWrapper}>
                        <div className={style.guideTxt} dangerouslySetInnerHTML={{ __html: text }} />
                        <div className={style.guideImgWrapper}>
                            {
                                onlyOnePic ? (
                                    <img className={style[`guide${index + 1}`]} src={pic} />
                                ) : (
                                    <div className={style[itmPicWrapper]}>
                                        {   this.renderItmPics(item) }                                
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            )
        })
    }

    render() {
        const { guideCover, btnTxt } = cfg
        const { showBindWxModal } = this.state
        const { courseLandingPage, route, location } = this.props
        const bindModalProps = {
            onClose: this.onCloseModal.bind(this, false),
            route,
            location,
            ...courseLandingPage,
        }
        return (
            <div className={style.wrapper}>
                <div className={style.guideCoverWrapper}>
                    <div className={style.guideCoverTxtWrapper}>
                        <div className={style.guideCoverTxt} dangerouslySetInnerHTML={{ __html: guideCover }} />
                    </div>
                </div>
                {
                    this.renderGuideList()
                }
                <div className={style.courseEndWrapper}>
                    <img className={style.courseEndPic} src={courseEnd} />
                    <div className={style.operBtnWraper}>
                        <div onClick={this.handleBindWxClk} className={style.operBtn}>{btnTxt}</div>
                    </div>
                </div>
                <img className={style.courseCup} src={courseCup} />
                {
                    showBindWxModal ? <BindWxModal {...bindModalProps} /> : null
                }
            </div>
        )
    }
}

export default Index