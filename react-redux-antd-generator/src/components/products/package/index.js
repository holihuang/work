/**
 * @description 产品包管理
 */
import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { Button, Input, Pagination, Select, Table, Modal, Checkbox } from 'antd'
import noop from 'lodash/noop'

import Constants from '$constants/product-package'
import { createOptions } from '$common/util'
import TextButton from '../../common/text-button/'
import SubjectSelector from '../../common/subject-selector/'
import css from './index.less'

const { Fragment } = React

class Packages extends React.Component {
    static propTypes = {
        data: PropTypes.object.isRequired,
        common: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)
        this.columns = [
            {
                dataIndex: 'id',
                title: '序号',
            },
            {
                dataIndex: 'name',
                title: '产品名称',
                render(val) {
                    return <div className="w200" title={val}>{val}</div>
                },
            },
            {
                dataIndex: 'type',
                title: '类型',
            },
            {
                dataIndex: 'price',
                title: '价格（元）',
            },
            {
                dataIndex: 'floorPrice',
                title: '最低价格（元）',
            },
            {
                dataIndex: 'moduleNum',
                title: '模块',
            },
            {
                dataIndex: 'datumNum',
                title: '教材教辅',
            },
            {
                dataIndex: 'videoNum',
                title: '录播',
            },
            {
                dataIndex: 'textBookNum',
                title: '资料包',
            },
            {
                dataIndex: 'serviceNum',
                title: '题库',
            },
            {
                dataIndex: 'protocolNum',
                title: '类别',
            },
            {
                dataIndex: 'isInsurance',
                title: '带保险',
            },
            {
                dataIndex: 'statusCode',
                title: '状态',
            },
            {
                dataIndex: 'id',
                key: 'operation',
                title: '操作',
                width: 200,
                render: val => (
                    <Fragment>
                        <TextButton
                            onClick={() => {
                                this.offTable(val)
                            }}
                        >
                            下架
                        </TextButton>
                        &nbsp;|&nbsp;
                        <TextButton>分配家族</TextButton>
                        &nbsp;|&nbsp;
                        <TextButton>复制产品</TextButton>
                    </Fragment>
                ),
            },
        ]
    }

    offTable(val) {
        Modal.confirm({
            title: '你是否要下架该产品？',
            content: '你是否要下架该产品？',
            onOk: () => {
                this.props.dispatch({
                    type: Constants.UPDATE_PACKAGE_STATUS,
                    payload: {
                        packageId: val,
                        statusCode: Constants.OFFTABLE_STATUS_CODE,
                    },
                })
            },
            onCancel: noop,
        })
    }

    updateSearchPackName = e => {
        this.props.dispatch({
            type: Constants.UPDATE_STATE,
            payload: {
                searchPackName: e.target.value,
            },
        })
    }

    updateHasSupplement = hasSupplement => {
        this.props.dispatch({
            type: Constants.UPDATE_PRODPACKAGE,
            payload: {
                hasSupplement,
            },
        })
    }

    updateIsInsurance = isInsurance => {
        this.props.dispatch({
            type: Constants.UPDATE_PRODPACKAGE,
            payload: {
                isInsurance,
            },
        })
    }

    updateStatusCode = e => {
        this.props.dispatch({
            type: Constants.UPDATE_PRODPACKAGE,
            payload: {
                statusCode: e.target.checked ? Constants.OFFTABLE_STATUS_CODE : '',
            },
        })
    }

    doReset = () => {
        this.props.dispatch({
            type: Constants.RESET,
        })
    }

    newSearch = () => {
        this.props.dispatch({
            type: Constants.DO_SEARCH,
            payload: {
                pageNum: 1,
            },
        })
    }

    paging = (pageNum, pageSize) => {
        this.props.dispatch({
            type: Constants.DO_SEARCH,
            payload: {
                pageNum,
                pageSize,
            },
        })
    }

    render() {
        const {
            columns,
            updateSearchPackName,
            updateHasSupplement,
            updateIsInsurance,
            updateStatusCode,
            doReset,
            newSearch,
            paging,
            props: {
                data: {
                    searchPackName,
                    prodPackage: {
                        isInsurance,
                        hasSupplement,
                        statusCode,
                    },
                    packageList,
                    pageNum,
                    total,
                    pageSize,
                },
                common: {
                    proj2ndId,
                },
                common,
            },
        } = this

        const { insuranceTypes, packageCategories, OFFTABLE_STATUS_CODE } = Constants

        return (
            <div className={css.wrap}>
                <div className="shallow_box mb20 p20">
                    <SubjectSelector />
                </div>
                {
                    proj2ndId && (
                        <Fragment>
                            <div className={cn(['common-box', 'p20', css.filter])}>
                                <Input
                                    placeholder="请输入产品名称/编号"
                                    className="mr20 w200"
                                    value={searchPackName}
                                    onChange={updateSearchPackName}
                                />

                                <Select
                                    placeholder="请选择类别"
                                    className="mr20 w200"
                                    value={hasSupplement}
                                    onSelect={updateHasSupplement}
                                >
                                    {packageCategories.map(createOptions)}
                                </Select>

                                <Select
                                    placeholder="是否带保险"
                                    className="mr20 w200"
                                    value={isInsurance}
                                    onSelect={updateIsInsurance}
                                >
                                    {insuranceTypes.map(createOptions)}
                                </Select>

                                <Checkbox
                                    checked={statusCode === OFFTABLE_STATUS_CODE}
                                    onChange={updateStatusCode}
                                >
                                    查看下架产品
                                </Checkbox>

                                <Button className="mr20" onClick={doReset}>重置</Button>
                                <Button type="primary" onClick={newSearch}>搜索</Button>
                            </div>
                            <div className={cn(['common-box', 'p20'])}>
                                <Table
                                    columns={columns}
                                    dataSource={packageList}
                                    pagination={false}
                                    rowKey="id"
                                />

                                <div className={css.pagination}>
                                    <Pagination
                                        current={pageNum}
                                        pageSize={pageSize}
                                        total={total}
                                        showTotal={t => `共 ${t} 条`}
                                        onChange={paging}
                                    />
                                </div>
                            </div>
                        </Fragment>
                    )
                }
            </div>
        )
    }
}


export default Packages
