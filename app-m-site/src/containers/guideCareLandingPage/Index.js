/*
** @file: GuideCareLandingPage
** @author: huanghaolei
** @date: 2019-11-15
*/

import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import Index from '../../components/guideCareLandingPage/Index'

const getState = state => {
    const { guideCareLandingPage = {} } = state
    return { guideCareLandingPage }
}

const selectors = createSelector(
    [getState],
    guideCareLandingPage => {
        return { ...guideCareLandingPage }
    },
)

export default connect(selectors)(Index)