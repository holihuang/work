import React, { Component, PropTypes } from 'react';
import { hashHistory } from 'react-router'
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import styles from '../../styles/less/subject.less';
import weixinShare from '@sunl-fe/wechat-tools';

import { Button, Toast, Card, Modal } from 'antd-mobile';
import SubjectTop from '../../components/subjectTop/Index';
import FixedTop from '../../components/fixedTop/Index';
import GetMore from '../../components/getMore/Index';
import Topic from '../../components/topic/Index';
import { GET_POST_BY_SUBJECT_REQUESTED } from '../../constants/subject';

let pageNo = 1;

class Subject extends React.Component {
	static defaultProps = {
		topicId	  : '',
		subjectName: '',
		subjectAbstract: '',
		subjectImageUrl: '',
		topicList : []
	}

	constructor(props) {
		super(props);
		this.state = {
			isNavbarFixed: false,  //是否吸顶,默认为不吸顶
		}

		this.getTopicList = this.getTopicList.bind(this);
	}

	componentDidMount(){
		this.getTopicList();
		// window.addEventListener('scroll', this.handleScroll);
	}

	componentDidUpdate() {
		// !this.state.headerHeight && 
		// 	this.setState({
		// 		headerHeight:this.refs.header.refs.abc.clientHeight
		// 	});
		let {subjectName, subjectAbstract, subjectImageUrl} = this.props;
    
        weixinShare({
            title: subjectName,
            desc: subjectAbstract,
            py: {
            	imgUrl: subjectImageUrl
            }
        })
	}

	componentWillUnmount() {
		// window.removeEventListener('scroll', this.handleScroll);
	}

	componentWillReceiveProps(nextProps) {
		// if (nextProps.params.subjectName != this.props.params.subjectName) {
		// 	this.getTopicList();
		// }

		// 话题isShow字段为false时跳转到不可用页面
		if(!nextProps.isShow){
			hashHistory.push('unablePage');
		}

	}

	/**
	 * 获取话题列表
	 * @params {number} type
	 * type = 1 //最热
	 * type = 2 //最新 
	 */
	getTopicList() {
		let {subjectId} = this.props.params;
		let {dispatch} = this.props;
		dispatch({type: GET_POST_BY_SUBJECT_REQUESTED, params: {subjectId, pageNo: 1, pageSize: 10, userId: -1,channelCode: 'CS_BACKGROUND'}});
	}

	createTopicList() {

		const {resultList = []} = this.props.topicResult;
		if (resultList.length) {
			let topicList = [];
			topicList = resultList.map((item) => {
                if(!item) return
				return <div className={styles['topic-wrap']}><Topic {...item} /></div>
			});

			return topicList;
		} else {
			return (<div></div>)
		}
	}

	createGetMore() {
		const {resultList = []} = this.props.topicResult;

		if (resultList.length >= 10) {
			return (
                <div className={styles['show-more']}>
                    <GetMore pagedetail='subject' param={this.props.params.subjectId} />
                </div>
			)
		} else {
			return null;
		}
	}

	render() {

		return (
			<div>
				<FixedTop pagedetail='subject' param={this.props.params.subjectId}/>
				<div className={styles['subject-wrap']}>
					<SubjectTop ref="header" {...this.props}/>
                    {this.createTopicList()}
					{this.createGetMore()}
				</div>
			</div>
		);
	}
}

const getSubject = (state) => {
	return state.subject;
}
const selectors = createSelector(
	[getSubject],
	(subject) => {
		return {...subject};
	}
)

export default connect(selectors)(Subject);
