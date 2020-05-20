/*
* @file: component
* @author: gushouchuang
* @date: 2019-12-09
* */
import React from 'react'
import PropTypes from 'prop-types'
import { Select, DatePicker } from 'antd'
import moment from 'moment'

const { Option } = Select

class SendTime extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    changeType(e) {
        this.props.changeState({
            time: '',
            type: e,
        })
    }

    changeTime(e, time) {
        const { editComponent } = this.props
        this.props.changeState({
            ...editComponent.state.effectTime,
            time,
        })
    }

    render() {
        const { props } = this
        const { editComponent } = props
        const { effectTime = {} } = editComponent.state

        const timeProps = {
            value: effectTime.type || undefined,
            placeholder: '请选择',
            style: {
                width: '100%',
            },
            onChange: e => {
                this.changeType(e)
            },
        }

        return (
            <div style={{ width: '100%' }}>
                <div style={{
                    display: 'inline-block',
                    width: '200px',
                }}
                >
                    <Select {...timeProps}>
                        <Option value="NEW">暂存</Option>
                        <Option value="ONLINE">立即上线</Option>
                        <Option value="FIXED_TIME">定时上线</Option>
                    </Select>
                </div>
                <div style={{
                    display: editComponent.state.effectTime.type === 'FIXED_TIME' ? 'inline-block' : 'none',
                    width: '200px',
                    marginLeft: '15px',
                }}
                >
                    <DatePicker
                        value={effectTime.time ? moment(effectTime.time) : undefined}
                        showTime={true}
                        format="YYYY/MM/DD HH:mm"
                        onChange={this.changeTime.bind(this)}
                        placeholder="请选择时间"
                    />
                </div>
            </div>
        )
    }
}


SendTime.propTypes = {
    changeState: PropTypes.func,
    editComponent: PropTypes.isRequired,
}

SendTime.defaultProps = {
    changeState: () => {},
}

export default SendTime
