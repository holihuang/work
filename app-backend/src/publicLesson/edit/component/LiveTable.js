import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

class LiveTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleRadioChecked = e => {
        const { dataSource = [], dispatch } = this.props
        const { index } = e.target.dataset
        const arr = _.cloneDeep(dataSource)
        arr.forEach((item, idx) => {
            if(idx == index) {
                item.checked = true
            } else {
                item.checked = false
            }
        })
        dispatch('liveCourseListRadioChecked', arr)
    }

    renderThead() {
        const { columns = [] } = this.props
        return columns.map((item, index) => {
            return <th style={{background:'#fafafa',color:'rgba(0, 0, 0, 0.85)',borderBottom:'1px solid #e8e8e8',
                      height:'40px',lineHeight:'40px'}}
                   >
                       {item.title}
                   </th>
        })
    }

    renderTbody() {
        const { dataSource = [], name } = this.props
        const rows = [];
        let tr;
        const baseRadioStyle = {
            width:'15px',
            height:'15px',
            borderRadius:'50%',
            border:'1px solid #333',
            margin:'0 auto',
            cursor:'pointer'
        }
        if(dataSource.length) {
            dataSource.forEach((item, index)=>{
                const { checked = false, lessonDate, lessonName='', teacherName, liveProvider, beginTime, endTime  } = item
                const radioStyle = checked ? {...baseRadioStyle, backgroundColor: '#00FF66'} : baseRadioStyle
                tr = <tr key={'tr_' + index} style={{height:'40px',lineHeight:'40px',borderBottom:'1px solid #333'}}>
                        <td>
                            <div style={radioStyle} data-index={index} checked={checked} onClick={this.handleRadioChecked}>
                            </div>
                        </td>
                        <td>{`${lessonDate} ${beginTime}-${endTime}`}</td>
                        <td title={lessonName}>{lessonName.length > 30 ? `${lessonName.slice(0, 30)}...` : lessonName}</td>
                        <td>{teacherName}</td>
                        <td>{liveProvider === 'gensee' ? '展视互动' : '欢拓'}</td>
                     </tr>;
                rows[rows.length] = tr;
            } )
        } else {
            rows[rows.length] = <tr style={{height:'40px',lineHeight:'40px',borderBottom:'1px solid #333'}}>{'无查询结果！'}</tr>
        }
        return rows;
    }

    render() {

        const { columns, dataSource } = this.props
        return (
            <table style={{width:'100%',borderRadius:'4px 4px 0 0',overFlow:'hidden',borderCollapse: 'separate',borderSpacing: 0,
                textAlign:'center'}}
            >
                <thead>
                    <tr>
                        {this.renderThead()}
                    </tr>
                </thead>
                <tbody>
                    {this.renderTbody()}
                </tbody>
            </table>
        )
    }
}

LiveTable.propTypes = {
    dataSource: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    pagination: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
}

export default LiveTable
