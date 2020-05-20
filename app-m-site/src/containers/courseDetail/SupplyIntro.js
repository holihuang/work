import React, { Component, PropTypes } from 'react';
import { hashHistory, Link } from 'react-router'
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Button, Toast, Card, Modal } from 'antd-mobile';
import weixinShare from '@sunl-fe/wechat-tools';

import styles from '../../styles/less/course.less';
import { GET_SCHOOL_INTRODUCTION_REQUESTED } from '../../constants/course';

import teacherImg1 from '../../images/course/teacher1.png'
import teacherImg2 from '../../images/course/teacher2.png'

const BIG_BEAR_URL = 'http://store.sunlands.com/appsh5/appconsult-lunbotu/daxiong6.html'

class SupplyIntro extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isNavbarFixed: false,  //是否吸顶,默认为不吸顶
		}
    }
    
    componentDidMount = () => {
        const { dispatch } = this.props
        const { schoolId = '' } = this.props.location.query
        dispatch({
            type: GET_SCHOOL_INTRODUCTION_REQUESTED,
            payload: {
                params: {
                    schoolId
                },
            }
        })
    }

    componentWillReceiveProps = (nextProps) => {
        const { schoolInfo: { schoolName } } = this.props
        const { schoolInfo: { schoolName: schoolNameNew } } = nextProps
        if(schoolNameNew !== schoolName) {
            if(typeof JSBridge !== 'undefined' && schoolNameNew) {
                JSBridge.doAction('actionSetTitle', '{}', JSON.stringify({
                    title: schoolNameNew
                }))
            } else {
                document.title = schoolNameNew
            }
        }
    }
    

	render() {
        const { schoolInfo: { introduction, schoolUrl } } = this.props
		return (
			<div className={styles['supply-wrapper']}>
                <div className={styles['supply-top']}>
                    <img src={schoolUrl}/>
                </div>
                <div className={styles['consultation-list']}>
                    <a href={BIG_BEAR_URL}>
                        <img src={teacherImg1} />
                        <img src={teacherImg2} />
                     </a>
                </div>
                <div className={styles['supply-info']}>
                    <div className={styles['supply-title']}>招生简介</div>
                    <img src={introduction} />
                </div>
                
			</div>
		);
	}
}

const getSubject = (state) => {
	return state.course;
}
const selectors = createSelector(
	[getSubject],
	(subject) => {
		return {...subject};
	}
)

export default connect(selectors)(SupplyIntro);
