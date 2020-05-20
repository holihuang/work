/*
** @file: PersonalProfile
** @author: huanghaolei
** @date: 2019-08-19
*/

import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import PersonalProfileUI from '../../components/personalProfile/Index'

const getState = state => {
    const { personalProfile = {} } = state
    return { personalProfile }
} 

const selectors = createSelector(
    [getState],
    personalProfile => {
        return {...personalProfile}
    },
)

export default connect(selectors)(PersonalProfileUI)