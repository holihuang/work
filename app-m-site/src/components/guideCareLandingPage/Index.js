/*
** @file: GuideCareLandingPage
** @author:huanghaolei
** @date: 2019-11-15
*/
import React from 'react'

import BindWxModal from '../common/BindWxModal'
import util from '../../common/util'
import style from '../../styles/less/guideCareLandingPage.less'
import cfg from './cfg'

const { platformInfo, slog } = util

class GuideCareLandingPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showModal: false,
        }
    }

    componentDidMount() {
        this.getEnv()
        this.staticPvUv()
    }

    getEnv = _ => {
        this.platform = platformInfo() || {}
    }

    staticPvUv = _ => {
        const { route: { path }, location: { query } } = this.props
        const { channel } = query
        const { detailInfo, envName } = this.platform
        const { userId }  = detailInfo || {}
        setTimeout(() => {
            slog(`${path}_entry_page`, {
                userId,
                source: envName,
                channel,
            })
        }, 500)
    }

    handleBtnClk = _ => {
        this.setState({
            showModal: true,
        })
        this.staticClkWxPublicAccount()
    }

    staticClkWxPublicAccount = _ => {
        const { route: { path }, location: { query } } = this.props
        const { channel } = query
        const { detailInfo, envName } = this.platform
        const { userId }  = detailInfo || {}
        slog(`${path}_clicked_wxPublicAccount`, {
            userId,
            source: envName,
            channel,
        })
    }

    onClose = _ => {
        this.setState({ showModal: false })
    }
    render() {
        const { showModal } = this.state
        const { route, location } = this.props
        const modalProps = {
            onClose: this.onClose,
            route,
            location,
        }
        return (
            <div className={style.wrapper}>
                <div className={style.txtWrapper}>
                    <div className={style.txt} dangerouslySetInnerHTML={{__html: cfg.txt}} />
                </div>
                <div className={style.btnWrapper}>
                    <div className={style.btn} onClick={this.handleBtnClk}>{cfg.btnTxt}</div>
                </div>
                {
                    showModal ? <BindWxModal {...modalProps} /> : null
                }
            </div>
        )
    }
}

export default GuideCareLandingPage
