//*******:@params: imagesArray{Array}, 必填项;
//*******: 格式:[url1,url2,url3,...urln]
import React from 'react'
import styles from '../../styles/less/slideImage.less'

class SlideImage extends React.Component{

	constructor(...props) {
		super(...props)
		this.touchRange = 0 // 触控距离
		this.count = 0 // 控制弹层总显示的数字以及当前显示的图片
		this.screenWidth = document.body.clientWidth //屏幕宽度
		this.state = {
			imgIndex: this.props.imgIndex,
			hasMoveStyle: true
		}
	}

	componentDidMount() {
		let carouselImg = this.refs.carouselImg
		if (carouselImg) {
			let imgChildren = Array.from(carouselImg.children, item => item.style.width = this.screenWidth + "px")
			let index = this.props.imgIndex - 1
			carouselImg.style.webkitTransform = 'translate3d(' + index * (-this.screenWidth) + 'px, 0, 0)'
			this.count = index
		}
	}

	startMoveImg(e) {
		this.setState({
			hasMoveStyle: false
		})
		this.touchRange = e.touches[0].pageX
		e.preventDefault()
		e.stopPropagation()
	}

	movingImg(length, e) {
		e.stopPropagation()
		let moveDirection = this.touchRange - e.touches[0].pageX // 当滑动到边界时，再滑动会没有效果
		if ((this.count === 0 && moveDirection < 0) || (this.count === length - 1 && moveDirection > 0)) {
			return
		}

		let conunts = this.count * -this.screenWidth

		this.refs.carouselImg.style.webkitTransform = 'translate3d(' + (conunts - (this.touchRange - e.changedTouches[0].pageX)) + 'px, 0, 0)'
	}

	endMoveImg(length, itemImages, e) {
		e.stopPropagation()
		this.setState({
			hasMoveStyle: true
		})

		if (this.touchRange - e.changedTouches[0].pageX > 100) {
			this.count++
			if (this.count === length) {
				this.count = length - 1
				return
			}
			this.setState({
				imgIndex: this.state.imgIndex + 1
			})
		} else if (this.touchRange - e.changedTouches[0].pageX < -100) {
			this.count--
			if (this.count < 0) {
				this.count = 0
				return
			}
			this.setState({
				imgIndex: this.state.imgIndex - 1
			})
		}

		this.refs.carouselImg.style.webkitTransform = 'translate3d(' + this.count * (-this.screenWidth) + 'px, 0, 0)'
	}

	render() {
		const { imagesArray=[], showImg, index, isQuestion, onClose, useNewApi = false } = this.props
		return (
			<div className={styles['slide-images--moved']}>
				<p className={styles['slide-images-title']}>{this.state.imgIndex}/{imagesArray.length}</p>
				{
					useNewApi ? (
						<span className={styles['slide-images-close']} onClick={onClose}>×</span>
					) : (
						<span className={styles['slide-images-close']} onClick={showImg.bind(null, {index, isQuestion})}>×</span>
					)
				}
				<ul className={this.state.hasMoveStyle ? (`${styles['flex']} ${styles['full-height']} ${styles['slide-images-ul']}`) : (`${styles['flex']} ${styles['full-height']} ${styles['slide-images-ul']}`)} ref="carouselImg">
					{
						imagesArray.map((item, index) => (
							<li className={`${styles['flex']} ${styles['flex-center']} ${styles['flex-columns']} ${styles['slide-images-li']}`}
							    onTouchStart={this.startMoveImg.bind(this)}
							    onTouchMove={this.movingImg.bind(this, imagesArray.length)}
							    onTouchEnd={this.endMoveImg.bind(this, imagesArray.length, imagesArray)}
							    key={index}>
								<img className={styles['slide-images__img']} src={item} />
							</li>
						))
					}
				</ul>
			</div>
		)
	}
}

export default SlideImage

SlideImage.defaultProps = {
	imagesArray: [],
	imgIndex: 1,
	useNewApi: false,
	onClose: () => {},
}












