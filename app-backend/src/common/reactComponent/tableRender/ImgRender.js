/**
 * @file app后台 Abstract Table Render Img
 *
 * @author gushouchuang
 * @date 2018-1-3
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Modal } from 'antd'

class ImgRender extends Component {
    constructor(...args) {
        super(...args)

        this.state = {
            visible: false,
        }

	    this.showModal = this.showModal.bind(this)
	}
	
	// componentWillReceiveProps(nextProps) {
	// 	console.log('componentWillReceiveProps', nextProps.isShowImg)
	// 	this.setState({
	// 		visible: nextProps.isShowImg
	// 	})
	// }

    showModal() {
    	this.setState({
    		visible: true,
    	})
	}

    render() {
        const modalProps = {
            title: this.props.title || '窗口',
            visible: this.state.visible,
            onOk: () => {
				// 发送图片
				this.props.onOk && this.props.onOk()
				this.setState({
	            	visible: false,
	            })
            },
	        onCancel: () => {
	            this.setState({
	            	visible: false,
	            })
	        },
		}
		
		const { remark } = this.props

        return (
            <div className="app-back-img-cell">
            	<div onClick={this.showModal} style={{
            		cursor: 'pointer',
            	}}>
		            <img src={this.props.src} width='auto' height='60' />
					{remark ? <div>{remark}</div> : ''}
		        </div>
	        {
            	this.state.visible
				? <Modal
					{...modalProps}
					okText="发送"
					cancelText='取消'
				>
                    <img src={this.props.src} width={this.props.width} height={this.props.height} />
					{remark ? <div>{remark}</div> : ''}
                </Modal>
            	: null
            }
            </div>
        )
    }
}

ImgRender.propTypes = {
    url: PropTypes.string,
}

ImgRender.defaultProps = {
    url: '',
}

export default ImgRender

