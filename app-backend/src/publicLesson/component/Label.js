/**
 * @file app后台 Label 组件
 *
 * @author gushouchuang
 * @date 2018-1-10
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import { Modal, Button, Pagination } from 'antd'

import service from '../service'
import cfg from '../cfg'

const PAGE_SIZE = 24

class Label extends Component {
    constructor(...args) {
        super(...args)

        const selected = this.props.selected.map(item => {
            return item.value
        })

        this.state = {
            // 允许数据回填，但数据在内部维护
            selected,
            list: [],
            pageNo: 1
        }

        this.creatListFactory = this.creatListFactory.bind(this)
        this.selectMark = this.selectMark.bind(this)
        this.getSelectItems = this.getSelectItems.bind(this)
    }

    selectMark(id) {
        let selected = [...this.state.selected]

            if (selected.indexOf(id) > -1) {
                selected = _.without(selected, id)
            } else {
                if (this.props.max > selected.length) {
                    selected.push(id)
                } else {
                    alert(`最多选择${this.props.max}个`)
                }
            }

            this.setState({
                selected
            })
    }

    getSelectItems() {
        const { selected, list } = this.state
        const rst = []

        list.map(item => {
            if(selected.indexOf(item.id) > -1 ) {
                rst.push({
                    value: item.id,
                    label: item.label
                })
            }
        })

        return rst
    }

    submit() {
        this.props.cbValue(this.getSelectItems())
    }

    creatListFactory() {
        const dom = []
        const selected = this.state.selected

        const showList = this.state.list.slice((this.state.pageNo - 1) * PAGE_SIZE, this.state.pageNo * PAGE_SIZE)
        showList.forEach(item => {
            let btnProps = {
                key: `label-${item.id}`,
                value: item.id,
                style: {
                    width: 110,
                    display: 'inline-block',
                    margin: '5px',
                    textAlign: 'center',
                    lineHeight: '26px',
                    cursor: 'pointer',
                    border: '1px solid #d9d9d9'
                },
                onClick: e => {
                    this.selectMark(item.id)
                }
            }

            if (selected.indexOf(item.id) > -1) {
                btnProps.style.border = '1px solid orange'
            }

            dom.push(
                <div {...btnProps} >
                    {item.label}
                </div>
            )
        })

        return dom
    }

    componentDidMount() {
        // get list source
        service.getLabelList({}).then(response => {
            this.setState({
                list: response.map(item => {
                    return {
                        label: item.labelName,
                        id: item.id,
                    }
                })
            })
        })
    }
    

    render() {
        const modalProps = {
            title: '标签',
            visible: true,
            footer: null,
            onCancel: () => {
                this.props.changeState({
                    labelNamerender: false
                })
            }
        }

        const pageProps = {
            defaultCurrent: 1,
            total: this.state.list.length,
            pageSize: PAGE_SIZE,
            onChange: (pageNo, pageSize) => {
                this.setState({
                    pageNo
                })
            }
        }

        const submitProps = {
            type: 'primary',
            onClick: () => {
                this.submit()
            }
        }

        return (
            <div className="app-back-label"  style={{
            }}>
                <Modal {...modalProps}>
                    {this.creatListFactory()}
                    {
                        this.state.list.length
                        ? <div style={{
                            textAlign: 'right',
                            padding: '10px 0'
                        }}>
                            <Pagination {...pageProps} / >
                        </div>
                        : null
                    }
                    <div style={{
                        textAlign: 'center',
                        padding: '15px 0 5px'
                    }}>
                        <Button {...submitProps}>确定</Button>
                    </div>
                </Modal>
            </div>
        )
    }
}

Label.propTypes = {
    selected: PropTypes.array,
    max: PropTypes.number,
    changeState: PropTypes.func, // required
    cbValue: PropTypes.func, // required
}

Label.defaultProps = {
    selected: [],
    max: 3,
    cbValue: () => {},
    changeState: () => {},
}

export default Label

