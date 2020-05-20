/**
 * @file app后台 filter Button factory
 *
 * @author gushouchuang
 * @date 2018-1-4
 */
import React from 'react'

import { Button } from 'antd'

export default source => {

    const btnProps =  {
    	key: source.key,
        type: source.skin,
        style: source.style,
        disabled: source.disabled || false,
        onClick: source.onClickCb
    }

    return (
        <Button {...btnProps}>{source.text}</Button>
    )
}
