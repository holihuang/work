/**
 * @file Backbone做mvc，react内嵌到v层，使用Backbone.roure做项目路由
 * @TODO
 * 关于Backbone的Collection未做兼容
 * 销毁逻辑同Backbone原生
 *
 * 关于参数：
 * defaults - 支持生成简单的model
 * model - 复杂的model实例，在业务中生成，优先级高于defaults
 * view -
 *   // life cyc相关 可选
 *   preInit: 留给业务的初始化钩子，接受options
 *   load: init中加载数据，只被执行一次，return结果必须为Array，View.render会等load中的数据加载完（promise.all）
 *   prepare: 对请求回来的数据做进一步处理，建议不要在prepare中再发请求，View.render不会再等prepare中的异步请求
 *   preRender: 替代Backbone.view.render，每次render前，此方法都会被调用一次
 *   initBehavior: 第一次初始化结束后，会调用一次此方法，可用于做二次请求和特殊逻辑fix等
 *   @required el为必选项
 *   el: 根容器，重写了remove，不会销毁el，仅innerHTML清空，监听的事件销毁逻辑沿用Backbone原生
 *   Component: react组件
 *
 * 关于组件：
 * Backbone必须为顶层路由组件（有独立路由），不建议Backbone的组件嵌套，建议顶层的Backbone.view上直接对接react
 *
 * 关于调用：
 * 1.由于对象切换较多，请自行确保this指向正确 ps:function使用es6写法，不然编译会将方法内的this替换成undefined
 * 2.el在组件dispose时候会被销毁掉，注意el的层级
 *
 * 关于数据：
 * 1.不建议model多重绑定，一个model绑定一个view，但数据可以互通给其他view
 * 2.复杂的model一定要在业务上实例化好后传给生成器，简单的model可以传配置（defaults），会优先取model实例
 * 3.生成器不会返回model实例，如果需要，可以优先在业务上实例化好，或者通过view.model获取
 *
 * 关于事件：
 * 1.组件间的通信，用Backbone的原生Events，直接代理在Backbone全局事件，注意命名冲突，建议以项目名为前缀
 * 2.不建议互相import model做手动监听，建议通过订阅事件完成数据通信
 * 3.Backbone的事件管理是栈，也就是后进先出
 * 4.从react中向上通信，请统一使用dispath方法，如this.props.dispath('your method name', params)
 *
 * @dep lodash、React、Backbone、Promise
 * @auth gushouchuang
 * @date 2017-12-18
 */

import _ from 'lodash'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { LocaleProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import 'moment/locale/zh-cn'

// 对接业务 加入业务上的global 做组件间跳转的数据回填。
import { global } from 'common/global'

const defaultsProps = {
    Component: () => (
        <div style={{
            lineHeight: '60px',
            textAlign: 'center',
            fontSize: '24px',
            color: '#f00',
        }}
        >
                请配置child component~
        </div>
    ),
    // life cyc中的业务钩子
    preInit: () => {},
    load: () => [],
    prepare: state => state,
    preRender: () => {},
    initBehavior: () => {},
}

/**
 * React对接Bcakbone的View
 *
 * @params {Object} options 初始化参数
 * @return {Object} Backbone.view
 */
const ComponentGenerator = (options = {}) => {
    let {
        model = null,
        view = {},
        defaults = {},
    } = options

    // init Model 支持直接传入Model实例（复杂的model请在外面实例好） || 传入defaults配置（简单的model）
    const Model = Backbone.Model.extend({
        defaults,
    })

    model == null && (model = new Model())

    const viewProps = _.extend({}, defaultsProps, view)

    // init View
    const View = Backbone.View.extend({
        // 原则上封禁 事件请在react组件中挂载，但还是允许覆盖使用~
        events: {},

        // 业务props
        ...viewProps,

        // 事件触发器
        dispatch(name, ...rest) {
            if (this[name] && typeof this[name] === 'function') {
                return this[name](...rest)
            }
            console.warn(`can not find method: ${name}`)
        },

        initialize(options = {}) {
            this._options = options

            this.preInit(options)

            // this.el会被兼容上一个空div 为了loading挂载位置正确，所以还是希望能配置el，但不强制。
            // if (!viewProps.el) {
            //     console.warn('not find config.el, so you could see loading, aha~')
            // }

            // console.log('--- mount Model ---');
            this.model = model
            // 当前组件的hash值 ps：需要主动配置hash，且在model中主动记录global.pageParams
            if (viewProps.hash && global && global.pageParams && global.pageParams[viewProps.hash]) {
                this.model.set({
                    ...global.pageParams[viewProps.hash],
                })
                // 数据仅支持一次回填，用完就清除
                delete global.pageParams[viewProps.hash]
            }
            // console.log('--- load data start ---');

            // show loading 会在render中自动被清除
            this.el.innerHTML = '<p style="padding: 10px">数据加载中，请稍等~</p>'

            // 提供数据请求的钩子load（自定义的load请返回Array）
            const loadingData = this.load()
            if (!loadingData || !(loadingData instanceof Array)) {
                console.error('the method load return must be Array~')
                return
            }

            Promise.all(loadingData)
                .then(rst => {
                    let state = {}
                    // 请注意相同key的覆盖问题 init不支持多次set
                    rst.forEach(item => (state = {
                        ...state,
                        ...item,
                    }))

                    // console.log('--- load data end ---');

                    this.model.set({
                        ...state,
                    })

                    // 允许业务上做一次统一的数据处理，自行操作model
                    this.prepare()

                    // 强制关联model和view
                    this.listenTo(this.model, 'change', this.render)

                    // console.log('--- view render start ---');
                    // 手动触发一次view.render
                    this.render()
                    // console.log('--- view render end ---');

                    // view完成第一次render，可在此钩子做定制key的change监听和组件通信
                    this.initBehavior()
                }, e => {
                    // fail
                    console.error(`load fail: ${e}`)
                })
        },

        render() {
            // 每次render都会调用的业务钩子
            this.preRender()

            const childProps = {
                ...this.model.toJSON(),
                // 唯一的事件触发入口 手动绑定保证下this
                dispatch: this.dispatch.bind(this),
            }

            const Component = this.Component

            render(
                <LocaleProvider locale={zh_CN}><Component {...childProps} /></LocaleProvider>,
                this.el,
            )
        },

        // @override
        // 不销毁el，仅清空，保留容器，监听事件的销毁沿用Backbone原生。
        remove() {
            // this.el.innerHTML = ''
            unmountComponentAtNode(this.el)
            this.stopListening()
            model = new Model() // 由于携带defaults 所以选择不销毁，而是重置
        },
    })

    return View
}

export { ComponentGenerator }
