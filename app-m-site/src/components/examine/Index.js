/*
 * @Author: litingwei
 * @Date: 2019-09-16 16:27:27
 * @LastEditTime: 2019-09-29 16:01:56
 * @LastEditors: litingwei
 */

import React from 'react'
import { Modal, Toast, List, Button, Icon } from 'antd-mobile'
import moment from 'moment'
import { Base64 } from 'js-base64'

import Truncate from '../truncate/Truncate.CommonJS'
import SlideImage from '../slideImage/slideImage'
import util from '../../common/util'
import { EMOTION_CN_TO_EN } from '../../common/emotion'

import style from '../../styles/less/examine.less'
import Constants from '../../constants/examine'
import CaseHubConstats from '../../constants/caseHub'

import defaultUserIcon from '../../images/defaultUser.png'
import maleIcon from '../../images/male_profile.png'
import femaleIcon from '../../images/female_profile.png'
import vipIcon from '../../images/vip_profile.png'
import teacherIcon from '../../images/teacher_profile.png'
import collegeIcon from '../../images/college_profile.png'
import yellowStarIcon from '../../images/yellowStar.png'
import thumbChose from '../../images/thumb_chose.png'
import thumbEmpty from '../../images/thumb_empty.png'
import thumbProfile from '../../images/thumb_profile.png'
import commentsProfile from '../../images/comments_profile.png'
import noListIcon from '../../images/no-list.png'

import cfg from './cfg'

const certainLength = 3

// fix touch to scroll background page on iOS
// https://github.com/ant-design/ant-design-mobile/issues/307
// https://github.com/ant-design/ant-design-mobile/issues/163
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let wrapProps;
if (isIPhone) {
  // Note: the popup content will not scroll.
  wrapProps = {
    // onTouchStart: e => e.preventDefault(),
  };
}


class Examine extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            picScrollTop: 0,
            showSlideImage: false,
            slideList: [],
            slideImageIndex: 0,
            postLike: 0,
            sel: '',
            visible: false,
            dataForSelect: {},
        }
    }

    componentDidMount() {
        // profile帖子列表
        this.getMyPostList()
    }

    componentWillUnmount() {
        // reset store
        this.resetStore()
    }
    /*
     * @description: 展示屏蔽弹窗
     * @param : e：event data：点击的当条帖子信息
     * @return: 
     */
    showShieldModal = (e, data) => {
        // 现象：如果弹出的弹框上的 x 按钮的位置、和手指点击 button 时所在的位置「重叠」起来，
        // 会触发 x 按钮的点击事件而导致关闭弹框 (注：弹框上的取消/确定等按钮遇到同样情况也会如此)
        e.preventDefault(); // 修复 Android 上点击穿透
        this.setState({
          visible: true,
          dataForSelect: data
        })
    }
    /*
     * @description: 点击确认屏蔽按钮
     * @param : 
     * @return: 
     */
    okShieldModal = () => {
        const {
            dispatch,
            examine: {
                email263,
            }
        } = this.props
        const { postMasterId = '' } = this.state.dataForSelect
        dispatch({
            type: Constants.SET_INVATATION_SHIELD_REQUESTED,
            payload: {
                params: {
                    postMasterId,
                    isHide: 1,
                    firstReason: '未明确原因',
                    secondReason: '简易审核',
                    email: `${email263}@sunlands.com`,
                },
                cb: data => {
                    this.closeShieldModal()
                }
            },
        })
    }
    closeShieldModal = () => {
        this.setState({
          visible: false,
        });
    }

    resetStore = _ => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.ON_RESET_PERSONAL_PROFILE_STORE,
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

    setBodyScroll = _ => {
        document.body.style.overflow = ''
    }

    getSignatureFromWx = res => {
        const { props: { dispatch } } = this
        const { imageUrl, nickName } = res
        let url = window.location.href
        if (url.includes('#')) {
            url = window.location.href.split('#')[0]
        }
        dispatch({
            type: CaseHubConstats.ON_GET_WX_JS_SIGN_REQUESTED,
            payload: {
                params: {
                    url: encodeURIComponent(url),
                },
                cb: data => {
                }
            },
        })
    }
    /*
     * @description: 批量屏蔽功能
     * @param : 
     * @return: 
     */
    doBatchAuditForPost = () => {
        const {
            dispatch,
            examine: {
                postList,
                email263,
            }   
        } = this.props
        const tempArr = []
        postList.forEach((item, index) => {
            tempArr.push(item.postMasterId)
        })
        dispatch({
            type: Constants.DO_BATCH_AUDIT_FOR_POST_REQUESTED,
            payload: {
                params: {
                    isHide: 0,
                    operateFlag: 1,
                    postMasterIds: tempArr,
                    email: `${email263}@sunlands.com`,
                },
                cb: data => {
                        this.getMyPostList()
                }
            },
        })
    }
    /*
     * @description: 获取帖子列表  在回调中重置滚动条位置
     * @param : 
     * @return: 
     */
    getMyPostList = () => {
        const { dispatch, examine: {
            countPerPage,
        } } = this.props
        dispatch({
            type: Constants.GET_MY_POST_LIST_REQUESTED,
            payload: {
                params: {
                    pageSize: countPerPage
                },
                cb: data => {
                        document.querySelector('#examine_container').scrollTop = 0
                }
            },
        })
    }

    getHashParams = _ => {
        const hash = window.location.hash
        const [, hashStr = ''] = hash.split('?')
        const obj = {}
        hashStr.split('&').forEach(item => {
            const [key, value] = item.split('=')
            if (key === 'userId') {
                obj[key] = Base64.decode(value)
            } else {
                obj[key] = value
            }
        })
        return obj
    }

    handleModalClose = _ => {
        this.toggleModal(false)
    }

    setPicScrollTop = _ => {
        const { picScrollTop } = this.state
        this.setBodyScroll()
        document.body.scrollTop = picScrollTop
    }

    convertTo2DimensionalArrWithLengthOf3 = list => {
        const arr = []
        for(let i = 0; i < list.length; i += certainLength) {
            let start = i
            let end = i + certainLength
            arr.push(list.slice(start, end))
        }
        return arr
    }

    onClkImg = (list, e) => {
        const { row, col } = e.currentTarget.dataset
        this.setState({
            picScrollTop: this.getScrollTop(),
            showSlideImage: true,
            slideList: list,
            slideImageIndex: (+row) * +(certainLength) + (+col),
        })
        document.body.style.overflow = 'hidden'
    }

    generateRowImg = (list, row, slicedList) => {
        return (list || []).map((item, index) => (
                <div key={index} className={style.imgWrapperInCnt} data-row={row} data-col={index} onClick={ this.onClkImg.bind(this, slicedList) }>
                    <img src= {item} className={style.imgInCnt} />
                </div>
            )
        )
    }

    handleCloseSlideImage = () => {
        this.setState({ showSlideImage: false })
        this.setPicScrollTop()
     }

    renderRichTxtPic = list => {
        const slicedList = list.slice(0, 9)
        const arr = this.convertTo2DimensionalArrWithLengthOf3(slicedList)
        const dom = []
        arr.forEach((item, index) => {
            const rowImgStyle = item.length < certainLength ? { justifyContent: 'flex-start' } : {}
            dom.push(
                <div key={index} className={style.rowImgInCnt} style={rowImgStyle}>
                    { this.generateRowImg(item, index, slicedList) }
                </div>
            )
        })
        return dom
    }

    handleClkLongPicTxt = postId => {
        this.jumpToPostDetail(postId)
    }

    jumpToPostDetail = postId => {
        window.location.hash = `examineProfileDetail/${postId}?fromProfile=1`
    }

    transTxtToEmotion = content => {
        let cnt = content
        const reg = /\[[^\[\]]*\]/
        const regGlobal = /\[[^\[\]]*\]/g
        const newEmotionArr = []
        // [撒花]格式表情处理
        if (reg.test(content)) {
            const matchedEmotionArr = [...cnt.match(regGlobal)]
            matchedEmotionArr.forEach(item => {
                const txt = item.slice(1, -1)
                const replacedCnt = EMOTION_CN_TO_EN[txt] ? `<img class=${style.emotionStyle} src="./images/emotion/${EMOTION_CN_TO_EN[txt]}.png" alt="emotion_pic">` : null
                newEmotionArr.push(replacedCnt)
            })
            matchedEmotionArr.forEach((item, index) => {
                if (newEmotionArr[index]) {
                    cnt = cnt.replace(item, newEmotionArr[index])
                }
            })
        }
        return cnt
    }

    formatContent = content => {
        return this.transTxtToEmotion(content)
    }

    renderItemContent = (opt, idx) => {
        const { hasRichText, content, postLinkList = [], styleType, title, postMasterId } = opt || {}
        let cnt = content
        let dom = (
            <div>
                <div onClick={this.jumpToPostDetail.bind(this, postMasterId)}>
                    {/* {
                        cnt ? (
                            <Truncate lines={5} ellipsis={<span>...<div><div className={style.cntAllIncnt}>全部</div></div></span>}> */}
                                <div style={{wordWrap: 'break-word'}} dangerouslySetInnerHTML={{ __html: cnt }}></div>
                            {/* </Truncate> 
                        ) : null
                    } */}
                </div>
                <div className={style.imgRootInCnt}>
                    { this.renderRichTxtPic(postLinkList) }
                </div>
            </div>
        )
        // 富文本
        if (+hasRichText) {
            if (!+styleType) {
                // // 富文本
            } else if(+styleType === 2) {
                const [coverPic] = postLinkList
                // 长图文
                dom= (
                    <div className={style.longPicTxtWrapper} onClick={this.handleClkLongPicTxt.bind(this, postMasterId)}>
                        <img src={coverPic} className={style.coverPic} />
                        <div className={style.longPicTxt}>
                            { title }
                        </div>
                    </div>
                )
            }
            
        }
        return (
            <div>
                { dom }
            </div>
        )
    }

    renderPostList = _ => {
        const { examine: { postList } } = this.props
        // 空列表
        if (!postList.length) {
            return (
                <div className={style.emptyListWrapper}>
                    <img src={noListIcon} className={style.noListImg} />
                    <div className={style.noListText}>{cfg.noListTxt}</div>
                </div>
            )
        }
        return postList.map((item, index) => {
            const { title, replyCount, praiseCount, createTime, postMasterId, imageUrl, isVip, gradeCode, userNickname, albumParentName, isShield } = item
            const avatarIcon = imageUrl || defaultUserIcon
            return (
                <div key={index} className={style.itmCntWrapper}>
                    <div className={style.profileWrapperInCnt}>
                        <div className={style.avatarWrapperInCnt}>
                            <img src={avatarIcon} className={style.avatarInCnt} />
                            {
                                isVip ? <img src={vipIcon} className={style.tipIcon} /> : null
                            }
                        </div>
                        <div className={style.profileInRight}>
                            <div className={style.nickNameSexInCnt}>
                                <div className={style.nameInCnt}>{userNickname}</div>
                                {/* <div className={style.levelInCnt}>{`Lv.${gradeCode}`}</div> */}
                            </div>
                            <div className={style.academyInCnt}>{albumParentName}</div>
                        </div>
                    </div>
                    <div className={style.content}>{ this.renderItemContent(item, index) }</div>
                    <div className={style.cntBottom}>
                        {/* <img src={commentsProfile} className={style.commentsProfile} onClick={this.jumpToPostDetail.bind(this, postMasterId)} /> 
                        <div className={style.replyCount} onClick={this.jumpToPostDetail.bind(this, postMasterId)}>{replyCount}</div>
                        <img src={thumbProfile} className={style.thumbProfile} onClick={this.jumpToPostDetail.bind(this, postMasterId)} /> 
                        <div className={style.praiseCount} onClick={this.jumpToPostDetail.bind(this, postMasterId)}>{praiseCount}</div> */}
                        <div className={style.createTimeInCnt}>
                            { createTime }
                        </div>
                        {
                            isShield ?
                                <div className={style.alReadyShield}>已屏蔽</div>
                                :
                                <div onClick={e => this.showShieldModal(e, item)} className={style.setShield}>立即屏蔽</div>
                        }
                    </div>
                </div>
            )
        })
    }

    renderBody = _ => {
        return (
            <div className={style.bodyWrapper}>
                <div>
                    { this.renderPostList() }
                </div>
            </div>
        )
    }

    render() {
        const { showSlideImage, slideList = [], slideImageIndex } = this.state
        const slideImageProps = {
            useNewApi: true,
            imagesArray: slideList,
            imgIndex: slideImageIndex + 1, // 图片索引 + 1
            onClose: this.handleCloseSlideImage,
        }
        return (
            <div id='examine_container' className={style.wrapper}>
                <div className={style.bodyRoot}>{ this.renderBody() }</div>
                <div className={style.refreshList} onClick={this.doBatchAuditForPost}>以上内容已审核处理，继续查看更多内容</div>
                <Modal
                    className={style.setShieldModal}
                    transparent
                    maskClosable={false}
                    visible={this.state.visible}
                >
                    你确定要屏蔽这个帖子吗？
                    <div className={style.setShieldModal_btn}>
                        <div onClick={this.closeShieldModal}>取消操作</div>
                        <div onClick={this.okShieldModal}>确定屏蔽</div>
                    </div>
                </Modal>
                {
                    showSlideImage ? <SlideImage {...slideImageProps} /> : null
                }
            </div>
        )
    }
}

export default Examine