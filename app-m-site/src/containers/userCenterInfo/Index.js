/*
** @file: UserCenterInfo
** @author: huanghaolei
** @date: 2019-12-13
*/

import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import UserCenterInfo from '../../components/userCenterInfo/Index'

const getState = state => {
    const { userCenterInfo = {} } = state
    return { userCenterInfo }
} 

const selectors = createSelector(
    [getState],
    userCenterInfo => {
        return {...userCenterInfo}
    },
)

export default connect(selectors)(UserCenterInfo)