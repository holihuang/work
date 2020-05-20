/*
* @file: PopUp 小浮窗
* @author: huanghaolei
* @date: 2018-09-18
* */
import React from 'react'
import { Popover } from 'antd'

class PopUp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    generateListInShort = () => {
        const { list = [] } = this.props
        if (!list.length) {
            return null
        }
        const identityLabelProps = {
            style: {
                border: '1px solid rgb(201, 207, 216)',
                marginBottom: '5px',
                borderRadius: '5px',
                cursor: 'pointer',
                backgroundColor: 'rgb(243, 246, 251)',
            },
            onMouseEnter: (e) => {

            },
            onMouseLeave: () => {

            },
        }
        return list.slice(0, 2).map(item => <div { ...identityLabelProps }>{item}</div>)
    }

    generateListInAll = () => {
        const { list = [] } = this.props
        if (!list.length) {
            return null
        }
        const labelStyle = {
            position: 'relative',
            display: 'inline-block',
            border: '1px solid rgb(201, 207, 216)',
            margin: '10px 5px',
            borderRadius: '5px',
            cursor: 'pointer',
            backgroundColor: 'rgb(243, 246, 251)',
        }
        return list.map(item => {
            return <div style={labelStyle}>{item}</div>
        })
    }

    render() {

        const content = this.generateListInAll()
        const popOverProps = {
            title: null,
            trigger: 'hover',
            content,
            placement: 'left',
            overlayStyle: {
                width: '200px',
            }
        }

        return (
            <div style={{ position: 'relative' }}>
                <Popover { ...popOverProps }>
                    { this.generateListInShort() }
                </Popover>
            </div>
        )
    }
}

export default PopUp
