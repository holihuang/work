import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

import style from './index.less'

const Menu = ({ menuList }) => (
    <div className={style.menu}>
        {menuList.map((first, index) => (
            <NavLink
                key={index}
                title={first.name}
                to={first.path}
                activeClassName={style.menu__active}
                exact={!!first.exact}
            >
                {first.name}
            </NavLink>
        ))}
    </div>
)

Menu.propTypes = {
    menuList: PropTypes.array.isRequired,
}

export default Menu
