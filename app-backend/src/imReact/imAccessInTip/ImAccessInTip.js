import React from 'react'
import { Button, message } from 'antd'

class ImAccessInTip extends React.Component{
    constructor(props){
        super(props)
        this.state = {}
    }

    handleClearAccessIn = (e) => {
        const { dispatch, accessInNo } = this.props
        if (+accessInNo < 3) return
        window.localStorage.removeItem('imStateTimeStamp')
        message.info('清除完成！请刷新')
    }

    render() {
        const { style, text, accessInNo } = this.props
        const node = accessInNo < 3 ? (
            <div style={style}>{text}</div>
        ) : (
            <div style={{ textAlign: 'center', color: '#333', margin: '25px' }}>
                <p style={{ marginBottom: '25px', fontSize: '16px', textAlign: 'left', textIndent: '32px' }}>请确认您当前未打开其他App运营后台的tab页，若确认没有，请点击下面按钮后手动操作页面刷新</p>
                <Button type="primary" onClick={this.handleClearAccessIn}>{text}</Button>
            </div>
        )
        return (
            node
        )
    }
}

export default ImAccessInTip
