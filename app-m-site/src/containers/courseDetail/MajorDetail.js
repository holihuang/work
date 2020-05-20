import React, { Component, PropTypes } from 'react';
import { hashHistory } from 'react-router'
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Button, Toast, Card, Modal, Icon } from 'antd-mobile';
import weixinShare from '@sunl-fe/wechat-tools';

import styles from '../../styles/less/course.less';
import ShowAll from '../../components/showAll/Index';
import { GET_ALL_COURSE_LIST_REQUESTED } from '../../constants/course';

class MajorDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isNavbarFixed: false,  //是否吸顶,默认为不吸顶
		}
    }
    
    componentDidMount = () => {
        const { dispatch } = this.props
        const { majorId = '', majorName = '', regionId = '' } = this.props.location.query
        const title = majorName + '考试科目'
        if(typeof JSBridge !== 'undefined' && majorName) {
            JSBridge.doAction('actionSetTitle', '{}', JSON.stringify({
                title
            }))
        } else {
            document.title = title
        }
        dispatch({
            type: GET_ALL_COURSE_LIST_REQUESTED,
            payload: {
                params: {
                    majorId,
                    regionId,
                },
            }
        })
    }

    renderExamTime = _ => {
        const { courseList: { examTime = ''} } = this.props
        const ele =  examTime.replace(/\d{1,2}/g, value => {
            return `<span class=${styles['word-bg']}>${value}</span>`
        })
        return ele 
    }

	render() {
        const { courseList: { examTime = '', result = []} } = this.props
        const { count } = this.props.location.query
		return (
			<div className={styles['major-wrapper']}>
                <div className={styles['major-top']}>
                    <p className={styles['title-first']}>共{count}科</p>
                    <p className={styles['title-second']}>考试科目</p>
                    {
                        examTime && examTime.length ?
                        <p className={styles['top-desc']} dangerouslySetInnerHTML={{__html: '考试时间：' + this.renderExamTime()} }>
                        </p> : null
                    }
                    
                </div>
                <div className={styles['major-content']}>
                {
                    result.map( item => {
                        return <div className={styles['major-item']}>
                                    <div className={styles['major-title']}>
                                        {item.courseName}
                                    </div>
                                    <div className={styles['major-desc']}>
                                        <ShowAll 
                                            content={item.courseDesc}
                                            lines={3} ellipsis={<span>... <Icon style={{color: '#ce0000'}} className={styles['show-all']} type="down" /></span>}>
                                                
                                        </ShowAll>
                                    </div>
                                </div>
                    })
                }
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

export default connect(selectors)(MajorDetail);
