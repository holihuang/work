/*
** @file: sideEffect.js
** @author: huanghaolei
** @date: 2019-06-11
*/
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import SideEffectUI from '../../components/sideEffect/Index'

const getState = state => {
    const { sideEffect = {}, readRecord = {}, userCenter = {} } = state
    return { sideEffect, readRecord, userCenter }
}

const selectors = createSelector(
    [getState],
    state => {
        return {...state}
    }
)

export default connect(selectors)(SideEffectUI)