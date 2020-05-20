/**
 * @file app后台 field: DatePicke factory
 *
 * @author gushouchuang
 * @date 2018-1-4
 */
import React from 'react'
import moment from 'moment'

import { DatePicker } from 'antd'

export default (source, me) => {
    const dateProps = {
        size: source.size || 'default',
        onChange: (e, value) => {
            const stateChange = {
                ...me.state[me._stateKey],
                [source.field]: value
            }
            // changeAndDispath有关于外部业务的定制到model的onchange通信
            me.changeAndDispath({
                [me._stateKey]: stateChange
            }, source, {
                e,
                value
            })
        }
    }
    // 支持时间选择的日期封禁
    if(source.disabledDate) {
        dateProps.disabledDate = source.disabledDate
    }
    // 需要精确到hh:mm:ss
    if (source.needHMS) {
        dateProps.format = "YYYY-MM-DD HH:mm:ss"
        dateProps.showTime = { defaultValue: moment('00:00:00', 'HH:mm:ss') }
    }

    return (
        <DatePicker {...dateProps} />
    )
}
