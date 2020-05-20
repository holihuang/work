/**
 * @file app后台 field: Textarea factory
 *
 * @author gushouchuang
 * @date 2018-3-1
 */
import React from 'react'
import validate from 'common/core/validations'

import { Input } from 'antd'
const { TextArea } = Input;

export default (source, me) => {

    const textProps =  {
        defaultValue: me.state[me._stateKey][source.field],
        placeholder: source.placeholder,
        value: me.state[me._stateKey][source.field],
        autosize: source.autosize || {
            minRows: 4,
            maxRows: 6
        },
        disabled: source.disabled || false,
        style: {
            display: 'inline-block',
            ...source.style,
        },
        onChange: e => {
            // @important 进edit组件下的Input 才有valid权限，filters不支持valid
            // 仅validate 不阻止input输入 支持每个field多个校验规则（即使单一规则，业务配置也需要包数组）
            if (me._stateKey === 'edit' && source.valid && source.valid.onchange && source.valid.onchange.length) {
                // 校验规则是否通过
                let message = []
                source.valid.onchange.forEach(item => {
                    let reg = item.reg
                    if (reg.test) {
                        // 本身就是正则
                        if (!reg.test(e.target.value)) {
                            message.push(item.message || '格式错误')
                        }
                    } else if (typeof reg === 'function' || validate[reg]) { // valid lib
                        const validFunc = typeof reg === 'function' ? reg : validate[reg]
                        // 带第二参数value的 一般都是长度，请注意这里转了数字格式。
                        const validRst = validFunc(e.target.value.trim(), +item.value)
                        if (!validRst.rst) {
                            message.push(validRst.message)
                        }
                    }
                })

                const changeError = me.state.changeError
                changeError[source.field] = message.length ? message.join('; ') : ''
                me.setState(
                    changeError
                )
            }

            const stateChange = {
                ...me.state[me._stateKey],
                [source.field]: e.target.value
            }
            // changeAndDispath有关于外部业务的定制到model的onchange通信
            me.changeAndDispath({
                [me._stateKey]: stateChange
            }, source, e)
        }
    }

    return (
        <TextArea {...textProps} />
    )
}
