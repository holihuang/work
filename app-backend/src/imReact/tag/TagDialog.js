/*
* @file: 打标签
* @author: huanghaolei
* @date: 2018-06-15
*
* */
import React from 'react'
import { Modal, Button, Table, message } from 'antd'

import service from './service'

class TagDialog extends React.Component {
    constructor(props) {
        super(props)
        const { userName = '', label = '', isShowTagDialog = false } = props
        this.state = {
            pageNo: 1,
            pageSize: 10,
            isShowTagDialog: isShowTagDialog,
            userInfoObj: {
                '学员姓名': userName,
                '已有标签': [...label],
                '系统标签': [],
                '学院标签': [],
                '小组标签': [],
            },
            recordTable: [],
        }
    }

    pickOutChoseCollegeGroupTags = (opt = {}) => {
        const { hadTags = [], college = [], group = [] } = opt
        if(hadTags.length) {
            hadTags.forEach((item, index) => {
                college.forEach((itm, idx) => {
                    if(+item.id === +itm.id) {
                        itm.unClickable = true
                    }
                })

                group.forEach((itm, idx) => {
                    if(+item.id === +itm.id) {
                        itm.unClickable = true
                    }
                })
            })
        }
        return { college, group }
    }

    componentDidMount() {
        const { schoolId, orderDetailId } = this.props
        const { userInfoObj } = this.state

        const params = {
            schoolId,
            userAccount: window.userInfo.userAccount
        }

        //学院|小组|系统标签
        service.getOrderDetailTagListByBelongId(params).then((response) => {
            const { college, group, company } = response
            const collegeGroupObj = this.pickOutChoseCollegeGroupTags({hadTags: userInfoObj['已有标签'], college, group})
            this.setState({
                userInfoObj: { ...userInfoObj, '学院标签': collegeGroupObj.college, '小组标签': collegeGroupObj.group, '系统标签': company }
            })

        }).catch(e => {
            message.info(e)
        })

        //查询操作记录
        this.queryRecordList()

        // 客诉老师不显示'小组标签'
        if(window.userInfo.userRole.includes('SCH_AFTERSALETEACHER')) {
            $('#edit_label_tag_4').remove()
        }
    }

    queryRecordList = (opt = {}) => {
        const { orderDetailId } = this.props
        const { pageNo = 1, pageSize = 10 } = opt
        const params = {
            orderDetailId,
            pageNo,
            pageSize,
        }
        service.getOrderDetailTagListByOrdDetailId(params).then(response => {
            const { resultList, pageIndex, countPerPage, totalCount } =  response
            this.setState({ recordTable: resultList, pageNo: pageIndex, pageSize: countPerPage, totalCount })
        }).catch(e => {
            message.info(e)
        })
    }

    //关闭弹窗时，清掉包含弹窗组件的父级节点（根div）以内的子元素
    emptyRootDiv = () => {
        const { dispatch } = this.props
        dispatch('emptyRootDiv')
    }

    pickOutChoseTagIds = () => {
        const { userInfoObj } = this.state
        const tagIds = []
        const labels = []
        if(userInfoObj['已有标签'].length) {
            userInfoObj['已有标签'].forEach(item => {
                tagIds.push(item.id)
                labels.push(item.tagName)
            })
        }
        return { tagIds, labels }
    }

    handleSave = () => {
        const { dispatch, orderDetailId, schoolId } = this.props
        const { tagIds, labels } = this.pickOutChoseTagIds()
        //保存API
        const params = {
            orderDetailId,
            schoolId,
            tagIds,
            operator: window.userInfo.userAccount
        }
        service.saveOrderDetailTag(params).then(response => {
            message.success('保存成功！')
            //选中标签刷新父级'学员信息'Tab
            dispatch('refreshStudentInfoTab')
        }).catch( e => {
            message.info(e)
        })

        this.emptyRootDiv()
        this.setState({ isShowTagDialog: false })
    }

    handleCancel = () => {
        this.emptyRootDiv()
        this.setState({ isShowTagDialog: false })
    }

    //删除点击的已有标签
    handleRemove = e => {
        const { id, field } = e.currentTarget.dataset
        const { userInfoObj } = this.state
        const obj = { ...userInfoObj }
        obj[field] = obj[field].filter(item => +item.id !== +id)

        // 学院
        const college = this.removeUnclickableFlag(obj, '学院标签', id)
        // 小组
        const group = this.removeUnclickableFlag(obj, '小组标签', id)

        this.setState({
            userInfoObj: { ...obj, '学院标签': college, '小组标签': group }
        })
    }

    // 取消点击"已有标签"的对应的学院|小组标签的unClickable标志位
    removeUnclickableFlag = (obj, field, id) => {
        obj[field].forEach(item => {
            if(+item.id === +id) {
                item.unClickable = false
            }
        })
        return [...obj[field]]
    }


    handleBtnClick = e => {
        const { userInfoObj } = this.state
        const userInfoObjTempt = { ...userInfoObj }
        const { field, id } = e.currentTarget.dataset
        if((field === '已有标签') || (field === '系统标签')) {
            return
        }
        const addOpt = userInfoObjTempt[field].filter(item => +item.id === +id)[0]
        let isInArr = false
        userInfoObjTempt['已有标签'].forEach(item => {
            if(+item.id === +id) {
                isInArr = true
            }
        })
        //相同标签只能存一次,最多支持20个标签
        if(!isInArr) {
            if(userInfoObjTempt['已有标签'].length === 20) {
                message.warning('最多支持20个标签')
                return
            }
            userInfoObjTempt['已有标签'].push(addOpt)
            this.pickOutChoseCollegeGroupTags({ hadTags: userInfoObjTempt['已有标签'], college: userInfoObjTempt['学院标签'], group: userInfoObjTempt['小组标签'] })
            this.setState({userInfoObj: { ...userInfoObjTempt }})
        }
    }

    handlePageNoChange = (page, pageSize) => {
        this.queryRecordList({ pageNo: +page, pageSize: +pageSize })
        this.setState({ pageNo: +page, pageSize: +pageSize })
    }

    handlePageSizeChange = (current, size) => {
        this.queryRecordList({ pageNo: current, pageSize: +size })
        this.setState({ pageNo: current, pageSize: +size })
    }

    renderTag = () => {
        const { userInfoObj } = this.state
        const wrapper = {
            width: '100%',
            margin: '10px auto',
            minHeight: '38px',
        }
        const tagName = {
            float: 'left',
            width: '60px',
        }

        const tagTxt = {
            marginLeft: '60px',
        }

        const btnWrapper = {
            display: 'inline-block',
            margin: '5px 10px',
            position: 'relative',
        }

        let btnProps = {

        }

        const deleteIconStyle = {
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            backgroundColor: 'red',
            position: 'absolute',
            top: '-7.5px',
            right: '-7.5px',
            cursor: 'pointer',
        }

        const whiteRodStyle = {
            width: '10px',
            height: '4px',
            margin: '5.5px 2.5px',
            backgroundColor: '#fff'
        }
        return Object.keys(userInfoObj).map((item, index) => {
            Object.assign(btnProps, { type: '', disabled: false })
            if(item === '已有标签') {
                Object.assign(btnProps, { type: 'primary' })
            } else if(item === '小组标签') {
                //班主任可选择, 值班老师不可选择
                // if(window.userInfo.userRole.includes('SCH_DUTYTEACHER')) {
                //     Object.assign(btnProps, { disabled: true })
                // }
            } else if(item === '系统标签') {
                Object.assign(btnProps, { disabled: true })
            }
            return (
                <div style={wrapper} id={`edit_label_tag_${index}`}>
                    <div style={tagName}>{`${item}:`}</div>
                    <div style={tagTxt}>{
                        userInfoObj[item] instanceof Array ? (
                            userInfoObj[item].map(itm => {
                                if(item === '学院标签'|| item === '小组标签') {
                                    if(!!itm.unClickable) {
                                        btnProps = { ...btnProps, type: 'danger' }
                                    } else {
                                        btnProps = { ...btnProps, type: 'default' }
                                    }
                                }

                                return (
                                    <div style={btnWrapper} onClick={this.handleBtnClick} data-id={itm.id} data-field={item}>
                                        <Button {...btnProps}>{itm.tagName}</Button>
                                        {
                                            (item === '已有标签') ? (
                                                <div style={deleteIconStyle} data-id={itm.id} data-field={item} onClick={this.handleRemove}>
                                                    <div style={whiteRodStyle}></div>
                                                </div>
                                            ) : null
                                        }
                                    </div>
                                )
                            })
                        ) : userInfoObj[item]
                    }</div>
                </div>
            )
        })
    }

    render() {
        const { isShowTagDialog, recordTable, pageNo, pageSize, totalCount } = this.state
        const tagModalProps = {
            visible: isShowTagDialog,
            width: '800px',
            title: '编辑标签',
            footer: null,
            //onOk: this.handleOk.bind(this),
            onCancel: this.handleCancel.bind(this),
        }

        const wrapper = {
            width: '100%',
            margin: '20px auto',
        }

        const saveBtnProps = {
            type: 'primary',
        }
        const tableProps = {
            columns: [{
                title: '操作时间',
                dataIndex: 'operateTime',
                key: 'operateTime',
            }, {
                title: '操作人',
                dataIndex: 'operator',
                key: 'operator',
            }, {
                title: '来源',
                dataIndex: 'channel',
                key: 'channel',
            }, {
                title: '操作记录',
                dataIndex: 'operateDetail',
                key: 'operateDetail',
            }],
            dataSource: recordTable,
            pagination: {
                total: totalCount,
                pageSize: pageSize,
                showSizeChanger: true,
                onChange: this.handlePageNoChange,
                onShowSizeChange: this.handlePageSizeChange,
            },
        }

        return (
            <div style={{ width: '100%' }}>
                <Modal {...tagModalProps}>
                    {
                        this.renderTag()
                    }
                    <div style={wrapper}>
                        <div style={{ display: 'inline-block' }}>操作记录</div>
                        <div style={{ display: 'inline-block', float: 'right' }}>
                            <div style={{ display: 'inline-block', marginRight: '10px' }} onClick={this.handleSave}>
                                <Button {...saveBtnProps}>保存</Button>
                            </div>
                            <div style={{ display: 'inline-block' }} onClick={this.handleCancel}>
                                <Button>取消</Button>
                            </div>
                        </div>
                    </div>
                    <div style={wrapper}>
                        <Table {...tableProps} />
                    </div>
                </Modal>
            </div>
        )
    }
}

export default TagDialog
