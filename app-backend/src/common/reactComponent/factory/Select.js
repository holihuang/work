/**
 * @file app后台 field: Select factory
 *
 * @author gushouchuang
 * @date 2018-1-4
 */
import React from 'react'

import { Select } from 'antd'

export default (source, me) => {
    const dom = []
    let label = ''
    const fieldValue = me.state[me._stateKey][source.field]
    source.dataSource.forEach((item, index) => {
        // 获取当前的显示label 注意是== 有数字格式转换
        fieldValue == item.value && (label = item.label)
        dom.push(
            <Option key={index} value={item.value}>{item.label}</Option>
        )
    })

    const selectProps = {
        defaultValue: me.state[me._stateKey][source.field],
        value: label,
        disabled: source.disabled || false,
        style: {
            ...source.style
        },
        onChange: e => {
            // 外部业务注入
            const stateChange = {
                ...me.state[me._stateKey],
                [source.field]: source.valueType === 'number'? +e : e, // 数字 or 字符串
            }
            // changeAndDispath有关于外部业务的定制到model的onchange通信
            me.changeAndDispath({
                [me._stateKey]: stateChange
            }, source, e)
        }
    }

    return (
        <Select {...selectProps}>
            {dom}
        </Select>
    )
}
