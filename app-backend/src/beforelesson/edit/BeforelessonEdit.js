/**
 * @file 体验前置
 *
 * @auth gushouchuang
 * @date 2018-3-1
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Tabs } from 'antd'
const TabPane = Tabs.TabPane

import Title from 'common/reactComponent/Title'
import titleCfg from './cfg/title'

import Baisc from './basic/Index'
import Qa from './qa/Index'
import Teacher from './teacher/Index'
import Class from './class/Index'
import Region from './region/Index'
import Subject from './subject/Index'
import School from './school/Index'

function creatTabsFactory(props) {
    const dom = []
    const { majorId, type, typeId, classIsNone } = props
    const commonProps = {
        majorId,
        typeId,
        classIsNone,
        dispatch: props.dispatch,
        loading: props.loading,
    }

    dom.push(
        <TabPane tab="基础信息" key="basic">
            <Baisc {...props.basic} {...commonProps} />
        </TabPane>
    )
    dom.push(
        <TabPane tab="答疑视频" key="qa">
            <Qa {...props.qa} {...commonProps} />
        </TabPane>
    )
    dom.push(
        <TabPane tab="师资实力" key="teacher">
            <Teacher {...props.teacher} {...commonProps} />
        </TabPane>
    )
    // 专业为研究生，加院校tab
    if ([1].indexOf(typeId) > -1) {
        dom.push(
            <TabPane tab="招生院校" key="school">
                <School {...props.school} {...commonProps} />
            </TabPane>
        )
    }
    dom.push(
        <TabPane tab="班型介绍" key="class">
            <Class {...props.class} {...commonProps} />
        </TabPane>
    )
    // 专业为自考本科、专科，加地域tab
    if ([2, 3].indexOf(typeId) > -1) {
        dom.push(
            <TabPane tab="地域信息" key="region">
		        <Region {...props.region} {...commonProps} />
            </TabPane>
        )
    }
    dom.push(
        <TabPane tab="考试科目" key="subject">
            <Subject {...props.subject} {...commonProps} />
        </TabPane>
    )

    const tabsProps = {
        defaultActiveKey: props.type,
        onChange: e => {
            props.dispatch('modulChange', e)
        }
    }

    return (
        <Tabs {...tabsProps} >
            {dom}
        </Tabs>
    )
}


export default props => {
    const titleProps = titleCfg(props)
    // 不在4大类别中
    if ([1, 2, 3, 4].indexOf(props.typeId) === -1 || !/^\d+$/.test(props.majorId)) {
        return (
            <div style={{
                lineHeight: '80px',
                paddingLeft: '30px',
                color: 'red',
                fontSize: '24px',
            }}>
                链接错误~~
            </div>
        )
    }

    return (
        <div>
            <Title {...titleProps} />
            {creatTabsFactory(props)}
        </div>
    )
}
