/*
 * @Author: litingwei
 * @Date: 2019-09-16 16:28:59
 * @LastEditTime: 2019-09-25 10:31:27
 * @LastEditors: litingwei
 */
import React from 'react'
import { log } from "util";

import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import Examine from '../../components/examine/Index'
import style from '../../styles/less/examine.less'
import util from '../../common/util'
import Constants from '../../constants/examine'
class ExamineContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            flag: -1,
        }
    }
    componentDidMount() {
        //发送请求 回调里面去设置flag 然后控制显隐
       this.getUserInfoByToken()
    }
    /*
     * @description: 通过token换取用户信息 
     * @param : 
     * @return: 
     */
    getUserInfoByToken = () => {
        const { dispatch } = this.props
        const token = ''
        dispatch({
            type: Constants.GET_USERINFO_BY_TOKEN_REQUESTED,
            payload: {
                params: {
                    accessToken: util.getURLParams().accessToken || ''
                },
                cb: data => {
                    // 263存在并且token未过期，才能进入访问，不然展示没有权限的界面
                    if (data.email263 && !data.isExpired) {
                        this.setState({
                            flag: 1,
                        })
                    } else {
                        this.setState({
                            flag: 2,
                        })
                    }
                }
            },
        })
    }
    render() {
        return (
            <div className={style.examineContainer}>
                {
                    this.state.flag === 1 ?
                        <Examine {...this.props} />
                        :
                        null
                }
                {
                    this.state.flag === 2 ?
                        <div className={style.need_authorize}>您的账号未被授权，申请授权请联系后端运营平台</div>
                        :
                        null
                }
            </div>
        )
    }
}
const getState = state => {
    const { examine = {} } = state
    return { examine }
} 

const selectors = createSelector(
    [getState],
    examine => {
        return { ...examine }
    },
)

export default connect(selectors)(ExamineContainer)