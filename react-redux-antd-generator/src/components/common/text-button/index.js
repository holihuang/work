import React from 'react'
import css from './index.less'

const TextButton = props => (
// eslint-disable-next-line no-script-url
    <a href="javascript:void(0);" className={css.btn} {...props}>{props.children}</a>
)

export default TextButton
