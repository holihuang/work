import React from 'react'
import { Modal } from 'antd-mobile'
import Constants from 'Constants/examTask'

import closeIcon from 'Images/examTask/close.png'
import style from 'styles/less/examTask.less'

class ExchangeModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleConfirm = _ => {
        const { onConfirm = () => {} } = this.props
        onConfirm({ taskType: 'exchangeTiku' })
    }

    handleClose = _ => {
        const { onClose } = this.props
        onClose()
    }

    render() {
        const { showExchangeModal, onClose = () => {}, data: { answerCnt, exchangeCnt, leftCnt = 0 } } = this.props
        const modalProps = {
            visible: showExchangeModal,
            transparent: true,
            className: style.exchangeModal,
            onClose,
            closable: false,
        }
        return (
            <Modal {...modalProps}>
                <div className={style.modalWrapper}>
                    <div className={style.titleWrapper}>
                        <div className={style.title}>答题兑换</div>
                    </div>
                    <div className={style.body}>
                        <div className={style.head}>
                            每30道题兑换1次机会，每日可兑换3次。
                        </div>
                        <div className={style.content}>
                            <div className={style.itm}>今日答题数量：<span className={style.number}>{answerCnt}</span>道</div>
                            <div className={style.itm}>已经兑换次数：<span className={style.number}>{exchangeCnt}</span>次</div>
                            <div className={style.itm}>剩余兑换次数：<span className={style.number}>{leftCnt}</span>次</div>
                        </div>
                        {
                            +leftCnt ? (
                                <div className={style.bottomBtn} onClick={this.handleConfirm}>确认兑换</div>
                            ) : null
                        }
                        
                    </div>
                </div>
                <div className={style.closeBtnWrapper}>
                    <img onClick={this.handleClose} src={closeIcon} className={style.closeBtn} />
                </div>
            </Modal>
        )
    }
}

export default ExchangeModal