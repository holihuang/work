/**
 * @file app后台 Abstract Edit
 *
 * 1.list 层级与位置对应
 * 2.目前支持 Select Input DatePicke NumberRange Number Button 自定义 / 不支持Radio Checkbox Mutilselect
 *
 * @author gushouchuang
 * @date 2018-2-23
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import factory from 'common/reactComponent/factory/index'
import validate from 'common/core/validations'

const TYPE_LIST = ['Select', 'Input', 'DatePicke', 'NumberRange', 'Number', 'Button', 'Diy', 'Textarea']

class Edit extends Component {
    constructor(...args) {
        super(...args)

        this.state = {}
        this.initState()
        this._stateKey = 'edit'

        this.creatFieldFactory = this.creatFieldFactory.bind(this)
    }

    initState() {
        const edit = {}
        // 存储field onchange后的校验错误提示，外层model中维护一个submitError，针对保存后的校验错误集
        const changeError = {}
        const submitError = {}
        // 引入注入数据
        const { injection, list } = this.props

        // 请自觉保持数组嵌套格式
        list.forEach(row => {
            row.forEach(item => {
                edit[item.field] = typeof item.defaultValue === 'undefined'
                    ? ''
                    : item.defaultValue

                // 优先读取injection中的数据进行覆盖（针对edit状态）
                if (injection[item.field] || injection[item.field] === 0) {
                    edit[item.field] = injection[item.field]
                }

                if (item.type === 'NumberRange') {
                    edit[item.field] = {
                        max: item.defaultValue ? item.defaultValue.max : undefined,
                        min: item.defaultValue ? item.defaultValue.min : undefined,
                    }
                }
                else if (item.type === 'DiySelect') {
                    edit[item.field] = []
                }

                changeError[item.field] = ''
            })
        })

        this.state = {
            ...this.state,
            edit,
            changeError,
            submitError,
        }
    }

    creatFieldFactory () {
        // 支持list的多层数组嵌套
        const edit = []
        const { labelWidth, list } = this.props

        list.map((row, index) => {
            // 同一层级的结构
            let list = []

            row.forEach((item, fIndex) => {
                if (!item.type || TYPE_LIST.indexOf(item.type) === -1) {
                    console.error(`miss item.type or not support this type: ${item.type}`)
                    alert('看console.error')
                } else {
                    const itemProps = {
                        key: `edit-field-${index}-${fIndex}`,
                        style: {
                            width: item.width,
                            // float: 'left',
                            marginRight: '15px',
                            padding: '10px 0',
                        }
                    }

                    const error = this.state.submitError[item.field]
                        || this.state.changeError[item.field]

                    list.push(
                        <div {...itemProps}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                {
                                    item.label
                                        ? <span style={{
                                            paddingRight: '8px',
                                            display: 'inline-block',
                                            // 允许自定义一个field特殊的宽度
                                            width: (item.labelWidth || labelWidth) + 'px',
                                            textAlign: 'right',
                                        }}>
                                        {
                                            item.required
                                                ? <span style={{
                                                    color: 'red',
                                                    paddingRight: '3px',
                                                }}>*</span>
                                                : null
                                        }
                                            {item.label}:
                                        </span>
                                        : null
                                }
                                {factory[`get${item.type}`](item, this)}
                                <span style={{
                                    paddingLeft: '5px',
                                    color: '#666',
                                }}>{item.tips}</span>
                            </div>
                            <p style={{
                                color: 'red',
                                paddingLeft: (item.labelWidth || labelWidth) + 'px',
                                lineHeight: '24px',
                            }}>{error}</p>
                        </div>
                    )
                }
            })

            const rowKey = `edit-row-${index}`

            edit.push(
                <div key={rowKey} style={{
                    clear: 'both',
                    minHeight: '38px',
                }}>
                    {list}
                </div>
            )
        })
        return edit
    }
    // 提交的校验规则
    submitValidate(edit) {
        const changeError = this.state.changeError
        const submitError = this.state.submitError
        let rst = true

        // 如果现在changeError中存在错误提示，仍需要再走submitError的校验，仅标记下rst为false
        if (_.values(changeError).join('').length) {
            rst = false
        }

        this.props.list.forEach(row => {
            row.forEach(item => {
                if (item.required || (item.valid && item.valid.onsubmit && item.valid.onsubmit.length)) {
                    const onsubmit = item.valid ? (item.valid.onsubmit || []) : []
                    const field = item.field
                    const message = []
                    // edit[field]有值，或者校验规则中有isRequired
                    if ((edit[field].trim && edit[field].trim()) || edit[field] || item.required) {
                        // 手动拼接isRequired到校验list
                        if (item.required && !validate.isRequired(edit[field]).rst) {
                            rst = false // 校验未通过
                            message.push(`请完善'${item.label}'信息`)
                        } else {
                            onsubmit.forEach(valid => {
                                let reg = valid.reg
                                // 本身就是正则
                                if (reg.test) {
                                    if (!reg.test(edit[field])) {
                                        message.push(valid.message || '格式错误')
                                        // 校验未通过
                                        rst = false
                                    }
                                } else if (typeof reg === 'function' || validate[reg]) { // valid lib
                                    const validFunc = typeof reg === 'function' ? reg : validate[reg]
                                    // 带第二参数value的 一般都是长度，请注意这里转了数字格式。
                                    const validRst = validFunc(edit[field], +valid.value)
                                    if (!validRst.rst) {
                                        message.push(validRst.message)
                                        rst = false // 校验未通过
                                    }
                                }
                            })
                        }
                        
                    }
                    submitError[field] = message.length ? message.join('; ') : ''
                }
            })

        })
        this.setState(
            submitError
        )

        return rst
    }
    submit() {
        const edit = this.state.edit
        this.props.list.forEach(row => {
            row.forEach(item => {
                // input的value，在抛出去前trim一下；后续如果加了textarea，应该在此也加上配置。
                if (['Input'].indexOf(item.type) > -1) {

                    edit[item.field] = edit[item.field] === undefined ? '' : (edit[item.field] + '').trim()
                }
            })
        })
        // onsubmit校验 每个field支持多个校验规则
        if (this.submitValidate(edit)) {
            this.props.save && this.props.save(edit, this)
        }
    }

    cancel() {
        this.props.cancel && this.props.cancel()
    }

    changeAndDispath(stateChange, source, e) {
        // 外部业务注入
        let injectStateChange = {}
        // 任何的field，都可监听state变更后的通信，有权输出数据到model，从而达到控制edit/filters的props
        source.onChangeCb && (injectStateChange = source.onChangeCb(e) || {})

        stateChange[this._stateKey] = {
            ...stateChange[this._stateKey],
            ...injectStateChange,
        }

        this.setState({
            ...stateChange,
        })
    }
    // 这一段，很不喜欢，都是最初选择state内置选择的路~~
    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.injection, this.props.injection)) {
            const stateChange = {}
            const editState = this.state.edit
            for (const key in nextProps.injection) {
                if (nextProps.injection.hasOwnProperty(key)) {
                    // 老的props与next不一致的key
                    if (!this.props.injection || !_.isEqual(nextProps.injection[key], this.props.injection[key])) {
                        // 如果state.edit中本身不存在该field，坚决不接受。
                        editState[key] !== undefined && (stateChange[key] = nextProps.injection[key])
                    }
                }
            }
            // 将injection变换的字段，更新到state  ps：因为有些injection数据不是在Edit初始化好的时候就都能准备好
            this.setState({
                edit: {
                    ...editState,
                    ...stateChange,
                }
            })
        }
    }

    render() {
        return (
            <div className="app-back-edit"  style={{
                
            }}>
                {this.creatFieldFactory()}
                <div className="edit-btn" style={{
                    padding: '15px 0',
                    clear: 'both',
                    ...this.props.btnStyle
                }}>
                    {
                        factory.getButton({
                            type: 'Button',
                            skin: 'primary',
                            field: 'submit',
                            text: '保存',
                            key: 'filters-field-submit',
                            style: {
                                marginRight: '30px'
                            },
                            onClickCb: () => {
                                this.submit()
                            }
                        })
                    }
                    {
                        this.props.hideCancel || factory.getButton({
                            type: 'Button',
                            field: 'cancel',
                            text: '取消',
                            key: 'filters-field-cancel',
                            onClickCb: () => {
                                this.cancel()
                            }
                        })
                    }
                </div>
            </div>
        )
    }
}

Edit.propTypes = {
    list: PropTypes.array,
    labelWidth: PropTypes.string,
    btnStyle: PropTypes.object,
    injection: PropTypes.object,
    hideCancel: PropTypes.bool,
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func,

}

Edit.defaultProps = {
    list: [],
    labelWidth: '80',
    btnStyle: {}, // 底部按钮的控制
    injection: {}, // edit回填的各种field的default数据
    hideCancel: false, // 默认是不隐藏'取消'按钮的
    save: () => {},
    cancel: () => {},
}

export default Edit

