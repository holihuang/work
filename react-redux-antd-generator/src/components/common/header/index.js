import React from 'react'
import { Icon } from 'antd'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

import Constants from '$constants/common'
import routes from '../../../routes'
import Menu from '../menu/'
import logoImg from '../../../images/nav_icon_logo.png'
import style from './index.less'

class Header extends React.Component {
    constructor(props) {
        super(props)
        this.subRoutes = routes[0].routes.filter(item => !!item.name)
    }

    logout = () => {
        const { dispatch } = this.props
        dispatch({ type: Constants.LOGOUT })
    }

    render() {
        const { subRoutes } = this
        return (
            <div className={style.header}>
                <img src={logoImg} alt="" className={style.logo} />

                <Menu menuList={subRoutes} />
                <div
                    className={style.header__logout}
                    onClick={this.logout}
                    title="退出"
                >
                    <Icon type="poweroff" />
                </div>
            </div>
        )
    }
}

// 注入dispatch 的同时，注入router，让路由跳转时Menu可以同步render
export default connect(createSelector(
    [state => ({ router: state.router })],
    router => router,
))(Header)
