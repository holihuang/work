/*
** @file: 公益项目
** @author: fxr
** @date: 2019-12-20
*/

import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import Index from '../../components/publicBenefitDetail/index'

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