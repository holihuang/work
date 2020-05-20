import React from 'react'
import ReactDom from 'react-dom'

let self

function dispatch(...args) {
    const [key, params = {}] = args
    if (!key) {
        console.error('缺少要dispatch的函数名')
        return
    }
    if (!self[key]) {
        console.error('backbone组件缺少要dispatch的函数')
        return
    }
    self[key](params)
}

export default function (...args) {
    const [that, target = [], opt = {}] = args
    const { keyArr, parent } = opt
    self = that
    const data = {}
    keyArr.forEach(item => {
        data[item] = that.model.get(item)
    })
    target.map(item => {
        const { id, component: Component } = item
        const pointer = parent || that
        const [root] = pointer.$el.find(`#${id}`)
        const props = {
            dispatch,
            ...data,
        }
        return (
            ReactDom.render(
                <Component {...props} />,
                root,
            )
        )
    })
}
