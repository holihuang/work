/*
** @file: WxBind
** @author: huanghaolei
** @date: 2019-12-10
*/

import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import WxBindOrUnBind from '../../components/wxBindOrUnBind/Index'

const getState = state => {
    const { wxBindOrUnBind = {} } = state
    return { wxBindOrUnBind }
} 

const selectors = createSelector(
    [getState],
    wxBindOrUnBind => {
        return {...wxBindOrUnBind}
    },
)

export default connect(selectors)(WxBindOrUnBind)