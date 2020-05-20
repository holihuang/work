/*
** @file: CaseHub
** @author: huanghaolei
** @date: 2019-11-13
*/

import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import Index from '../../components/courseLandingPage/Index'

const getState = state => {
    const { courseLandingPage = {} } = state
    return { courseLandingPage }
}

const selectors = createSelector(
    [getState],
    courseLandingPage => {
        return { ...courseLandingPage }
    },
)

export default connect(selectors)(Index)