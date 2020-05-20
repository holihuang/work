import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'

import questionMark from '../../../images/question-mark.png'

class SamplePic extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
        }
    }

    handleClick = e => {

        this.setState({
            visible: true
        })
    }

    handleCancel = e => {
        this.setState({ visible: false })
    }

    render() {
        const { imgUrl } = this.props
        const wrapperStyle = {
            display: 'inline-block',
            position: 'relative',
            width: '20px',
            height: '18px',
            marginLeft: '-20px',
        }
        const sampleIconStyle = {
            width: '15px',
            height: '15px',
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
        }
        const samplePicStyle = {
            display: 'block',
            width: '750px',
            margin: '20px auto',
        }
        const modalProps = {
            width: '800px',
            visible: this.state.visible,
            footer: null,
            onCancel: this.handleCancel,
        }
        return (
            <div style={wrapperStyle}>
                <img style={sampleIconStyle} src={questionMark} alt="样例图标" onClick={this.handleClick}/>
                <Modal {...modalProps}>
                    <img src={imgUrl} alt="样例图" style={samplePicStyle} />
                </Modal>
            </div>
        )
    }
}

SamplePic.propTypes = {
    imgUrl: PropTypes.string.isRequired,
}

export default SamplePic
