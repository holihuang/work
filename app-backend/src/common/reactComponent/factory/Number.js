/**
 * @file app后台 field: Number factory
 *
 * @author gushouchuang
 * @date 2018-1-4
 */
import React from 'react'

import { InputNumber } from 'antd'

export default (source, me) => {
    const numberProps = {
        defaultValue: me.state[me._stateKey][source.field],
        style: {
            display: 'inline-block',
            ...source.style,
        },
        onChange: e => {
            const stateChange = {
                ...me.state[me._stateKey],
                [source.field]: e
            }
            // changeAndDispath有关于外部业务的定制到model的onchange通信
            me.changeAndDispath({
                [me._stateKey]: stateChange
            }, source, e)
        }
    }

    return (
        <div style={{
            display: 'inline-block'
        }}>
            <InputNumber {...numberProps} />
        </div>
    )
}
