/*
** @file: CaseHub
** @author: huanghaolei
** @date: 2019-05-20
*/

import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import CaseHubUI from '../../components/caseHub/Index'

const getState = state => {
    const { caseHub = {} } = state
    return { caseHub }
} 

const selectors = createSelector(
    [getState],
    caseHub => {
        return {...caseHub}
    },
)

export default connect(selectors)(CaseHubUI)