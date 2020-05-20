/**
 * @file app后台 field: 自定义 Diy
 *
 * @author gushouchuang
 * @date 2018-2-23
 */
import React from 'react'

export default (source, me) => {
    const field = source.field

    const cbProps = {
    	// 业务与模板交互 显隐/加载
    	changeState: cbValue => {

            const stateChange = me.state[me._stateKey]
            // 仅支持更改当前field的值，如果有特殊需要，咱们再看~
            stateChange[field] = cbValue
            // changeAndDispath有关于外部业务的定制到model的onchange通信
            me.changeAndDispath({
                [me._stateKey]: stateChange
            }, source, cbValue)
    	}
    }

    return (
    	<div style={{
			display: 'inline-block',
    	}}>
            {
                source.render(cbProps)
            }
    	</div>
    )
}

