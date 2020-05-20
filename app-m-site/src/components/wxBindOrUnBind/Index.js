/*
** @file WxBind
** @author: huanghaolei
** @date: 2019-12-10 
*/

import React from 'react'
import { InputItem as Input, Button, Modal, Toast } from 'antd-mobile'
import CountDown from './common/CountDown'

import Constants from '../../constants/wxBindOrUnBind'
import style from '../../styles/less/wxBindOrUnBind.less'
import cfg from './cfg'

const { alert } = Modal
let defaultDocumentTitle = ''

const bindOrUnbindTxtSet = {
    1: '绑定',
    0: '解绑',
}

class WxBindOrUnBind extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        // 从url获取employ263
        this.saveToStoreFromHashParams()
    }

    componentDidMount() {
        defaultDocumentTitle = this.getDefaultDocTitle()
        this.setDocTitle(1)
        this.getOpenId()
    }

    componentWillUnmount() {
        this.setDocTitle(0)
    }

    saveToStoreFromHashParams = _ => {
        const { dispatch, location: { query } } = this.props
        const { employ263 } = query
        dispatch({
            type: Constants.ON_SAVE_DATA_FROM_URL,
            params: {
                employ263,
            }
        })
    }

    getOpenId = _ => {
        const { location: { query: { ticket = '' } }, dispatch } = this.props
        dispatch({
            type: Constants.ON_GET_USER_BY_TICKET_REQUESTED,
            payload: {
                params: {
                    ticket,
                },
            },
        })
    }

    getDefaultDocTitle = _ => {
        return document.title
    }

    setDocTitle = type => {
        // flag为路由参数，1：绑定页面，0解绑页面
        const { routeParams: { flag } } = this.props
        document.title = type ? `尚德员工账号${bindOrUnbindTxtSet[flag]}学员故事` : defaultDocumentTitle
    }

    unBindConfirm = _ => {
        const { routeParams: { flag } } = this.props
        return new Promise((resolve, reject) => {
            if(!+flag) {
                alert('', cfg.unBindTipTxt, [{
                    text: '取消',
                    onPress: () => {
                        resolve(0)
                    },
                }, {
                    text: '确定',
                    onPress: e => {
                        resolve(1)
                    }
                }])
            } else {
                resolve(1)
            }
        })
        
    }

    validateEmpty = _ => {
        const { wxBindOrUnBind: { params }, routeParams: { flag } } = this.props
        const { required } = cfg
        const key = +flag ? 'bindParamsKeys' : 'unBindParamsKeys'
        const arr = required[key]
        for(let i = 0; i < arr.length; i++) {
            const item = arr[i]
            if(!params[item.key]) {
                Toast.fail(`${item.label}不能为空！`)
                return true
            }
        }
        return false
    }

    handleSubmitClk = _ => {
        const { dispatch, wxBindOrUnBind: { params, openId }, routeParams: { flag } } = this.props
        
        // 验空
        if(this.validateEmpty()) return

        this.unBindConfirm().then(e => {
            if(!+e) return
            dispatch({
                type: Constants.ON_MANAGE_BIND_263_REQUESTED,
                payload: {
                    params: {
                        ...params,
                        openId,
                        operateFlag: 1 - (+flag)
                    },
                    cb: () => {
                        const hashParamsStr = +flag ? `?employ263=${params.employ263}` : ''
                        const val = 1 - (+flag)
                        window.location.hash = `/wxBindOrUnBind/${val}${hashParamsStr}`
                        this.resetParams(val, params.employ263)
                    }
                },
            })
        })
    }

    // 绑定/解绑表单参数重置
    resetParams = (val, employ263) => {
        const { dispatch } = this.props
        const params = !+val ? { employ263 } : {}
        dispatch({
            type: Constants.ON_CLEAR_PARAMS,
            params,
        })
    }

    handleIptChange = (opt = {}) => {
        const { dispatch } = this.props
        const { iptMaxLength: { key, maxlength } } = cfg
        if(key in opt) {
            if(opt[key].length > maxlength) {
                return
            }
        }
        dispatch({
            type: Constants.ON_CHANGE_ACCOUNT,
            payload: {
                params: {
                    ...opt,
                },
            }
        })
    }

    getCodeParams = _ => {
        const { codeParamsKeys } = cfg
        const { wxBindOrUnBind } = this.props
        const { params } = wxBindOrUnBind
        const obj = { ...wxBindOrUnBind, ...params }
        return codeParamsKeys.reduce((res, item) => {
            return { ...res, [item]: obj[item] || '' }
        }, {})
    }

    renderIpt = (opt ={}) => {
        const { type, placeholder, icon, key } = opt
        const { wxBindOrUnBind: { params }, routeParams: { flag } } = this.props
        const iptProps = {
            value: params[key],
            placeholder,
            disabled: !+flag,
            className: style.ipt,
            onChange: e => {
                this.handleIptChange({ [key]: e })
            },
        }
        const countDownProps = {
            params: this.getCodeParams(),
        }
        return (
            <div className={style.iptWrapper}>
                <img src={icon} className={style.rowImg} />
                <Input {...iptProps} />
                {
                    type === 'password' ? (
                        <CountDown {...countDownProps} />
                    ) : null
                }
            </div>
        )
    }

    renderIptList = arr => {
        return arr.map(item => {
            const { type = '', icon = '', placeholder = '' } = item
            if(type === 'account') {
                return (
                    <div className={style.rowWrapper}>
                        {
                            this.renderIpt(item)
                        }
                    </div>
                )
            } else if(type === 'password') {
                return (
                    <div className={style.rowWrapper}>
                        {
                            this.renderIpt(item)
                        }
                    </div>
                )
            }
        })
    }

    renderSubmit = _ => {
        const { routeParams: { flag } } = this.props
        const cn = +flag ? 'submitBtn' : 'unBindSubmitBtn'
        const keyOfBtnTxt = +flag ? 'submitBtnTxt' : 'unBindBtnTxt'
        const submitBtnProps = {
            type: 'primary',
            className: style[cn],
            onClick: this.handleSubmitClk,
        }
        return (
            <Button {...submitBtnProps}>
                { cfg[keyOfBtnTxt] }
            </Button>
        )
    }

    renderWxBind = _ => {
        const { bindInputList } = cfg
        return (
            <div>
                {
                    this.renderIptList(bindInputList)
                }
                <div className={style.passwordTipTxt}>
                    {cfg.passwordTipTxt}
                </div>
                {
                    this.renderSubmit()
                }
                <div className={style.guideTxt} dangerouslySetInnerHTML={{ __html: cfg.guideTxt }} />
            </div>
        )
    }

    renderWxUnBind = _ => {
        const { unBindIptList, unBindBtnTxt } = cfg
        return (
            <div>
                {
                    this.renderIptList(unBindIptList)
                }
                {
                    this.renderSubmit()
                }
            </div>
        )
    }

    render() {
        const { routeParams: { flag } } = this.props
        return (
            <div className={style.wrapper}>
                {
                    +flag ? (
                        this.renderWxBind()
                    ) : (
                        this.renderWxUnBind()
                    )
                }
            </div>
        )
    }
}

export default WxBindOrUnBind
