import React, { Component, PropTypes } from 'react';
import { hashHistory } from 'react-router'
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import styles from '../../styles/less/index.less';
import topicStyles from '../../styles/less/topics.less';
import weixinShare from '@sunl-fe/wechat-tools';

import { Button, Toast, Card, Modal } from 'antd-mobile';
import Header from '../../components/header/Index';
import Navbar from '../../components/navbar/Index';
import FixedTop from '../../components/fixedTop/Index';
import GetMore from '../../components/getMore/Index';
import Topic from '../../components/topic/Index';
import { GET_POST_BY_TOPIC_REQUESTED } from '../../constants/home';

let pageNo = 1;

class Home extends React.Component {
	static defaultProps = {
		topicId	  : '',
		topicTitle: '',
		topicBrief: '',
		mediaLinks: '',
		topicList : []
	}

	constructor(props) {
		super(props);
		this.state = {
			isNavbarFixed: false,  //是否吸顶,默认为不吸顶
			sortType: 1 //默认是按照热度排序
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
		let {topicTitle, topicBrief, mediaLinks} = this.props;
    
        weixinShare({
            title: topicTitle,
            desc: topicBrief,
            py: {
            	imgUrl: mediaLinks
            }
        })
	}

	componentWillUnmount() {
		// window.removeEventListener('scroll', this.handleScroll);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.params.topicName != this.props.params.topicName) {
			this.getTopicList();
		}

		// 话题isShow字段为false时跳转到不可用页面
		if(!nextProps.isShow){
			hashHistory.push('unablePage');
		}

	}

	// handleScroll(e) {
	// 	let scrollTop = e.srcElement.body.scrollTop;
		
	// 	// if (scrollTop > this.state.headerHeight - 70) {

	// 	// 	this.refs.nav.refs.nav.setAttribute('class', topicStyles['nav'] + ' ' + topicStyles['nav--fixed']+ ' ' +topicStyles['fadeIn']);
	// 	// } else {
	// 	// 	this.refs.nav.refs.nav.setAttribute('class', topicStyles['nav']);

	// 	// }
	// 	this.setState({
	// 		isNavbarFixed: scrollTop > this.state.headerHeight - 70
	// 	})
	// }

	/**
	 * 获取话题列表
	 * @params {number} type
	 * type = 1 //最热
	 * type = 2 //最新 
	 */
	getTopicList(sortType = 1) {
		let {topicName} = this.props.params;
		let {dispatch} = this.props;
		dispatch({type: GET_POST_BY_TOPIC_REQUESTED, params: {topicName, sortType, pageNo: 1, pageSize: 10, userId: -1}});
		this.setState({sortType});
	}

	createTopicList() {
		const {resultList = []} = this.props.resultMessage;
		if (resultList.length) {
			let topicList = [];
			topicList = resultList.map((item) => {
				return <Topic {...item} />
			});

			return topicList;
		} else {
			return (<div className={styles.message}>没帖子？我来当第一</div>)
		}
		
	}

	createGetMore() {
		const {resultList = []} = this.props.resultMessage;

		if (resultList.length == 10) {
			return (
				<GetMore pagedetail='topicdetail' param={this.props.params.topicId} />
			)
		} else {
			return null;
		}
	}

	render() {
		let {sortType, isNavbarFixed} = this.state;
		const navs = [
			{
				name: '最热',
				type: 1,
				active: sortType === 1 ? true : false
			}, {
				name: '最新',
				type: 2,
				active: sortType === 2 ? true : false
			}
		];

		return (
			<div>
				<FixedTop pagedetail='topicdetail' param={this.props.params.topicId}/>
				<div className={styles['app-wrap']}>
					<Header ref="header" {...this.props}/>
					<Navbar 
						navs={navs} 
						isNavbarFixed={isNavbarFixed} 
						handleClickCallback={this.getTopicList}
					/>
					{this.createTopicList()}
					{this.createGetMore()}
				</div>
			</div>
		);
	}
}

const getHome = (state) => {
	return state.home;
}
const selectors = createSelector(
	[getHome],
	(home) => {
		return {...home};
	}
)

export default connect(selectors)(Home);
