/*
** @personalProfile: 公益活动介绍页
** @author: fxr
** @date: 2019-12-24
*/

import React from 'react'

import pic1 from '../../images/publicBenefit/icon-intro-pic-1.png'
import pic2 from '../../images/publicBenefit/icon-intro-pic-2.png'
import pic3 from '../../images/publicBenefit/icon-intro-pic-3.png'
import pic4 from '../../images/publicBenefit/icon-intro-pic-4.png'

import styles from '../../styles/less/publicBenefitList.less'

const isApp = navigator.userAgent.indexOf('sunland') !== -1
class PublicBenefitIntro extends React.Component {
    
    componentDidMount() {
        if (isApp) {
            if (typeof JSBridge === 'undefined') {
                // 老版本app，不能使用 JSBridge
            } else {
                // 新版本app，能够使用 JSBridge
                window.JSBridge.doAction('actionSetTitle', '{}', JSON.stringify({
                    title: '爱心捐赠',
                }))
                window.JSBridge.doAction('hideShareButton', JSON.stringify({}), JSON.stringify({}))
            }
        }
    }
    render() {
        return (
            <div className={styles.introWrapper}>
                <div className={styles.introMain}>
                    <div className={styles.title}>尚进生计划</div>
    
                    <div className={styles.subTitle}>项目简介</div>
    
                    <p> 
                        “尚进生计划”是尚德机构发起的“互联网+教育”公益项目，秉持“尚心联梦立德树人”的理念，
                        以“用教育点亮人生”为愿景，旨在帮助更多人提升学历水平，助力更多教师提高教学水平，
                        促进更多地区实现教育公平。
                    </p>
                    <img src={pic1} alt="" />
                    <p>
                        “尚进生计划”始于2016年，符合申请条件的学员都将获得在尚德机构免费学习一门培训课程或
                        学历课程的学习机会。迄今为止项目已经覆盖全国30个省(直辖市)，共计1721名尚进生参与。
                    </p>
    
                    <div className={styles.subTitle}>结对帮扶</div>
    
                    <p>
                        2018年9月起，尚德机构公益中心积极响应党和政府“打赢脱贫攻坚战”号召，深入调研“三区三州”
                        等贫困地区教育帮扶需求，先后与四川省凉山州喜德县和昭觉县签订对口帮扶协议，通过“尚进生计划”
                        为当地“一村一幼”辅导员免费提供价值400万元的教师资格证考前培训课程以及电视、电脑等学习设备，
                        共覆盖两个县259人。
                    </p>
                    <img src={pic2} alt="" />
                    <img src={pic3} alt="" />
                    <p>
                        2019年系打赢脱贫攻坚战承上启下关键一年，“尚进生计划”将前期在喜德县和昭觉县两地的项目落地经验，
                        推广至四川省凉山州全部17个县（市）以及青海省玉树州囊谦县和称多县，承诺分批次免费提供价值2000
                        万元的教师资格证考前培训课程。2019第一批“尚进生”学员共831人，分布在凉山州和玉树州的19个
                        县（市）。
                    </p>
                    <img src={pic4} alt="" />
                    <div className={styles.subTitle}>“五个一”目标</div>
    
                    <p>
                        2019年，“尚进生计划”全新升级，确立了“五个一”发展目标，即尚德机构将在10年内为“尚进生计划”
                        投入1亿元资金，组建100个定制化服务的“尚进生”班级，招募并组建一支由1000名志愿者组成的“尚心”
                        志愿者服务队，为全国10000名“尚进生”学员提供免费学习机会。
                    </p>
                </div>
            </div>
        )
    }
}

export default PublicBenefitIntro

