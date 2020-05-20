import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

import css from './index.less'

const SubMenu = ({ menuList }) => (
    <div className={css['sub-menu__wrap']}>
        {
            menuList.map((menu, i) => (
                <NavLink to={menu.path} activeClassName={css['sub-menu__wrap--active']} key={i}>{menu.name}</NavLink>
            ))
        }
    </div>
)

SubMenu.propTypes = {
    menuList: PropTypes.array.isRequired,
}

export default SubMenu

