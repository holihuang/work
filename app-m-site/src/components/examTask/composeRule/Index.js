
import React from 'react'

import ruleImg from '../../../images/examTask/composeCard/rule.png'

const ComposeRule = () => {
    if(typeof JSBridge === 'undefined') {
        console.log('暂未检测到JSBridge')
    } else {
        // 隐藏分享功能
        JSBridge.doAction('hideShareButton', JSON.stringify({}), JSON.stringify({}))
    }
    return (<div style={{width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden', background: '#FEF6DF '}}>
        <img style={{width: '100%', display: 'block'}} src={ruleImg} alt=""/>
    </div>)
}

export default ComposeRule
