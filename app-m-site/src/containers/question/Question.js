import React, { Component, PropTypes } from 'react';
import { ReactDom, unmountComponentAtNode } from 'react-dom';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { url } from '@sunl-fe/util';
import { gotoApp } from '@sunl-fe/app-link';
import moment from 'moment';
import $ from 'jquery';
import weixinShare from '@sunl-fe/wechat-tools';
import classNames from 'classnames';
import styles from '../../styles/less/question.less';
import { mr20, dn, link_blue } from '../../styles/less/common.less';
import util from '../../common/util';
import { EMOTION_CN_TO_EN, EMOTION_EN_TO_CN } from '../../common/emotion';
import FixedTop from '../../components/fixedTop/Index';
import { envCfg } from '../../common/envCfg';
import GetMore from '../../components/getMore/Index';
import SlideImage  from '../../components/slideImage/slideImage';

import { GET_QUESTION_DETAIL_REQUESTED, GET_ANSWER_DETAIL_REQUESTED } from '../../constants/question';

const questLogo = require( '../../images/quest.png');
const answerLogo = require('../../images/answer.png');
const writeIcon = require('../../images/writeIcon.png');
const noListLogo = require('../../images/noAnswer.png');

const SIGLE_LINE_HEIGHT = 46;
let execTimes = 1;
const BASE_IMAGE_URL = 'http://static.sunlands.com/user_center/newUserImagePath/';
class Question extends React.Component {
	static defaultProps = {
		postMaster: {},
		resultList: []
	}

	constructor(props) {
		super(props);
		this.state = {
			isShowReplyBtn: false,
			isContentTextStylePart: false,
			isImgShow: false,                    //蒙层大图显示与否标志位
			imgIndex: 1,                         //蒙层大图序号
			imageScrollTop: 0,                    //图片距离顶部偏移量
		};
	}

	openApp = _ => {
		//inUrlId:包括answerId或questionId
		const { route, params } = this.props;
		const { path } = route;

		gotoApp({
			pagedetail: path == 'answer/:answerId' ? 'answerdetail' : 'questiondetail',
			param: path == 'answer/:answerId' ? params.answerId : params.questionId
		}, {
			clickCallback: () => {
                const opt = location.hash.split('/');

                _hmt && _hmt.push(['_trackEvent', 'getMore', 'click', opt[0], opt[1]]);
            },
            test: envCfg.mlinkTest
		});
	}

	componentWillReceiveProps(nextProps) {
		let { metadata, route } = nextProps;
		let {postSubject, question, content, externalLinks, answerContent, questionContent} = metadata;
		const { path } = route;
		const titleText = path == 'answer/:answerId' ? answerContent : questionContent;
		const descText = path == 'answer/:answerId' ? question : '回答问题，一起进步，还得悬赏';

		weixinShare({
			title: titleText,
			desc: descText
		})
	}

	componentDidUpdate() {
		if (execTimes++ === 1) {
			this.showDetailedText()
		}
	}

	_handleTouchStart = (e) => {
		//e.preventDefault();
		const startX = e.touches[0].pageX;
		const startY = e.touches[0].pageY;
		this.setState({
			startX,
			startY
		});
	}

	_handleTouchMove = (e) => {
		//e.preventDefault();
		const { startX, startY } = this.state;
		const moveEndX = e.changedTouches[0].pageX;
		const moveEndY = e.changedTouches[0].pageY;
		this._moveDirection(startX, startY, moveEndX, moveEndY);
	}

	_moveDirection = (startX, startY, moveEndX, moveEndY) => {
		const X = moveEndX - startX;
		const Y = moveEndY - startY;

		if(Math.abs(X) > Math.abs(Y) && X > 0) {
			//向右滑动
		} else if(Math.abs(X) > Math.abs(Y) && X < 0) {
			//向左滑动
		} else if(Math.abs(Y) > Math.abs(X) && Y > 0) {
			//向上滑动
			this.setState({
				isShowReplyBtn: true
			});
		} else if(Math.abs(Y) > Math.abs(X) && Y < 0) {
			//向下滑动
			this.setState({
				isShowReplyBtn: false
			});
		}
	}

	componentDidMount() {
		document.body.addEventListener('touchstart', this._handleTouchStart, false);
		document.body.addEventListener('touchmove', this._handleTouchMove, false);
		this.getPostDetail();
	}

	componentWillUnmount() {
		document.body.removeEventListener('touchstart', this._handleTouchStart, false);
		document.body.removeEventListener('touchmove', this._handleTouchMove, false);
	}

	showDetailedText() {
		const { metadata, resultList=[] } = this.props;
		const questionTextOffSetHeight = this.refs.questionText && (this.refs.questionText.offsetHeight || 0);
		const rows = questionTextOffSetHeight / SIGLE_LINE_HEIGHT;
		const questionTextRowsUnderSix = rows < 6 ? true : false;
		Object.assign(metadata, {questionTextRowsUnderSix});
		let rowsArr = [];
		resultList.forEach((item, index) => {
			const answerTextOffSetHeight = this.refs[`answerText${index}`] && (this.refs[`answerText${index}`].offsetHeight || 0);
			item.questionTextRowsUnderSix = (answerTextOffSetHeight / SIGLE_LINE_HEIGHT) < 6 ? true : false;
		})
		this.setState({
			metadata,
			resultList,
		});
	}

	getPostDetail() {
		let { userId } = this.props.params;
		//if (postMasterId.indexOf('&') != -1) {
		//	postMasterId = postMasterId.split('&')[0];
		//}
		let { dispatch, route } = this.props;
		const { path } = route;
		let answerId, questionId;
		if(path == 'answer/:answerId') {
			answerId = +this.props.params.answerId;
		} else if(path == 'question/:questionId') {
			questionId = +this.props.params.questionId;
		}
		const typeText = path == 'answer/:answerId' ? 'GET_ANSWER_DETAIL_REQUESTED' : 'GET_QUESTION_DETAIL_REQUESTED';
		const reqTime = moment().format('YYYY-MM-DD HH:mm:ss');
		dispatch({
			type: typeText,
			params: {
				answerId,
				questionId,
				channelCode: 'CS_BACKGROUND',
				osVersion: 'PC',
				appVersion: '',
				pageNo: 1,
				pageSize: 10,
				userId: -1,
				reqTime,
			}
		});
	}

	createAvatar(userId, isVip, imageUrl) {
		const vipClassName = (isVip === 1) ? classNames(styles.icon, styles['icon--vip']) : (
			isVip === 2 ? classNames(styles.icon, styles['icon--teacher']) : ''
		);

		return (
			<div>
				<img src={imageUrl} className={styles.avatar} onError={this.handleAvatarError} />
				{
					isVip ? (<i className={vipClassName}></i>): ''
				}
			</div>
		)
	}

	handleAvatarError(e) {
		e.target.src="./images/default.png";
	}

	//createReplyList(replyDTOList) {
	//	const {postMaster} = this.props;
	//	const masterUserId = postMaster.userId;
	//
	//	replyDTOList.splice(3);
	//
	//	let rs = replyDTOList.map(item => {
	//		const {userId, userNickname, replyToUserNickname, replyToReplyid, content} = item;
	//		return (
	//			<li className={styles['reply-item']}>
	//				<span className={styles['user-name']}>{userNickname}</span>
	//				{
	//					userId === masterUserId ?
	//						<span className={styles['text--pinkbg']}>楼主</span> : ''
	//				}
	//				{
	//					replyToUserNickname &&
	//					<span className={styles['user-name']}>
     //                           &nbsp;回复&nbsp;{replyToUserNickname}
     //                       </span>
	//				}
	//				{
	//					replyToReplyid === masterUserId &&
	//					<span className={styles['text--pinkbg']}>楼主</span>
	//				}：
	//				<span className={styles['text--gray']}></span>
	//			</li>
	//		)
	//	})
	//
	//	return rs;
	//}

	formatContent(content = '', mobileText, postLinkList = []) {
		const isMixed = mobileText ? true : false;

		const contentToBeFormatted = isMixed ? mobileText : content;

		let emotionPlaceholderArr = [];
		let contentFormatted = contentToBeFormatted.replace(/\r\n/ig, '<br/>');

		//将[XX]转化为img
		for (let k in EMOTION_EN_TO_CN) {
			emotionPlaceholderArr.push('\\\[' + EMOTION_EN_TO_CN[k] + '\\\]');  //[爱慕]
		}

		let regExpStr = emotionPlaceholderArr.join('|');
		let regExp = new RegExp('(' + regExpStr + ')', 'g');  //全局匹配

		//将链接转换为a标签
		contentFormatted = util.replaceLinkText(contentFormatted, link_blue);

		//将匹配到的表情占位符替换为img标签
		let rs;
		while(rs = regExp.exec(contentToBeFormatted)) {
			let imgName = rs[0].replace(/[\[\]]/g, '');
			contentFormatted = contentFormatted.replace(rs[0], `<img src="./images/emotion/${EMOTION_CN_TO_EN[imgName]}.png" class=${styles['emotion']}>`);
		}

		if (!isMixed) {
			//图片
			for (let len = postLinkList.length, i = 0; i < len; i++) {
				contentFormatted += `<img src="${postLinkList[i].linkUrl}" class=${styles.img}>`;
			}
		} else {
			//图文混排
			let imgIndex = 0;
			let imgRegExp = new RegExp('\\[L图片Y\\]', 'g');
			while(rs = imgRegExp.exec(contentToBeFormatted)) {
				contentFormatted = contentFormatted.replace(rs[0], `<img src="${postLinkList[imgIndex].linkUrl}" class=${styles.img}>`);
				imgIndex++;
			}
		}

		return {
			__html: contentFormatted
		}
	}

	createGetMore() {
		const {resultList = []} = this.props;
		const { route, params } = this.props;
		const { path } = route;
		if (resultList.length >= 10) {
			if(path == 'answer/:answerId') {
				return (
						<GetMore pagedetail='answerdetail' param={params.answerId} />
					   )
			} else {
				return (
						<GetMore pagedetail='questiondetail' param={params.questionId} />
					   )
			}
			
		} else {
			return null;
		}
	}

	formatTime = (time) => {
		var rs = '';
		if (!/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(time)) {
			return time;
		}
		var now = new Date();
		var nYear = now.getFullYear();
		var nMonth = now.getMonth() + 1;
		var nDay = now.getDate();

		var dayInfo = time.split(' ')[0];
		var timeInfo = time.split(' ')[1];
		var year = dayInfo.split('-')[0],
			month = dayInfo.split('-')[1],
			day = dayInfo.split('-')[2];
		if (year == nYear && month == nMonth) {
			//说明同年同月
			if (day == nDay) {
				//今天发的帖子
				rs = '今天' + moment(time).format('HH:mm');
				return rs;
			}
			if (day == nDay - 1) {
				//昨天发的帖子
				rs = '昨天' + moment(time).format('HH:mm');
				return rs;
			}
			return moment(time).format('MM-DD');
		}
		if (year == nYear) {
			//今年发的帖子
			return  moment(time).format('MM-DD');
		}

		return moment(time).format('YYYY-MM-DD');
	}

	showContentText = (e) => {
		const {isquestion, idx} = e.currentTarget.dataset;
		const { metadata, resultList=[] } = this.props;
		if(isquestion == 'true') {
			metadata.questionTextRowsUnderSix = true;
			this.setState({
				metadata
			})
		} else {
			resultList.forEach((item, index) => {
				if(index === +idx) {
					item.questionTextRowsUnderSix = true;
				}
			})
			this.setState({
				resultList
			});
		}
	}

	imagesNumberTip = (mediaLinks=[]) => {
		let imageTip = mediaLinks.length > 2 ? (
			<div className={styles['content-image-number--tip']}>
				{ '共'+ mediaLinks.length + '张图' }
			</div>
		) : null;
		return imageTip;
	}

	formatUrlLink = (mediaLinks=[]) => {
		let arr = [];
		mediaLinks.forEach((item, index) => {
			arr.push(item.linkUrl);
		})
		return arr;
	}
	//@params: questionAreaIndex
	//回答详情页问题区域：问题图片，回答图片区分标志位
	//questionAreaIndex = 0 **** 回答（回答详情页的回答，问题详情页的问题）
	//questionAreaIndex = 1 **** 问题（回答详情页）
	showImg = (options) => {
		let { imgIndex = 0, isQuestion, index, questionAreaIndex } = options;
		const clickPicArea = isQuestion ? {isQuestion: true} : {isQuestion:false, index};
		Object.assign(clickPicArea, {questionAreaIndex});
		let { isImgShow, imageScrollTop } = this.state;
		const rootDivOverFlow = isImgShow ? false : true;
		isImgShow = !isImgShow
		this.setState({
			isImgShow,
			imgIndex: imgIndex + 1,
			clickPicArea,
		})
		if(isImgShow) {
			if(execTimes > 1) {
				imageScrollTop = document.body.scrollTop
				this.setState({
					imageScrollTop
				});
			}
			$("#app").css("overflow", 'hidden');
		} else {
			$("#app").css("overflow", '');
			document.body.scrollTop = imageScrollTop;
		}
	}

	answerList() {
		const {metadata, resultList=[]} = execTimes === 1 ? this.props : this.state;
		const { route, params } = this.props;
		const { path } = route;
		const praiseClassName = classNames(styles.icon, styles['icon--praise']);
		const replyClassName = classNames(styles.icon, styles['icon--reply']);
		const hideLevel = path == 'answer/:answerId' ? true : false;
		
		let answerList = resultList.slice(0,9).map((item, index) => {
			let { answerId, isVip, gradeCode, userNickname, createTime, userId, answerContent, mobileText, postLinkList=[], replyDTOList=[],
				praiseCount,replyCount, commentContent, commentCount,questionTextRowsUnderSix=true, mediaLinks } = item;
			let isShowContentTextIconStyle = questionTextRowsUnderSix ? classNames([dn]: true) : styles['content-text-btn'];
			const contentTextStyle = questionTextRowsUnderSix ? styles['more-content-text--normal'] : styles['more-content-text--part'];
			const levelClassName = gradeCode < 6 ? styles['text--bluebg'] : (
				gradeCode < 11 ? styles['text--yellowbg'] : styles['text--redbg']
			);
			const d = new Date();
			const imageUrl = `${BASE_IMAGE_URL}${userId}/${userId}.jpg?${d.getTime()}`;
			answerContent = path == 'answer/:answerId' ? commentContent : answerContent;
			commentCount = path == 'answer/:answerId' ? replyCount : commentCount;
			if(!praiseCount) {
				praiseCount = "赞";
			}
			if(!commentCount) {
				commentCount = '评论';
			}
			return (
				<div>
					<div className={styles['post-slave']}>
						<div className={styles['user-info-panel']}>
							{this.createAvatar(answerId, isVip, imageUrl)}
							<div className={styles['info-panel--top']}>
								{userNickname}
								{
									!hideLevel ? <span className={classNames(styles['text--lv'], levelClassName)}>Lv.{gradeCode}</span> : null
								}
							</div>
							<div className={styles['info-panel--bottom']}>
								{this.formatTime(createTime)}
							</div>
						</div>
						<div className={styles['answer-content']}>
							<div className={contentTextStyle} ref={`answerText${index}`} dangerouslySetInnerHTML={this.formatContent(answerContent, mobileText, postLinkList)}></div>
							{
								//replyDTOList.length ?
								//	<ul className={styles['reply-container']}>
								//		{this.createReplyList(replyDTOList)}
								//	</ul> : ''
							}
							<span className={isShowContentTextIconStyle} data-isquestion={false} data-idx={index} onClick={this.showContentText}>显示全文</span>
							<div className={styles['slide-images-wrap']}>
								<ul className={styles['slide-images--fixed']}>
									{
										this.formatUrlLink(mediaLinks).slice(0,3).map((item, imgIndex) => {
											return (
												<li className={styles['slide-images-li--fixed']} key={imgIndex} onClick={this.showImg.bind(this, {imgIndex, isQuestion: false, index})}>
													<img className={styles['slide-images-li__image']} src={item} />
												</li>
											)
										})
									}
								</ul>
								{ this.imagesNumberTip(mediaLinks) }
							</div>

						</div>

						<div className={styles['master-footer']}>
							<div className={styles['footer--right']}>
								<i className={praiseClassName} onClick={this.openApp}></i>
								<span className={styles['num--mr20']} onClick={this.openApp}>{praiseCount}</span>
								<i className={replyClassName} onClick={this.openApp}></i>
								<span className={styles.num} onClick={this.openApp}>{commentCount}</span>
							</div>
						</div>
					</div>
				</div>
			)
		})
		return answerList;
	}

	slideImage(clickPicArea) {
		const { isQuestion=true, index, questionAreaIndex } = clickPicArea;
		const { metadata={}, resultList=[] } = this.props;
		let { mediaLinks = [], questionLinks = [] } = isQuestion ? metadata : resultList[index];
		if(questionLinks.length) {
			mediaLinks = questionAreaIndex ? questionLinks : mediaLinks;
		}
		const { imgIndex, isImgShow } = this.state;
		return (
				<div className={styles['content-image-container']}>
					{
						mediaLinks && isImgShow && <SlideImage imagesArray={this.formatUrlLink(mediaLinks)} isQuestion={isQuestion} index={index} showImg={this.showImg.bind(this)} imgIndex={imgIndex} />
					}
				</div>
			)

	}

	shareAnswerPage(levelClassName, contentTextStyle, isShowContentTextIconStyle) {
		const { metadata } = this.props;
		let { userId, isVip, userNickname, gradeCode, createTime, answerContent, mediaLinks, mobileText, postLinkList, praiseCount, commentCount } = metadata;
		const praiseClassName = classNames(styles.icon, styles['icon--praise']);
		const replyClassName = classNames(styles.icon, styles['icon--reply']);
		if(!praiseCount) {
			praiseCount = "赞";
		}
		if(!commentCount) {
			commentCount = '评论';
		}
		const d = new Date();
		const imageUrl = `${BASE_IMAGE_URL}${userId}/${userId}.jpg?${d.getTime()}`;
		return (
			<div>
				<div className={styles['user-info-panel']}>
					{this.createAvatar(userId, isVip, imageUrl)}
					<div className={styles['info-panel--top']}>
						{userNickname}
						<span className={classNames(styles['text--lv'], levelClassName)}>Lv.{gradeCode}</span>
					</div>
					<div className={styles['info-panel--bottom']}>
						{this.formatTime(createTime)}
					</div>
				</div>
				<div className={styles.content}>
					<img src={answerLogo} className={styles['content-quest-logo']} onError={this.handleAvatarError} />
					<div className={contentTextStyle} ref="questionText" dangerouslySetInnerHTML={this.formatContent(answerContent, mobileText, postLinkList)}></div>
					<span className={isShowContentTextIconStyle} data-isquestion={true} onClick={this.showContentText}>显示全文</span>
					<div className={styles['slide-images-wrap']}>
						<ul className={styles['slide-images--fixed']}>
							{
								this.formatUrlLink(mediaLinks).slice(0,3).map((item, imgIndex) => {
									return (
										<li className={styles['slide-images-li--fixed']} key={imgIndex} onClick={this.showImg.bind(this, {imgIndex, questionAreaIndex: 0, isQuestion: true})}>
											<img className={styles['slide-images-li__image']} src={item} />
										</li>
									)
								})
							}
						</ul>
						{ this.imagesNumberTip(mediaLinks) }
					</div>
				</div>
				<div className={styles['master-footer']}>
					<div className={styles['footer--right']}>
						<i className={praiseClassName} onClick={this.openApp}></i>
						<span className={styles['num--mr20']} onClick={this.openApp}>{praiseCount}</span>
						<i className={replyClassName} onClick={this.openApp}></i>
						<span className={styles.num} onClick={this.openApp}>{commentCount}</span>
					</div>
				</div>
			</div>


		)
	}

	render() {
		const {metadata, resultList=[]} = execTimes === 1 ? this.props : this.state;
		const { route, params } = this.props;
		const { path } = route;
		let { isShowReplyBtn, isContentTextStylePart, isImgShow, imgIndex, clickPicArea={} } = this.state;
		const isAnswerPage = path == 'answer/:answerId' ? true : false;
		let {
			gradeCode=0,
			askerGradeCode,
			isVip,
			askerVip,
			questionTextRowsUnderSix=true,
			userNickname,
			questionUserNickname,
			createTime,
			postSubject,
			questionContent,
			content,
			mobileText,
			modifyTime,
			praiseCount,
			replyCount,
			postLinkList,
			userId,
			questionTime,
			questionUserId,
			mediaLinks =[],
			questionLinks = [],
		} = metadata;

		const isShowContentText = isContentTextStylePart ? false: true;
		const isShowContentTextIconStyle = questionTextRowsUnderSix ? classNames([dn]: true) : styles['content-text-btn'];
		const contentTextStyle = questionTextRowsUnderSix ? styles['content-text--normal'] : styles['content-text--part'];
		const d = new Date();
		let imageUrl = './images/default.png';
		if(path == 'answer/:answerId') {
			userNickname = questionUserNickname;
			isVip = askerVip;
			imageUrl = `${BASE_IMAGE_URL}${questionUserId}/${questionUserId}.jpg?${d.getTime()}`;
			userId = questionUserId;
			gradeCode = askerGradeCode;
			content = questionContent;
			userId = questionUserId;
		} else {
			imageUrl = `${BASE_IMAGE_URL}${userId}/${userId}.jpg?${d.getTime()}`;
		}
		const inUrlId = path == 'answer/:answerId' ? params.answerId : params.questionId;
		//@params: createTime(回答取questionTime，问题取createTime)
		createTime = path == 'answer/:answerId' ? questionTime : createTime;
		const levelClassName = gradeCode < 6 ? styles['text--bluebg'] : (
			gradeCode < 11 ? styles['text--yellowbg'] : styles['text--redbg']
		);
		const questionOrAnswerId = path == 'answer/:answerId' ? 'answerId' : 'questionId';
		const questionLinkPics = path == 'answer/:answerId' ? questionLinks : mediaLinks;
		return (
			<div>
				<div>
					{
						path == 'answer/:answerId' ? (
							<FixedTop pagedetail ='answerdetail' param={params.answerId} />
						) : (
							<FixedTop pagedetail = 'questiondetail'  param={params.questionId} />
						)
					}
					<div className={styles.container}>
						<div className={styles['post-master']}>
							<div className={styles['user-info-panel']}>
								{this.createAvatar(userId, isVip, imageUrl)}
								<div className={styles['info-panel--top']}>
									{userNickname}
									<span className={classNames(styles['text--lv'], levelClassName)}>Lv.{gradeCode}</span>
								</div>
								<div className={styles['info-panel--bottom']}>
									{this.formatTime(createTime)}
								</div>
							</div>
							<div className={styles.content}>
								<img src={questLogo} className={styles['content-quest-logo']} onError={this.handleAvatarError} />
								<div className={contentTextStyle} ref="questionText" dangerouslySetInnerHTML={this.formatContent(content, mobileText, postLinkList)}></div>
								<span className={isShowContentTextIconStyle} data-isquestion={true} onClick={this.showContentText}>显示全文</span>
								{
									<div className={styles['slide-images-wrap']}>
										<ul className={styles['slide-images--fixed']}>
											{
												this.formatUrlLink(questionLinkPics).slice(0,3).map((item, imgIndex) => {
													return (
														<li className={styles['slide-images-li--fixed']} key={imgIndex} onClick={this.showImg.bind(this, {imgIndex, questionAreaIndex: 1, isQuestion: true})}>
															<img className={styles['slide-images-li__image']} src={item} />
														</li>
													)
												})
											}
										</ul>
										{ this.imagesNumberTip(questionLinkPics) }
									</div>
								}
							</div>
						</div>
						{
							isAnswerPage ? (
								<div className={styles['post-master']}>
									{
										this.shareAnswerPage(levelClassName, contentTextStyle, isShowContentTextIconStyle)
									}
								</div>
							) : null
						}

						{
							resultList.length ? (
								<div className={styles['post-slave--title']}>
									<div className={styles['post-slave__title-content']}>{ isAnswerPage ? '更多回答' : '全部回答' } ({resultList.length})</div>
								</div>
							) : null
						}
						{ resultList.length ? this.answerList() : null }
						{ !resultList.length ? (
							path == 'answer/:answerId' ? (
								null
							) : (
								<div className={styles['post-slave--nolist']}>
									<div>
										<img src={noListLogo} className={styles['nolist-logo']} />
									</div>
									<div className={styles['error-content']}>
										{"暂无用户回答"}
									</div>
								</div>
							)
							) : null
						}
						<div>
							{this.createGetMore()}
						</div>
					</div>
					<div className={classNames(styles['container__reply-btn'],{[dn]: isShowReplyBtn})} onClick={this.openApp}>
						<img src={writeIcon} className={classNames(styles['container__write-icon'])} />
						我来回答
					</div>
				</div>
				{ this.slideImage(clickPicArea) }
			</div>
		)
	}
}

const getQuestion = (state) => {
	return state.question;
}
const selectors = createSelector(
	[getQuestion],
	(question) => {
		return {...question};
	}
)

export default connect(selectors)(Question);
