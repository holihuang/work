/*
** @file: AppDownload - app下载引导页
** @author: huanghaolei
** @date: 2020-3-9
*/

import React from 'react'
import { appLinkDom, gotoApp } from '@sunl-fe/app-link'
import appDownloadIcon from 'Images/examTask/appDownload.png'
import style from 'Styles/less/appDownload.less'

const EXAM_REWARD_BASE_URL = process.env.NODE_ENV === 'production' ? 'http://luntan.sunlands.com' : 'http://172.16.100.203:7089'

class AppDownload extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    componentDidUpdate() {
        // 在这里也调用是为了保证在render中有类似isShow的情况出现时也能正常渲染
        this.renderAppLinkDom();
    }
    
    componentDidMount() {
        this.renderAppLinkDom();
    }
    renderAppLinkDom() {
        if (this.refs.div && !this.refs.div.children.length) {
            this.refs.div.appendChild(appLinkDom({
                pagedetail: 'webview',
                param: encodeURIComponent(`${EXAM_REWARD_BASE_URL}/community-pc-war/m/#/composeCard`),
            }));
        }
    }

    getWrapperStyle = _ => {
        return {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
        }
    }

    getTxtStyle = _ => {
        return {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }
    }

    getTitleStyle = _ => {
        return {
            color: '#ce0000',
        }
    }

    render() {
        return (
            <div style={this.getWrapperStyle()}>
                <div ref="div"></div>
                <div style={this.getTxtStyle()}>
                    <img src={appDownloadIcon} className={style.icon} />
                </div>
            </div>
        )
    }
}

export default AppDownload
