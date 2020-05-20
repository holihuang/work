/*
** @file: ExamVideo 容器组件
** @author: huanghaolei
** @date: 2020-03-03
*/

import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import Component from 'components/examVideo/Index'

const getState = state => {
    const { examVideo = {} } = state
    return { examVideo }
}

const selectors = createSelector(
    [getState],
    examVideo => {
        return {...examVideo}
    }
)
export default connect(selectors)(Component)