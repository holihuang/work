import React, {Component, PropTypes} from 'react'
import classNames from 'classnames'
import moment from 'moment'
import util from '../../common/util'
import style from '../../styles/less/learnGroupRank.less'
import constant from '../../constants/learnGroupRank'
import URLS from '../../constants/URLS'

import class_default_img from '../../images/learnGroupRank/class_default.jpg'
import class_selected_img from '../../images/learnGroupRank/class_selected.png'
import brush_default_img from '../../images/learnGroupRank/brush_default.jpg'
import brush_selected_img from '../../images/learnGroupRank/brush_selectd.png'
import head_title_img from '../../images/learnGroupRank/head_title.png'
import head_message_img from '../../images/learnGroupRank/head_message.jpg'
import first_rank_img from '../../images/learnGroupRank/first_rank.png'
import second_rank_img from '../../images/learnGroupRank/second_rank.png'
import third_rank_img from '../../images/learnGroupRank/third_rank.png'
import others_rank_img from '../../images/learnGroupRank/others_rank.png'
import default_user from '../../images/defaultUser.png'

class LearnGroupRank extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            groupId: Number(util.getURLParams().groupId || '' ),
            brushOrClass: 'class',
            dayOrWeek: 'day',
            queryTime: util.getURLParams().queryTime || moment(new Date()).format('YYYY-MM-DD'),
        }
        this.getRankDetail('class', 'day')
       
    }
    componentDidMount() {
        this.shareForApp()
        setTimeout(() => {
            util.slog('learnGroupRank_Main_page')
        }, 1000);
    }
    // 切换刷题榜和听课榜
    changeBrushOrClass = brushOrClass => {
        if (this.state.brushOrClass === brushOrClass) {
            return
        }
        this.setState({
            brushOrClass: brushOrClass,
            dayOrWeek: 'day',
        })
        this.getRankDetail(brushOrClass, 'day')
    }
    // 切换日榜和周榜
    changedayOrWeek = dayOrWeek => {
        if (this.state.dayOrWeek === dayOrWeek) {
            return
        }
        this.setState({
            dayOrWeek: dayOrWeek,
        })
        this.getRankDetail(this.state.brushOrClass, dayOrWeek)
    }
    // 获取页面数据
    getRankDetail = (brushOrClass, dayOrWeek) => {
        this.props.dispatch({
            type: constant.GET_GROUP_RANK_DETAIL_REQUESTED,
            payload: {
                params: {
                    groupId:  Number(util.getURLParams().groupId || -1 ),
                    queryTime: this.state.queryTime,
                    brushOrClass,
                    dayOrWeek,
                },
                cb: () => {},
            }
        })
    }
    // moment中传入dddd 获取到的是英文的星期，所以传入d，根据状态判断
    checkWeekStatus = weekStatus => {
        let value = ''
        switch (weekStatus) {
            case '0':
                value = '星期日' 
                break;
            case '1':
                value = '星期一' 
                break;
            case '2':
                value = '星期二' 
                break;
            case '3':
                value = '星期三' 
                break;
            case '4':
                value = '星期四' 
                break;
            case '5':
                value = '星期五' 
                break;
            case '6':
                value = '星期六' 
                break;
            default: 
                break;
        }
        return value
    }
    // 处理头像获取不到时
    checkAvatarError = e => {
        e.target.src = default_user
    }
    // 处理排行的背景图
    checkRankImg = index => {
        let imgSrc = ''
        if (index === 0) {
            imgSrc = first_rank_img
        } else if(index === 1) {
            imgSrc = second_rank_img
        } else if (index === 2) {
            imgSrc = third_rank_img
        } else {
            imgSrc = others_rank_img
        }
        return imgSrc
    }
    // app中分享功能
    shareForApp(params) {
        if(typeof JSBridge === 'undefined') {
            // 没有获取到jsb
        } else {
            console.log('分享：设置setShareContent')
            JSBridge.doAction(
                'setShareContent',
                JSON.stringify({
                    succeedCallback: '',
                    failedCallback: '',
                }),
                JSON.stringify({
                    title: '学习小组周报来啦',
                    content: `与优秀的人一起学习，早日通关拿证咯~(${this.state.queryTime}更新)`,
                    url: `${URLS.learnGroupShareUrl}?groupId=${this.state.groupId}&queryTime=${this.state.queryTime}`,
                    imgUrl: 'https://sfs-public.shangdejigou.cn/social_community/original/20190911/1171741341770194944.jpg',
                    channel: 1,
                })
            )
            console.log('分享：设置showShareButton')
            JSBridge.doAction('showShareButton', JSON.stringify({}), JSON.stringify({}))
        }
    }
    render() {
        const {
            data: {
                rankList,
                dateRange,
                renderFlag,
                overAMonth,
            },
        } = this.props
        return (
            <div className={style.container}>
                {
                    // 添加renderFlag 在reducer中存储，
                    // 请求完成 renderFlag设置为true
                    // 分开去判断是因为rankList.length有可能从0变为不为0，出现渲染了empty，又渲染成full
                    renderFlag && !overAMonth ? 
                        <div className={style.detailShow_full}>
                            <div className={style.head}>
                                <img src={head_title_img} alt=""/>
                                <div className={style.head_date}>
                                    {moment(this.state.queryTime).format('YYYY年MM月DD日')}
                                    &ensp;{this.checkWeekStatus(moment('2018-09-09').format('d'))}
                                </div>
                                <div className={style.head_message}>
                                    <img src={head_message_img} alt=""/>
                                    <div>
                                        学习非一日之功，而在每日的点滴进步！小组学习情况请查阅，祝大家在组长的带领下勤勉学习，早日拿证！
                                    </div>
                                </div>
                            </div>
                            <div >
                                <div className={style.typeChange}> 
                                    <img
                                        src={ this.state.brushOrClass === 'class' ? class_selected_img : class_default_img }
                                        alt=""
                                        onClick={() => this.changeBrushOrClass('class')}
                                        className={style[classNames({img_selected:this.state.brushOrClass === 'class'})]}
                                    />
                                    <img
                                        src={ this.state.brushOrClass === 'brush' ? brush_selected_img : brush_default_img }
                                        alt=""
                                        onClick={() => this.changeBrushOrClass('brush')}
                                    />
                                </div>
                                <div className={style.dateChange}>
                                    <div
                                        onClick={() => this.changedayOrWeek('day')}
                                        className={style[classNames({changedayOrWeek: this.state.dayOrWeek === 'day'})]}
                                    >
                                        <div>日榜</div>
                                        <div className={style[classNames({dateChange_select_line: this.state.dayOrWeek === 'day'})]} />
                                    </div>
                                    <div
                                        onClick={() => this.changedayOrWeek('week')}
                                        className={style[classNames({changedayOrWeek: this.state.dayOrWeek === 'week'})]}
                                    >
                                        <div>周榜</div>
                                        <div className={style[classNames({dateChange_select_line: this.state.dayOrWeek === 'week'})]} />
                                    </div>
                                    <div className={style.dateShow}>更新时间  {dateRange}</div>
                                </div>
                            </div>
                            <div className={style.detailShow}>
                                {
                                    rankList.length ? 
                                        <ul>
                                            {
                                                rankList.length && rankList.map((item, index) => (
                                                    <li key={item.userId} className={style.detailShow_rankItem}>
                                                        <div className={style.detailShow_rank}>
                                                            <div>{index + 1}</div>
                                                            <img src={this.checkRankImg(index)} alt=""/>
                                                        </div>
                                                        <div className={style.detailShow_avatar}>
                                                            <img src={item.headImg} alt="" onError={e =>this.checkAvatarError(e)}/>
                                                        </div>
                                                        <div className={style.detailShow_name}>{item.userNickName}</div>
                                                        <div className={style.detailShow_detail}>
                                                            {/* 数字 使用 toLocaleString 才能加千分位 */}
                                                            <div>{this.state.brushOrClass === 'class' ? item.values : Number(item.values).toLocaleString()}{}</div>
                                                            <div>{this.state.brushOrClass === 'class' ? '小时' : '道'}</div>
                                                        </div>
                                                    </li>

                                                ))
                                            }
                                        </ul>
                                        :
                                        <div className={style.detailShow_emptyTip}>
                                            暂无组员的学习数据哦~
                                        </div>
                                }
                            </div>
                        </div>
                        :
                        null
                }
                {
                    overAMonth && renderFlag ?
                        <div className={style.detailShow_overTimeTip} />
                        :
                        null
                }
            </div>
        )
    }   
}
LearnGroupRank.propTypes = {
    rankList: PropTypes.array,
    dateRange: PropTypes.string,
    renderFlag: PropTypes.bool,
}

LearnGroupRank.defaultProps = {
    rankList: [],
    dateRange: '',
    renderFlag: false,
}

export default LearnGroupRank