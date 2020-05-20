/*
** @personalProfile: 公益活动爱心捐赠列表信息
** @author: fxr
** @date: 2019-12-17
*/

import React from 'react'
import { hashHistory } from 'react-router'
import classNames from 'classnames'
import { Carousel } from 'antd-mobile'

import { GET_PROJECT_LIST_REQUESTED } from 'Constants/publicBenefit.js'

import util from '../../common/util'
import styles from '../../styles/less/publicBenefit.less'

// import defaultPic from '../../images/default.png'
import listPic from '../../images/publicBenefit/icon-case-pic-1.png'

const { slog } = util

class ListInfo extends React.Component {

    componentDidMount() {
        this.getProjectList()
    }

    // 处理头像获取不到时
    checkAvatarError = e => {
        e.target.src = listPic
    }

    // 获取爱心项目列表
    getProjectList = () => {
        const { dispatch } = this.props
        const params = {
            pageNo: 1,
            pageSize: 10,
            orderBy: '-id',
        }
        dispatch({
            type: GET_PROJECT_LIST_REQUESTED,
            payload: {
                params,
                source: 'home',
            },
        })
    }

    handleJump = projectNo => {
        hashHistory.push(`/publicBenefitDetail/${projectNo}`)
    }

    randomArr = maxcount => {
        const arr = []
		for(var i=0; i<= maxcount; i++){
			arr.push(i)
		}
		return arr
    }

    randomNumBoth = (arr, maxNum) => {
        const numArr = []
        // 最大循环次数
        const arrLength = arr.length
        for(let i = 0; i < arrLength; i++){
			// 获取arr的长度
			const Rand = arr.length
			// 取出随机数 
			const number = Math.floor(Math.random()*(Rand -1)) //生成随机数num
			// 往新建的数组里面传入数值
 			numArr.push(arr[number])
 			// 传入一个删除一个，避免重复
 			arr.splice(number,1)
 			if(arr.length <= arrLength - maxNum){
				return numArr
 			}
		}
    }

    renderProListItem = list => {
        let renderList = []
        if (list.length < 3) {
            renderList = list
        } else {
            const numArr = this.randomNumBoth(this.randomArr(list.length), 3)
            numArr.map((item)=> {
                renderList.push(list[item])
            })
        }
        return renderList && renderList.length > 0 && renderList.map((listItem, index) => {
            const {
                projectNo, // 项目编号
                title, // 标题
                listImageUrl = '', // 列表图
                coverImageUrl = '', // 封面图
                targetKindnessCount, // 目标捐赠爱心数
                donatedKindnessCount, // 已经捐赠爱心数
                completeStatus, // Number 说明:状态 0 未满 1已满
            } = listItem
            const countRate = (donatedKindnessCount/targetKindnessCount) * 100
            const itemStyle = classNames({
                [styles.listItem]: index === 0,
                [styles.listItemSmall]: index !== 0,
                [styles.listItemLast]: index === renderList.length -1,
            })
            return (
                <div
                    className={itemStyle}
                    key={`listItem_${projectNo}`}
                    onClick={() => { this.handleJump(projectNo) }}
                >
                    <img
                        src={coverImageUrl || listPic}
                        alt=""
                        className={styles.listItemPic}
                        onError={e =>this.checkAvatarError(e)}
                    />
                    {index === 0 && <div className={styles.listItemPicPop}/>}
                    <div className={styles.listItemTitle}>{title}</div>
                    <div className={styles.listItemCountPanel}>
                        {index === 0 ?
                        <div>
                            <div className={styles.listProcessGray}>
                            <span
                                className={styles.listProcessRed}
                                style={{ width: `${countRate}%` }}
                            />
                            </div>
                            <div className={styles.listItemCount}>
                                <div className={styles.listItemCountLine}>
                                    <div>已获得爱心</div>
                                    <div className={styles.colorOrange}>{donatedKindnessCount}</div>
                                </div>
                                <div className={styles.listItemCountLine}>
                                    <div>目标爱心</div>
                                    <div className={styles.colorOrange}>{targetKindnessCount}</div>
                                </div>
                            </div>
                        </div> :
                        <div>
                            <div className={styles.listItemCount}>
                                <span>已获得</span>
                                <span className={styles.colorOrange}>{donatedKindnessCount}</span>
                                <span>颗爱心</span>
                            </div> 
                            <div className={styles.listProcessGray}>
                                <span
                                    className={styles.listProcessRed}
                                    style={{ width: `${countRate}%` }}
                                />
                            </div>
                        </div>
                        }
                    </div>
                </div>
            )
        })
    }

    render() {
        const { publicBenefit: { userInfo, projectHomeInfo } } = this.props
        const {
            sunlandCoin, // 尚德元数
            kindnessCount, // 剩余爱心数
            donatedKindnessCount, // 以捐赠爱心数
            donatedTimesCount, // donatedTimesCount
            student,
        } = userInfo
        const {
            avatar, // 头像
            nickname, // 昵称
        } = student || {}
        const {
            dataSource: projectHomeList,
        } = projectHomeInfo
        return (
            <div>
                <div className={styles.listInfoWrapper}>
                    <div className={styles.listInfoTitle}>
                        <div className={styles.listInfoLeft}>
                            爱心捐赠
                        </div>
                        <div
                            className={styles.listInfoRight}
                            onClick={() => {
                                hashHistory.push('/publicBenefitList');
                                slog('view_more', { userId: this.props.userId })
                            }}>
                            更多
                        </div>
                    </div>
                    <div className={styles.listItemWrapper} >
                        {/* {projectHomeList && projectHomeList.length > 0  ?
                            <Carousel
                                className={styles.carousel}
                                dots={false}
                                cellSpacing={60}
                                slideWidth={0.6}
                                cellAlign="left"
                                infinite={false}
                                swipeSpeed={1}
                                beforeChange={(e)=>{console.log(e)}}
                            >
                                {projectHomeList[0].map(this.renderProListItem)}
                            </Carousel> : null
                        } */}
                        {(projectHomeList && projectHomeList.length > 0) ? this.renderProListItem(projectHomeList) : null}
                    </div>
                </div>
            </div>
        )
    }
}

export default ListInfo
