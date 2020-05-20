/**
 * @file app后台 field: 自定义 DiySelect
 *
 * 复用性较低~~ 尽量考虑使用Diy
 *
 * @author gushouchuang
 * @date 2018-1-4
 */
import React from 'react'

export default (source, me) => {
    const field = source.field

    const containerProps = {
    	onClick: () => {
    		me.setState({
    			[field + 'render']: true
    		})
    	}
    }

    const cbProps = {
        selected: me.state[me._stateKey][field],
    	// 回填数据到上层组件
    	cbValue: list => {
            // changeAndDispath有关于外部业务的定制到model的onchange通信
            me.changeAndDispath({
                [me._stateKey]: {
                    ...me.state[me._stateKey],
                    [field]: list
                },
                [field + 'render']: false,
            }, source, list)
    	},
    	// 业务与模板交互 显隐/加载
    	changeState: changeState => {
            me.changeAndDispath({
                ...changeState
            }, source, {})
    	}
    }

    const labelMax = source.labelMax || 15
    let label = []
    const list = me.state[me._stateKey][field] || []

    label = list.map(item => {
        return item.label
    })

    label = label.join(";")
    label.length > labelMax && (label = label.substring(0, labelMax - 1) + '...')
    label || (label = source.placeholder)

    return (
    	<div style={{
			display: 'inline-block',
    	}}>
    		<div {...containerProps} style={{
    			border: '1px solid #d9d9d9',
				lineHeight: '26px',
				position: 'relative',
				padding: '0 5px',
				cursor: 'pointer',
                ...source.style
    		}}>
                {label}
    		</div>
    		{
    			me.state[field + 'render']
    			? source.render(cbProps)
    			: null
    		}
    	</div>
    )
}
