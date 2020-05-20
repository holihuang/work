import React from 'react'

export default function(props) {
    const { body: { component: Component, bodyProps = {} }, selectedTabBarIndex,  } = props
    
    if (Component && !(Component instanceof Object)) {
        console.error('page 不是组件')
        return
    }
    
    const defaultStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    }

    return (
        Component ? (
            <Component {...bodyProps} />
        ) : (
            <div style={defaultStyle}>Page { selectedTabBarIndex + 1 }</div>
        )
    )
}