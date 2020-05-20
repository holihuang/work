/*
** @file: WrongPage(登录异常，列表为空页面组件)
** @author: huanghaolei
** @date: 2019-08-01
*/

import React from 'react'
import style from '../../styles/less/sideEffect.less'
import NO_LIST_PIC from '../../images/no-list.png'
import ERR_TIP_PIC from '../../images/sideEffectErr.png'

const errorPageInfo = {
    empty: {
        image: NO_LIST_PIC,
        text: '当前没有符合条件的学员故事',
    },
    err: {
        image: ERR_TIP_PIC,
        text: `抱歉，未找到您的账号信息\n重新访问试一下\n或联系您的HR核对信息`,
    }
}

class WrongPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    renderTxt = txt => {
        const arr = txt.split('\n') || []
        return arr.map((item, index)=> {
            return <div key={index}>{item}</div>
        })
    }
    render() {
        const { type = 'empty' } = this.props
        const obj = errorPageInfo[type]
        const txtDom = this.renderTxt(obj.text)
        return (
            <div className={style.noDataUnit}>
                <div className={style.noDataPic}>
                    <img src={obj.image} alt="no-list-pic" />
                </div>
                <div className={style.noDataTxt}>{txtDom}</div>
            </div>
        )
    }
}

export default WrongPage
