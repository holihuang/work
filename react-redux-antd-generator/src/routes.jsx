import React from 'react'
import { renderRoutes } from 'react-router-config'
import { Redirect } from 'react-router'

// Main page
import Main from '$containers/main'

import Packages from '$containers/nav1/package'

const EmptyNode = ({ route: { routes } }) => renderRoutes(routes)

const routes = [
    {
        path: '/',
        component: Main,
        routes: [
            {
                path: '/',
                exact: true,
                component: () => <div>fake home</div>,
                // 一级路由中，含有 name 属性的路由会自动出现在顶部导航栏中
                name: '首页',
            },
            {
                path: '/nav1',
                component: EmptyNode,
                name: '模块1',
                routes: [
                    {
                        path: '/nav1',
                        exact: true,
                        component: () => <Redirect to="/nav1/sub-nav-1-1" />,
                    },
                    {
                        path: '/nav1/sub-nav-1-1',
                        component: Packages,
                        // 二级路由中，含有 name 属性的路由会自动出现在二级菜单中
                        name: '子模块1-1',
                    },
                    {
                        path: '/nav1/sub-nav-1-2',
                        component: () => '子模块1-2',
                        name: '子模块1-2',
                    },
                ],
            },
            {
                path: '/nav2',
                component: EmptyNode,
                name: '模块2',
                routes: [
                    {
                        path: '/nav2',
                        exact: true,
                        component: () => <Redirect to="/nav2/sub-nav-2-1" />,
                    },
                    {
                        path: '/nav2/sub-nav-2-1',
                        component: EmptyNode,
                        name: '子模块2-2',
                    },
                ],
            },
        ],
    },
]

export default routes
