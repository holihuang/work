/**
 * @file app后台 field: NumberRange factory
 *
 * @author gushouchuang
 * @date 2018-1-4
 */
import React from 'react'

import { InputNumber } from 'antd'

export default (source, me) => {
    const minProps = {
        defaultValue: me.state[me._stateKey][source.field].min,
        style: {
            display: 'inline-block',
        },
        onChange: e => {
            const stateChange = {
                ...me.state[me._stateKey],
                [source.field]: {
                    ...me.state[me._stateKey][source.field],
                    min: e
                }
            }
            // changeAndDispath有关于外部业务的定制到model的onchange通信
            me.changeAndDispath({
                [me._stateKey]: stateChange
            }, source, e)
        }
    }

    const maxProps = {
        defaultValue: me.state[me._stateKey][source.field].max,
        style: {
            display: 'inline-block',
            ...source.style,
        },
        onChange: e => {
            const stateChange = {
                ...me.state[me._stateKey],
                [source.field]: {
                    ...me.state[me._stateKey][source.field],
                    max: e
                }
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
            <InputNumber {...minProps} />
            <span style={{
                padding: '0 5px'
            }}>至</span>
            <InputNumber {...maxProps} />
        </div>
    )
}
