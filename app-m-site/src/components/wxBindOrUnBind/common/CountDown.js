/*
** @file: CountDown
** @author: huanghaolei
** @date: 2019-12-10
*/
import React from 'react'
import getJSON from '../../../common/dataService'
import Urls from '../../../constants/URLS'
import style from '../../../styles/less/countDown.less'

const timeUpper = 60
let time = timeUpper
let timerId

class CountDown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: timeUpper,
            defaultTxt: '发送验证码',
            countDownStarts: false,
        }
    }

    countDown = _ => {
        time--
        if(time < 0) {
            this.setState({
                value: timeUpper,
                countDownStarts: false
            })
            time = timeUpper
        }
        timerId = setTimeout(() => {
            clearTimeout(timerId)
            this.setState({ value: time })
            this.countDown(time)
        }, 1000)
    }

    getCode = _ => {
        const { params } = this.props
        getJSON(Urls.SEND_VLD_CODE_URL, params)
    }

    handleClk = _ => {
        this.setState({
            countDownStarts: true,
        }, () => {
            this.countDown()
        })
        this.getCode()
    }

    render() {
        const { value, defaultTxt, countDownStarts } = this.state
        const activeClass = countDownStarts ? 'countDownActive' : 'countDownDefault'
        return (
            <div className={style[activeClass]} onClick={this.handleClk}>
                {
                    countDownStarts ? `${value}s` :defaultTxt
                }
            </div>
        )
    }
}

export default CountDown
