/*
** @file BindWxModal
** @author: huanghaolei
** @date: 2019-11-13
*/
import React from 'react'
import { Modal, Toast } from 'antd-mobile'

import getJSON from '../../common/dataService'
import URLS from '../../constants/URLS'
import util from '../../common/util'
import modalStyle from '../../styles/less/bindWxModal.less'
import bindModalClose from '../../images/bind_modal_close.png'

const modalTxtSet = {
    0: `长按图片保存二维码至您的手机<br/>请使用微信扫一扫-从相册选取二维码`,
    1: `点击按键将保存二维码至您的手机<br/>请使用微信扫一扫-从相册选取二维码`,
}
const modalBtnTxt = '保存图片并微信扫码关注'
const failTxt = '图片自动保存失败，请在微信搜索关注公众号'
const appVersionOfWxScan = '4.3.2'

class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showWxScanBtn: false
        }
    }

    componentDidMount() {
        this.getEnvInfo()
        this.insertCbToWindow()
        this.checkAppHasWxScan()
        this.getQrUrl()
    }

    getEnvInfo = _ => {
        this.platform = util.platformInfo() || {}
    }

    insertCbToWindow = _ => {
        if(typeof JSBridge !== 'undefined') {
            const now = new Date().getTime()
            const arr = [{
                name: 'succeedCallback',
                cb: function() {
                    JSBridge.doAction('openWxScan', '', '')
                }
            }, {
                name: 'failedCallback',
                cb: function() {
                    Toast.fail(failTxt)
                },
            }]
            arr.forEach(item => {
                const { name, cb } = item
                this[name] = `${name}_${now}`
                window[`${name}_${now}`] = cb
            })
        }
    }

    checkAppHasWxScan = _ => {
        if (util.appVersionAbove(appVersionOfWxScan)) {
            this.setState({
                showWxScanBtn: true,
            })
        }
    }

    getQrUrl = _ => {
        const { detailInfo: { userId } } = util.platformInfo()
        const params = {
            userId,
            type: 1,
        }
        getJSON(URLS.GET_QR_CODE_URL, params).then(res => {
            const { resultMessage = {} } = res
            this.setState(resultMessage)
        })
    }

    handleLongPress = e => {
        const { url } = e.target.dataset
        util.downloadPic(url)
        this.staticPicDownload()
    }

    staticPicDownload = _ => {
        const { route: { path }, location: { query } } = this.props
        const { channel } = query
        const { detailInfo, envName } = this.platform
        const { userId }  = detailInfo || {}
        util.slog(`${path}_clicked_qrPicDownload`, {
            userId,
            source: envName,
            channel,
        })
    }

    handleModalBtn = _ => {
        this.toWxScan()
        // 点击图片并扫码
        this.staticSaveAndScan()
    }

    staticSaveAndScan = _ => {
        const { route: { path }, location: { query } } = this.props
        const { channel } = query
        const { detailInfo, envName } = this.platform
        const { userId }  = detailInfo || {}
        util.slog(`${path}_clicked_qrSaveAndScan`, {
            userId,
            source: envName,
            channel,
        })
    }

    toWxScan = _ => {
        const { imageUrl } = this.state
        if (typeof JSBridge !== 'undefined') {
            const appCbParams = {
                succeedCallback: this.succeedCallback,
                failedCallback: this.failedCallback,
            }
            JSBridge.doAction('downloadImgUrl', JSON.stringify(appCbParams), JSON.stringify({ url: imageUrl }))
        }
    }

    handleClose = e => {
        const { onClose } = this.props
        onClose()
    }
    render() {
        const { style = { width: '80%' } } = this.props
        const { showWxScanBtn, imageUrl = '' } = this.state
        const modalProps = {
            visible: true,
            closable: false,
            transparent: true,
            onClose: this.handleClose,
            style,
            className: modalStyle.modalWrapper,
        }
        const modalTxtStyle = showWxScanBtn ? 'modalTxtWrapper' : 'modalTxtWrapperWithOutWxScan'
        return (
            <Modal {...modalProps}>
                <div className={modalStyle.dimensionPicWrapper}>
                    <div className={modalStyle.dimensionPic}>
                        <img className={modalStyle.qrUrl} src={imageUrl} data-url={imageUrl} onTouchEnd={this.handleLongPress} />
                    </div>
                </div>
                <div className={modalStyle[modalTxtStyle]}>
                    <div className={modalStyle.modalTxt} dangerouslySetInnerHTML={{ __html: modalTxtSet[showWxScanBtn ? 1 : 0] }} />
                </div>
                {
                    showWxScanBtn ? (
                        <div className={modalStyle.modalBtnWrapper}>
                            <div className={modalStyle.modalBtn} onClick={this.handleModalBtn}>{modalBtnTxt}</div>
                        </div>
                    ) : null
                }
                <div className={modalStyle.modalCloseBtnWrapper}>
                    <img className={modalStyle.modalCloseBtn} onClick={this.handleClose} src={bindModalClose} />
                </div>
            </Modal>
        )
    }
}

export default Index
