/**
 * @file 公开课新增|更新
 * @author huanghaolei
 * @date 2018-01-11
 *
 * */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Title from '../../common/reactComponent/Title'

import CourseRelated from './component/CourseRelated'
import CourseContent from './component/CourseContent'
import WeiXinShare from './component/WeiXinShare'
import SubmitBtn from './component/SubmitBtn'

export default (props) => {
    const { type } = props
    const title = type == 'edit' ? '更新公开课' : '新增公开课'
    const isAdd = type == 'edit' ? false : true
    const titleProps = {
        link: {
            'label': '< 返回',
            onChangeCb() {
                //hash changes here
                window.location.hash = '#publicLesson'
            },
        },
        title ,
    }

    const courseRelatedProps = {
        list: props.courseRelatedList,
        dispatch: props.dispatch,
    }
    const CourseContentProps = {
        list: props.courseContentList,
        dispatch: props.dispatch,
    }
    const weixinshareProps = {
        dispatch: props.dispatch,
        list: props.weixinShareList,
    }

    const submitProps = {
        dispatch: props.dispatch
    }

    const columns = [{
        title: <span style={{display:'table', margin:'0 auto'}}>选择</span>,
        dataIndex: 'chose',
        key: 'chose',
    }, {
        title: <span style={{display:'table', margin:'0 auto'}}>开课时间</span>,
        dataIndex: 'lessonDate',
        key: 'lessonDate',
    }, {
        title: <span style={{display:'table', margin:'0 auto'}}>课程名称</span>,
        dataIndex: 'lessonName',
        key: 'lessonName'
    }, {
        title: <span style={{display:'table', margin:'0 auto'}}>讲师姓名</span>,
        dataIndex: 'teacherName',
        key: 'teacherName',
    }, {
        title: <span style={{display:'table', margin:'0 auto'}}>供应商</span>,
        dataIndex: 'liveProvider',
        key: 'liveProvider',
    }]
    const { dataSource, choseLessonName, courseTagId, courseTagName, courseSourceList } = props
    Object.assign(courseRelatedProps, { dataSource, columns, choseLessonName, courseTagId, courseTagName, courseSourceList, isAdd })
    return (
        <div>
            <Title {...titleProps} />
            <CourseRelated {...courseRelatedProps}  />
            <CourseContent {...CourseContentProps} />
            <WeiXinShare {...weixinshareProps} />
            <SubmitBtn {...submitProps} />
        </div>
    )
}
