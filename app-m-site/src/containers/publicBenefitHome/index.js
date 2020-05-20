/*
** @file: 公益项目
** @author: hyt
** @date: 2019-12-09
*/

import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import Index from '../../components/publicBenefitHome/index'

const getState = state => {
    const { publicBenefit = {} } = state
    return { publicBenefit }
}

const selectors = createSelector(
    [getState],
    publicBenefit => {
        return { ...publicBenefit }
    },
)

export default connect(selectors)(Index)