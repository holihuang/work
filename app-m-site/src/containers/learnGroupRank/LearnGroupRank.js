import { log } from "util";

import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import LearnGroupRank from '../../components/learnGroupRank/index'

const getState = state => {
    const { learnGroupRank = [] } = state
    return learnGroupRank
} 

const selectors = createSelector(
    [getState],
    data => {
        return { data }
    },
)

export default connect(selectors)(LearnGroupRank)