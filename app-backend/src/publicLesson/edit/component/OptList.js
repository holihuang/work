/**
* @file 公开课 新增|更新 列表选择项
* @author huanghaolei
* @date 2018-01-12
* */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Pagination } from 'antd'

import LiveTable from './LiveTable'
import Filters from '../../../common/reactComponent/Filters'

const COUNT_PER_PAGE = 30
class OptList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPage: 1,
        }
    }

    renderDom() {
          const { name, dispatch, dataSource=[], columns, submitChoseLiveCourse, submitChoseTag } = this.props
          const { currentPage } = this.state
          const filterProps = {
              list: [
                  [{
                      type: 'DatePicke',
                      field: 'lessonDate',
                      label: '开课日期',
                      width: '210',
                      disabledDate: current => {
                          return current && current.valueOf() < Date.now() - 24 * 60 * 60 * 1000
                      },
                  }, {
                      type: 'Input',
                      field: 'lessonName',
                      label: '课程名称',
                      width: '180',
                  }, {
                      type: 'Input',
                      field: 'teacherName',
                      label: '讲师姓名',
                      width: '180',
                  }]
              ],
              query: filters => {
                  dispatch('query', filters)
              }
          }
          const tableProps = {
              dataSource,
              columns,
              pagination: false,
              name,
              dispatch,
          }
          const courseTagProps = {
              currentPage,
              COUNT_PER_PAGE,
              dispatch,
          }

          const isSubmitDisabled = !dataSource.filter(item => item.checked).length

          if(name == 'liveCourse') {
                return(
                    <div>
                        <Filters {...filterProps} />
                        <div style={{padding: '10px 35px 0'}}>至多显示满足查询条件且已配置直播间的10门课程</div>
                        <div style={{padding: '10px 35px'}}>
                            <LiveTable {...tableProps} />
                        </div>
                        <Button type="primary" disabled={isSubmitDisabled} onClick={submitChoseLiveCourse}
                                style={{ marginTop: '20px', left: '50%', transform: 'translateX(-50%)' }}
                        >
                            确定
                        </Button>
                    </div>
                )
          }
    }

    render() {
        const { name } = this.props
        return (
            <div>{this.renderDom()}</div>
        )
    }
}

OptList.propTypes = {
    name: PropTypes.string,
    dataSource: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    submitChoseLiveCourse: PropTypes.func,
    dispatch: PropTypes.func.isRequired,
}

export default OptList

