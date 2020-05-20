/*
** @file: ExamTask 容器组件
** @author: huanghaolei
** @date: 2020-02-26
*/

import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import Component from 'components/examTask/Index'

const getState = state => {
    const { examTask = {} } = state
    return { examTask }
}

const selectors = createSelector(
    [getState],
    examTask => {
        return {...examTask}
    }
)
export default connect(selectors)(Component)
