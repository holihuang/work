import React from 'react'
import PropTypes from 'prop-types'
import { createSelector } from 'reselect'
import { connect } from 'react-redux'
import { Select } from 'antd'

import Constants from '$constants/common'
import { createOptions } from '$common/util'
import css from './index.less'

const { Option } = Select


class SubjectSelector extends React.Component {
    static propTypes = {
        common: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)
        this.props.dispatch({
            type: Constants.GET_COLLEGES,
        })
    }

    selectCollege = collegeId => {
        this.props.dispatch({
            type: Constants.SELECT_COLLEGE,
            payload: { collegeId },
        })
    }

    selectProjectFirst = projectId => {
        this.props.dispatch({
            type: Constants.SELECT_PROJECT_FIRST,
            payload: { projectId },
        })
    }

    selectProjectSecond = proj2ndId => {
        this.props.dispatch({
            type: Constants.UPDATE_STATE,
            payload: { proj2ndId },
        })
    }

    render() {
        const {
            props: {
                common: {
                    collegeList,
                    projectFirstList,
                    projectSecondList,
                    collegeId,
                    projectId,
                    proj2ndId,
                },
            },
            selectCollege,
            selectProjectFirst,
            selectProjectSecond,
        } = this
        return (
            <div className={css.wrap}>
                <Select
                    className={css.selector}
                    placeholder="请选择学院"
                    value={collegeId}
                    showSearch={true}
                    optionFilterProp="children"
                    onSelect={selectCollege}
                    dropdownMatchSelectWidth={false}
                >
                    {
                        collegeList.map(o => <Option key={`${o.id}`} value={o.id}>{o.name}</Option>)
                    }
                </Select>
                <Select
                    className={css.selector}
                    placeholder="请选择一级项目"
                    value={projectId}
                    showSearch={true}
                    optionFilterProp="children"
                    onSelect={selectProjectFirst}
                    dropdownMatchSelectWidth={false}
                    disabled={!projectFirstList.length}
                >
                    {
                        projectFirstList.map(o => <Option key={`${o.id}`} value={o.id}>{o.name}</Option>)
                    }
                </Select>
                <Select
                    className={css.selector}
                    placeholder="请选择二级项目"
                    value={proj2ndId}
                    showSearch={true}
                    optionFilterProp="children"
                    onSelect={selectProjectSecond}
                    dropdownMatchSelectWidth={false}
                    disabled={!projectSecondList.length}
                >
                    {
                        projectSecondList.map(createOptions)
                    }
                </Select>
            </div>
        )
    }
}


export default connect(createSelector(
    state => state.common,
    common => ({ common }),
))(SubjectSelector)
