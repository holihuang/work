import { createSelector } from 'reselect'
import { connect } from 'react-redux'

import Packages from '$components/products/package/'

export default connect(createSelector(
    state => ({ common: state.common, data: state['product-package'] }),
    data => data,
))(Packages)
