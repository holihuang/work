import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import ComposeCard from '../../components/examTask/composeCard/Index'

const getState = state => {
    const { composeCard = {} } = state
    return { composeCard }
}

const selectors = createSelector(
    [getState],
    composeCard => {
        return {...composeCard}
    }
)
export default connect(selectors)(ComposeCard)
