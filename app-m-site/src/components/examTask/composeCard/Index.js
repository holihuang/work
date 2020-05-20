
import React from 'react'
import { Carousel, WingBlank, Toast } from 'antd-mobile'
import { appUtils } from '@sunl-fe/h5-frame'
import Swiper from 'react-id-swiper'
import classNames from 'classnames'
import moment from 'moment'
import { hashHistory } from 'react-router'

import Constants from '../../../constants/examTask'
import backgroundImg from '../../../images/examTask/composeCard/composeCardBg.png'
import topImg from '../../../images/examTask/composeCard/topImg.png'
import carouselDefaultImg from '../../../images/examTask/composeCard/carouseldefault.png'
import composeBackImg from '../../../images/examTask/composeCard/composeBack.png'
import kaoshenBgImg from '../../../images/examTask/composeCard/kaoshenhechenBg.png'
import composeImg from '../../../images/examTask/composeCard/compose.png'
import notComposeImg from '../../../images/examTask/composeCard/notompose.png'
import closeImg from '../../../images/examTask/composeCard/btnClose.png'
import canOpenImg from '../../../images/examTask/composeCard/canOpen.png'
import disabledOpenImg from '../../../images/examTask/composeCard/disabledOpen.png'
import arrowImg from '../../../images/examTask/composeCard/arrow.png'
import openCardImg from '../../../images/examTask/composeCard/openCard.png'
import ruleImg from '../../../images/examTask/composeCard/rule.png'
import ruleShadeImg from '../../../images/examTask/composeCard/ruleShade.png'

import cfg from './cfg'
import style from 'styles/less/composeCard.less'
import { relative } from 'path';

// 定时器中的计数变量
let count = 0

class ComposeCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            drawCardViewFlag: false,
            showTrueCard: false,
            animateCardPath: '',
            showWhichFlag: 'kaoshen',
            carouselPreViewFlag: false,
            carouselPreViewPath: '',
            composeViewViewFlag: false,
            selectCardKey: 'c0',
            withDrawForWeChatFlag: false,
            timeTemp: new Date().getTime(),
        }
        if(typeof JSBridge === 'undefined') {
            console.log('暂未检测到JSBridge')
            this._stuId = ''
            this._userAuth = ''
        } else {
            this._stuId = JSON.parse(JSBridge.getData('userInfo')).userId
            this._userAuth = JSON.parse(JSBridge.getData('userInfo')).userAuth
            // 修改title
            JSBridge.doAction('actionSetTitle', '', JSON.stringify({
                title: '04考期专项活动',
            }))
            // 隐藏分享功能
            JSBridge.doAction('hideShareButton', JSON.stringify({}), JSON.stringify({}))
            window[`saveImgCallBack${this.state.timeTemp}`] = this.closeCarouselPreView
            window[`getWeChatAccountCallBack${this.state.timeTemp}`] = this.bindWeChat
        }
        this.getActiveInfo()
        this.getCardCnt()
        // this.getStuCards()
    }

    // 获取活动信息
    getActiveInfo = () => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.GET_ACTIVITY_INFO_REQUESTED,
            payload: {
                params: {},
                cb: data => {
                    this.getStuCards()
                }
            },
        })
    }
    // 获取学员卡片信息
    getStuCards = () => {
        const {
            composeCard: {
                activeInfo
            },
            dispatch,
        } = this.props
        // console.log(activeInfo)
        dispatch({
            type: Constants.GET_STU_CARDS_REQUESTED,
            payload: {
                params: {
                    stuId: this._stuId,
                    userAuth: this._userAuth,
                },
                cb: data => {
                    // console.log(data)
                    // 用户已和成，并且当前状态处于可开奖状态，去查询用户是已开奖还是未开奖，还是已提现
                   if (data.find((item, index) => item.tag === 'c0').haveCnt !== 0 && activeInfo.getResultMark === 1) {
                        this.getResult()
                   }
                }
            },
        })
    }
    // 查询开奖状态及进行开奖
    getResult = flag => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.GET_RESULT_REQUESTED,
            payload: {
                params: {
                    stuId: this._stuId,
                    userAuth: this._userAuth,
                    open: flag || false,
                },
                cb: data => {
                    if (flag) {
                        // this.getStuCards()
                        // this.getResult()
                    }
                }
            },
        })
    }
    // 获取学员抽卡次数
    getCardCnt = () => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.GET_CARD_CNT_REQUESTED,
            payload: {
                params: {
                    stuId: this._stuId,
                    userAuth: this._userAuth,
                },
                cb: data => {
                }
            },
        })
    }
    // 获取学员某张卡片列表
    getStuCardsByTag = params => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.GET_STU_CARDS_BY_TAG_REQUESTED,
            payload: {
                params: {
                    stuId: this._stuId,
                    userAuth: this._userAuth,
                    tag: params.tag,
                },
                cb: data => {}
            },
        })
    }
    // 轮播图图片点击预览功能
    carouselPreView = (data, e) => {
        // 防止点击前一张 或者后一张 触发预览
        // console.log(e.target.className.indexOf('swiper-slide-active'))
        if (e.target.className.indexOf('swiper-slide-active') === -1) {
            return
        } else {
            this.setState({
                carouselPreViewFlag: true,
                carouselPreViewPath: data.bigCoverUrl,
            })
        }
    }
    // 保存轮播图中的卡片
    saveCarouselImg = path => {
        console.log('调用jsb 保存图片')
        console.log(path)
        if(typeof JSBridge === 'undefined') {
            console.log('暂未检测到JSBridge')
        } else {
            JSBridge.doAction('sharePoster',
                JSON.stringify({
                    succeedCallback: `saveImgCallBack${this.state.timeTemp}`,
                }),
                JSON.stringify({
                    sharePlatForm: '1',
                    imgUrl: path,
                })
            )
        }
        // this.closeCarouselPreView()
    }
    // 关闭轮播图中的图片预览
    closeCarouselPreView = () => {
        this.setState({
            carouselPreViewFlag: false,
            carouselPreViewPath: '',
        })
    }
    // 点击合成按钮
    composeCard = () => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.SYNTHESIZE_REQUESTED,
            payload: {
                params: {
                    stuId: this._stuId,
                    userAuth: this._userAuth,
                },
                cb: data => {
                    // this.getStuCards()
                    this.setState({
                        composeViewViewFlag: true,
                    })
                    // this.getResult()
                }
            },
        })
    }
    // 收下合成卡片
    saveComposeCard = () => {
        this.setState({
            composeViewViewFlag: false,
        })
        this.getStuCards()
        // this.getResult()
    }
    // 提现
    goToWithDraw = () => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.GET_WEIXIN_ACCOUNT_REQUESTED,
            payload: {
                params: {
                    stuId: this._stuId,
                    userAuth: this._userAuth,
                },
                cb: data => {
                    this.setState({
                        withDrawForWeChatFlag: true,
                    })
                }
            },
        })
    }
    // 绑定微信
    bindWeChat = code => {
        if (code) {
            const { dispatch } = this.props
            dispatch({
                type: Constants.BIND_WECHAT_REQUESTED,
                payload: {
                    params: {
                        stuId: this._stuId,
                        userAuth: this._userAuth,
                        code,
                    },
                    cb: data => {
                        this.goToWithDraw()
                    }
                },
            })
        } else {
            Toast.fail('授权失败', 1.5)
        }
    }
    // 跳转微信进行绑定
    goTobindWx = () => {
        console.log('调用jsb 跳转微信进行绑定')
        if(typeof JSBridge === 'undefined') {
            console.log('暂未检测到JSBridge')
        } else {
            console.log('调用jsb 跳转微信进行绑定')
            JSBridge.doAction('wxAuthenticate',
                JSON.stringify({
                    succeedCallback: `getWeChatAccountCallBack${this.state.timeTemp}`,
                }),
                JSON.stringify({})
            )
        }
    }
    // 确定提现
    enSureWithDraw = () => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.WITHDRAW_REQUESTED,
            payload: {
                params: {
                    stuId: this._stuId,
                    userAuth: this._userAuth,
                },
                cb: data => {
                    Toast.success(
                        '提现成功',
                        1.5,
                        this.closeWithDraw,
                    )
                    
                }
            },
        })
    }
    // 提现完成 关闭弹层 并且更新开奖的状态 （刷新页面的视图）
    closeWithDraw = () => {
        this.setState({
            withDrawForWeChatFlag: false,
        })
        // 更新开奖的提现状态
        this.getResult()
    }
    // 点击下方小图片 进行内容切换
    changeDetailShow = data => {
        let value = ''
        this.setState({
            showWhichFlag: data.tag === 'c0' ? 'kaoshen' : 'carousel',
            selectCardKey: data.tag,
        }, () => {
            if (data.tag !== 'c0') {
                this.getStuCardsByTag(data)
            }
        })
    }
    // 抽取卡片
    drawCard = () => {
        const { dispatch } = this.props
        dispatch({
            type: Constants.GET_CARD_REQUESTED,
            payload: {
                params: {
                    stuId: this._stuId,
                    userAuth: this._userAuth,
                },
                cb: data => {
                    this.setState({
                        drawCardViewFlag: true,
                        showTrueCard: true,
                        animateCardPath: cfg.runList[Math.round(Math.random()*4)],
                    })
                    this.randomPath()
                }
            },
        })
    }
    // 抽卡时，前置随机，随机获取图片路径
    randomPath = () => {
        setTimeout(() => {
            if (count >= 10) {
                this.setState({
                    drawCardViewFlag: true,
                    showTrueCard: false,
                    animateCardPath: '',
                })
                count = 0
            } else {
                this.setState({
                    animateCardPath: cfg.runList[Math.round(Math.random()*4)],
                })
                count += 1
                this.randomPath()
            }
        }, 100) 
    }
    // 关闭抽卡弹层
    closeDrawCardView = () => {
        this.setState({
            drawCardViewFlag: false,
        }, () => {
            this.getCardCnt()
            this.getStuCards()
        })
    }
    // 跳转其他路由
    goToOtherPath = path => {
        hashHistory.push(`/${path}`)
    }
    // 渲染中间部位 包含考神卡的详细内容 轮播图内容等
    renderDetail = data => {
        const {
            oppoCnt,
            carouselList,
            activeInfo,
            stuCard,
            bonusStatus,
        } = this.props.composeCard
        const {
            showWhichFlag,
        } = this.state
        const params = {
            slidesPerView: 'auto',
            centeredSlides: true,
            spaceBetween: 30,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            key: new Date().getTime()
        }
        // 不是考神卡 并且有一项数量是0 这时候 不允许合成
        const composeFlag = stuCard.some((item, index) => item.haveCnt === 0 && item.tag !== 'c0' )
        let defaultType = ''
        // 没有考神卡
            // 默认的
            // 集卡状态
        // 有考神卡
            // 开奖
                // 提现
                // 未提现
            // 未开奖
        if (stuCard.length && stuCard.find((item, index) => item.tag === 'c0').haveCnt === 0) {
            // 没有考神卡
            if (stuCard.every((item, index) => item.haveCnt === 0)) {
                // 所有卡片都没有 就是默认的
                defaultType = 'empty'
            } else if (stuCard.some((item, index) => item.haveCnt !== 0)){
                 // 没有考神卡 并且 有其他卡片 是搜集卡片状态
                defaultType = 'collectCard'
            }
        } else if (stuCard.length && stuCard.find((item, index) => item.tag === 'c0').haveCnt !== 0) {
            // 有考神卡
            if (activeInfo.getResultMark === 0 || Object.keys(bonusStatus).length && bonusStatus.status === 0) {
                // 待开奖
                defaultType = 'beforeLottery'
            } else if (Object.keys(bonusStatus).length && (bonusStatus.status === 1 || bonusStatus.status === 2)) {
                // 已开奖
                defaultType = 'lottery'
            }
            // if (Object.keys(bonusStatus).length && bonusStatus.status === 0) {
            //     // 待开奖
            //     defaultType = 'beforeLottery'
            // } else if (Object.keys(bonusStatus).length && (bonusStatus.status === 1 || bonusStatus.status === 2)) {
            //     // 已开奖
            //     defaultType = 'lottery'
            // }
        }
        return (
            <div className={style.container}>
                <div className={style.active_message}>
                    <img src={topImg} alt=""/>
                    <div>集齐5个字，随机瓜分10万考前补贴金</div>
                    <div>已有 <span>{activeInfo.completedCnt}</span> 人集齐</div>
                </div>
                {/* 判断考神卡模块的各种状态 */}
                {
                    showWhichFlag && showWhichFlag === 'kaoshen' &&
                    <div style={{overflow: 'hidden'}}>
                        {
                            defaultType === 'empty' &&
                            <div className={style.active_defaultImg}>
                                <img src={carouselDefaultImg} alt=""/>
                            </div>
                        }
                        {
                            defaultType === 'collectCard' &&
                            <div className={style.active_cardShow}>
                                <div>
                                    <img onClick={composeFlag ? '' : this.composeCard} className={style.composeTip} src={composeFlag ? notComposeImg : composeImg} alt=""/>
                                </div>
                            </div>
                        }
                        {
                            defaultType === 'beforeLottery' &&
                                <div className={style.active_beforeLottery}>
                                    <div>{moment(activeInfo.moneyTime).format('M月D日 HH:mm')}开奖</div>
                                    <img onClick={activeInfo.getResultMark === 1 ? () => this.getResult(true) : null} src={activeInfo.getResultMark === 1 ? canOpenImg : disabledOpenImg} alt=""/>
                                </div>
                        }
                        {
                            defaultType === 'lottery' &&
                                <div className={style.active_lottery}>
                                    <div className={style.active_withDrawMoney}><span>{bonusStatus.money}</span>元</div>
                                    {/* 
                                        可提现
                                            已提现
                                            未提现
                                        不可提现
                                        */}
                                    {
                                        activeInfo.getMoneyMark === 1 && bonusStatus.status === 1 &&
                                        <div className={style.active_canWithDraw} onClick={this.goToWithDraw}>
                                            <span>立即提现</span><img src={arrowImg} alt=""/>
                                        </div>
                                    }
                                    {
                                        activeInfo.getMoneyMark === 1 && bonusStatus.status === 2 &&
                                        <div className={style.active_readyWithDraw}>
                                            <span>已提现</span>
                                        </div>
                                    }
                                    {
                                        activeInfo.getMoneyMark === 2 &&
                                        <div className={style.active_disabledWithDraw}>
                                            <span>不可提现</span>
                                        </div>
                                    }
                                    <div className={style.active_withDrawTime}>请您务必在{moment(activeInfo.activityEndTime).format('M月D日HH:mm')}前提现</div>
                                </div>
                        }
                    </div>
                }
                {/* 轮播图模块 */}
                {
                    showWhichFlag && showWhichFlag === 'carousel' &&
                    <div className={style.active_carousel}>
                        {/* 发现swiper组件 必须连同里面子元素一起生成，不然会出现问题（子元素缺少对应类名）像下面注释的写法 就会有问题 
                        猜测是上面的写法 标签是一同插入 下面注释的写法 是swiper先插入 再插入子元素？*/}
                        {
                            carouselList.length !== 0 &&
                            <Swiper {...params}>
                                {
                                    carouselList.map((item, index) => (
                                        <img key={index} onClick={e => this.carouselPreView(item, e)} src={item.coverUrl} alt=""/>
                                    ))
                                }
                                
                            </Swiper>
                        }
                        {/* <Swiper {...params}>
                            {
                                carouselList.length !== 0 && carouselList.map((item, index) => (
                                    <img key={index} onClick={() => this.carouselPreView(item)} src={item.coverUrl} alt=""/>
                                ))
                            }
                            
                        </Swiper> */}
                    </div>
                }
                {/* 抽卡模块 */}
                <div className={style.active_getMoreTime}>
                    {/* <div onClick={() => this.goToOtherPath('composeRule')} className={style.active_rule}>规则</div> */}
                    {this.renderStuCardList()}
                    <div className={style.active_getCard}>
                        <div
                            onClick={(oppoCnt !== 0 && activeInfo.getCardMark !== 0) ? this.drawCard : null}
                            className={classNames({[style.active_getCardActive]: (oppoCnt !== 0 && activeInfo.getCardMark !== 0), [style.active_getCardDefault]: !(oppoCnt !== 0 && activeInfo.getCardMark !== 0)})}
                        >
                            {
                                activeInfo.getCardMark === 0 ?
                                    <div>抽卡结束</div>
                                    :
                                    <div>
                                        {
                                            oppoCnt === 0 ?
                                                '开始抽卡'
                                                :
                                                `抽卡 x ${oppoCnt}`
                                        }
                                    </div>
                            }
                        </div>
                        <div onClick={() => this.goToOtherPath('examTask')}>增加抽卡次数</div>
                    </div>
                </div>
                <div className={style.active_rules}>
                    <img src={ruleShadeImg} alt=""/>
                    <div>
                        <img src={ruleImg} alt=""/>
                    </div>
                </div>
            </div>
        )
    }
    // 渲染用户已经拥有的卡片列表，即底部的小列表及抽卡模块
    renderStuCardList = data => {
        const {
            stuCard,
        } = this.props.composeCard
        const {
            selectCardKey,
        } = this.state
        return (
            <div className={style.active_ownCard}>
                {
                    stuCard.map((item, index) => (
                        // 如果数量是0的卡片 直接不绑定点击事件 一是不会触发轮播图预览 二是不会触发图片的selected状态
                        <div key={index} onClick={item.haveCnt !== 0 || item.tag === 'c0' ? () => this.changeDetailShow(item) : null}>
                            <div className={style.imgAndTip}>
                                {item.haveCnt !== 0 && item.tag !== 'c0' && <div>{item.haveCnt}</div>}
                                {/* 判断图片是不是selected状态 如果不是 再判断有没数量 使用default状态 还是normal状态 */}
                                {
                                    selectCardKey === item.tag ?
                                        <img src={cfg.cardMessage[item.tag].selected} alt=""/>
                                        :
                                        <img src={item.haveCnt === 0 ? cfg.cardMessage[item.tag].defaultImg : cfg.cardMessage[item.tag].normalImg} alt=""/>
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        )
    }
    render() {
        const {
            cardMessage,
            bonusStatus,
            nickName,
        } = this.props.composeCard
        const {
            drawCardViewFlag,
            carouselPreViewFlag,
            carouselPreViewPath,
            showTrueCard,
            animateCardPath,
            composeViewViewFlag,
            withDrawForWeChatFlag,
        } = this.state
        console.log('animateCardPath', animateCardPath)
        console.log('cardMessage.bigCoverUrl', cardMessage.bigCoverUrl)
        return (
            <div style={{width: '100%', height: '100%', position: 'relative',}} >
                {this.renderDetail()}
                {/* 抽卡的弹层 */}
                <div className={style.drawCardView} style={{display: drawCardViewFlag ? 'block' : 'none'}}>
                    {/* {
                        showTrueCard ?  */}
                            {
                                animateCardPath && <img className={style.animateCard} src={animateCardPath} alt=""/>
                            }
                            {
                                !animateCardPath && cardMessage.bigCoverUrl && <img className={style.cardMessage} src={cardMessage.bigCoverUrl} alt=""/>
                            }
                    {/* } */}
                    {
                        !animateCardPath &&
                        <div onClick={this.closeDrawCardView} className={style.acceptCard}>{cardMessage.type === 2 ? '收下卡片' : '我知道了'}</div>
                    }
                </div>
                 {/* 轮播图图片预览的弹层 */}
                <div className={style.carouselPreView} style={{display: carouselPreViewFlag ? 'block' : 'none'}}>
                    <img className={style.cardMessage} src={carouselPreViewPath} alt=""/>
                    <div onClick={() => this.saveCarouselImg(carouselPreViewPath)} className={style.acceptCard}>保存图片</div>
                    <img onClick={this.closeCarouselPreView} className={style.closeView} src={closeImg} alt=""/>
                </div>
                 {/* 合成考神卡的弹层 */}
                <div className={style.composeView} style={{display: composeViewViewFlag ? 'block' : 'none'}}>
                    <img className={style.cardMessage} src={openCardImg} alt=""/>
                    <img className={style.animateCard} src={composeBackImg} alt=""/>
                    <div onClick={this.saveComposeCard} className={style.acceptCard}>收下</div>
                    {/* <img onClick={this.saveComposeCard} className={style.closeView} src={closeImg} alt=""/> */}
                </div>
                 {/* 提现的弹层 */}
                <div className={style.withDrawForWeChat} style={{display: withDrawForWeChatFlag ? 'block' : 'none'}}>
                    <div className={style.withDrawTip}>
                        {
                            nickName ?
                            <div className={style.readyBindWeChat}>
                                <div>提现至微信号</div>
                                <div>{nickName}</div>
                                <div onClick={this.enSureWithDraw}>确定</div>
                            </div>
                            :
                            <div className={style.notBindWeChat}>
                                <div>前往绑定微信提现账号</div>
                                <div onClick={this.goTobindWx}>去绑定</div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default ComposeCard
