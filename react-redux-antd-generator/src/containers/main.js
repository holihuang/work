import React from 'react'
import { renderRoutes } from 'react-router-config'

import SubMenu from '$components/common/menu/sub-menu'
import Header from '$components/common/header/'

const { Fragment } = React

const Main = ({ location, route: { routes } }) => {
    const paths = location.pathname.split('/')
    const currentRoute = routes.find(route => route.path.substr(1) === paths[1])
    const subMenus = (currentRoute.routes || []).filter(route => !!route.name)
    return (
        <Fragment>
            <Header />
            {
                !!subMenus.length && <SubMenu menuList={subMenus} />
            }
            {renderRoutes(routes)}
        </Fragment>
    )
}

export default Main

