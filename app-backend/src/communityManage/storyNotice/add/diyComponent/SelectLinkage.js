/*
**@file: SelectLinkage - select和input联动组件（没有selectKey字段时，key字段作为select组件的字段，input的value作为value值）
**@author: huanghaolei
**@date: 2019-10-16
*/

import React, { useState } from 'react'
import { Select, Input } from 'antd'

const { Option } = Select

// 补全Select 下拉option value值
function completeOptionValue(list) {
    return list.map(item => {
        const { label, value } = item
        return {
            ...item,
            value: value || label,
        }
    })
}

function handleSelectChange(e, setState, opt = {}) {
    const { list, onChange, selectKey } = opt
    const obj = {}
    list.forEach((item, index) => {
        if (item.value === e) {
            obj.selectedIndex = index
            obj.selectedKey = item.key
            obj.selectedValue = item.value
        }
    })
    setState(obj)
    // 选中‘自定义参数’,手动清空选中值
    onChange({ [selectKey]: obj.selectedKey === 'input' ? '' : e })
}


function renderOptionList(props) {
    const { list } = props
    return list.map(item => {
        const { label, value } = item
        return <Option value={value}>{label}</Option>
    })
}

function SelectLinkage(props) {
    const {
        list, defaultValue = '', onInput, onChange, selectKey, value,
    } = props
    const completedValueList = completeOptionValue(list)
    const firstOption = completedValueList[0]
    const defaultState = {
        selectedKey: firstOption.key || '',
        selectedIndex: 0,
        selectedValue: firstOption.value || '',
    }
    const [state, setState] = useState(defaultState)
    const { selectedKey, selectedIndex, selectedValue } = state
    const wrapperStyle = {
        display: 'flex',
    }
    const selectProps = {
        defaultValue: firstOption.value || defaultValue,
        style: {
            width: '160px',
            marginRight: '1%',
        },
        onChange: e => {
            handleSelectChange(e, setState, { list: completedValueList, onChange, selectKey })
        },
    }
    const iptProps = {
        placeholder: completedValueList[selectedIndex].placeholder,
        value,
        onChange: e => {
            let params = {
                [selectedKey]: e.target.value.trim(),
                [selectKey]: selectedValue,
            }
            if (selectedKey === 'input') {
                params = {
                    [selectKey]: params[selectedKey],
                }
            }
            if (completedValueList[selectedIndex].reg) {
                if (completedValueList[selectedIndex].reg.test(e.target.value)) {
                    onInput(params)
                }
            } else {
                onInput(params)
            }
        },
    }
    return (
        <div style={wrapperStyle}>
            <Select {...selectProps}>{ renderOptionList({ ...props, list: completedValueList }) }</Select>
            {
                selectedKey ? <Input {...iptProps} /> : null
            }
        </div>
    )
}

export default SelectLinkage
