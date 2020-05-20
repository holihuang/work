/*
** @file: ShareClassModal
** @author: huanghaolei
** @date: 2020-03-05
*/

import React from 'react'
import { Modal } from 'antd-mobile'
import style from 'Styles/less/examTask.less'

class ShareClassModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleConfirm = key => {
        const { onConfirm = () => {} } = this.props
        onConfirm(key)
    }

    render() {
        const { showShareModal, onClose = () => {} } = this.props
        const modalProps = {
            visible: showShareModal,
            transparent: true,
            closable: false,
            onClose,
            className: style.shareClassModal,
        }
        return (
            <Modal {...modalProps}>
                <div className={style.bottom}>
                    <div className={style.wx} onClick={this.handleConfirm.bind(this, 'wx')}>
                        <div className={style.txt}>微信</div>
                    </div>
                    <div className={style.pyq} onClick={this.handleConfirm.bind(this, 'pyq')}>
                        <div className={style.txt}>朋友圈</div>
                    </div>
                </div>
            </Modal>
        )
    }
}

export default ShareClassModal
