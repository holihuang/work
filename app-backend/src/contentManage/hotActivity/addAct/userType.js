/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:24 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-09-11 11:29:15
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Form, Icon, Input, Checkbox, Upload, Select, Radio, DatePicker, Row, Col, } from 'antd'
import isArray from 'lodash/isArray'
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment'

import { service } from '../../../common/service'
import { url } from '../../../common/url'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const { Option, OptGroup } = Select
const CheckboxGroup = Checkbox.Group

class UserType extends React.Component {
    constructor(props) {
        super(props)
        const { collegeSelectedList, famlilySelectedList, userType, checkedCorps } = props
        this.state = {
            allCollege: [],
            allCorps: [],
            family: [],
            collegeSelectAll: collegeSelectedList.indexOf('全部') > -1,
            coprsCheckedAll: famlilySelectedList.indexOf('全部') > -1,
            collegeSelectedList: this.checkArray(collegeSelectedList),
            checkedCorps: this.checkArray(checkedCorps),
            famlilySelectedList: this.checkArray(famlilySelectedList),
            userType,
        }
    }

    checkArray(ele) {
        if(ele === '-1' || (isArray(ele) && ele[0] === '-1')) {
            return []
        }
        if(isArray(ele)) {
            return !!ele[0] ? ele : []
        } else {
            return this.checkArray(ele.split(','))
        }
    }

    getData() {
        const { checkedCorps, coprsCheckedAll, } = this.state
        return {
            checkedCorps, coprsCheckedAll,
        }
    }
    
    componentDidMount() {
        this.getAllCollege()
        this.listAllCorps()
    }

    getAllCollege() {
        const { allCollege } = this.state
        if (!allCollege.length) {
            service.getAllCollege({}, (response) => {
                if (response.rs) {
                    this.setState({ allCollege: response.resultMessage })
                } else {
                    alert(response.rsdesp)
                }
            })
        }
    }
    
    //获取所有军团列表
    listAllCorps() {
        const { allCorps } = this.state
        if (!allCorps.length) {
            service.listAllCorps({
                isPage: 0
            }, (response) => {
                if (response.rs) {
                    const allCorps = response.resultMessage.resultList.map(item => item.corpsName)
                    const { checkedCorps } = this.state
                    if(checkedCorps.indexOf('全部') > -1) {
                        this.setState({ 
                            allCorps,
                            coprsCheckedAll: true,
                            checkedCorps: allCorps, 
                        })
                    } else {
                        this.setState({ 
                            allCorps,
                        })
                    }
                    
                }
            })
        }
    }

    onChange = (checkedCorps) => {
        const { allCorps } = this.state
        this.props.form.setFieldsValue({
            juntuan: !!checkedCorps.length,
        })
        this.setState({
            checkedCorps,
            coprsCheckedAll: checkedCorps.length === allCorps.length
        })
    }

    onCheckAllChange = (e) => {
        const { allCorps = [] } = this.state
        this.props.form.setFieldsValue({
            juntuan: e.target.checked,
        })
        this.setState({
            checkedCorps: e.target.checked ? allCorps : [],
            coprsCheckedAll: e.target.checked
        })
    }

    handleUserTypeChange = (e) => {
        this.setState({
            userType: e.target.value
        })
    }

    //学院下拉框选项选中事件
    handleCollegeSelect = e => {
        const { family , collegeSelectedList } = this.state
        let showText = []
        if (e === '全部') {
            showText = ['全部']
        } else {
            showText = [...collegeSelectedList]
            showText.push(e)
        }
        this.props.form.setFieldsValue({
            college: showText.join(','),
        })
        if (e === '全部') {
            this.setState({
                collegeSelectAll: true,
                collegeSelectedList: showText,
            },_ => {
                this.props.form.setFieldsValue({
                    select1: ['全部'],
                })
            })
            return
        }
        service.getSelectedFamilyList({
            schoolName: showText.join(',')
        }, (response) => {
            if (response.rs) {
                this.setState({ family: response.resultMessage })
            }
        })
        this.setState({ collegeSelectedList: showText })
    }

    //学院下拉框选项取消选中事件
    handleCollegeDeselect = e => {
        const { family, collegeSelectedList } = this.state
        let showText = []
        if (e === '全部') {
            showText = []
        } else {
            showText = collegeSelectedList.filter(item => item !== e)
        }
        this.props.form.setFieldsValue({
            college: showText.join(','),
        })
        if (e === '全部') {
            this.setState({
                collegeSelectAll: false,
                collegeSelectedList: showText,
                family: [],
            })
            return
        }
        if(!!showText.length) {
            service.getSelectedFamilyList({
                schoolName: showText.join(',')
            }, (response) => {
                if (response.rs) {
                    this.setState({ family: response.resultMessage })
                }
            })
        } 
        this.setState({ collegeSelectedList: showText, family: !!showText.length ? family : [] })
    }

    handleFamilySelect = e => {
        const { famlilySelectedList, family } = this.state
        let showText = []
        let famlilySelectAll = false
        if (e === '全部') {
            showText = ['全部']
            famlilySelectAll = true
        } else {
            showText = [...famlilySelectedList]
            showText.push(e)
        }
        this.props.form.setFieldsValue({
            family: showText.join(','),
        })

        this.setState({
            famlilySelectedList: showText,
            famlilySelectAll,
        },_ => {
            if (e === '全部') {
                this.props.form.setFieldsValue({
                    select2: ['全部'],
                })
            }
        })
    }

    handleFamilyDeselect = e => {
        const { famlilySelectedList } = this.state
        let showText = []

        if (e === '全部') {
        } else {
            showText = famlilySelectedList.filter(item => item !== e)
        }
        this.props.form.setFieldsValue({
            family: showText.join(','),
        })
        this.setState({
            famlilySelectedList: showText,
            famlilySelectAll: false,
        })
    }

    renderUserTypePanel = _ => {
        const {
            readOnly,
            form: { getFieldDecorator },
            roundIds,
            formItemLayout,
        } = this.props
        const {
            allCollege,
            family,
            allCorps,
            checkedCorps,
            userType,
            coprsCheckedAll,
            collegeSelectAll,
            famlilySelectAll,
            collegeSelectedList,
            famlilySelectedList,
        } = this.state
        let userTypePanel = null
        let collegeOptionList = allCollege.map(item => <Option key={item} value={item} disabled={collegeSelectAll}>{item}</Option>)
        let familyList = []
        !!collegeOptionList.length && collegeOptionList.unshift(<Option key="全部" value="全部">全部</Option>)
        if (collegeSelectAll) {
            familyList.unshift(<Option key="全部" value="全部">全部</Option>)
        } else {
            family.forEach((item, index) => {
                if (item === 'E_O_F') return
                familyList.push(
                    <Option
                        key={item}
                        value={item}
                        style={{ borderBottom: (family.length > index) && family[index + 1] === 'E_O_F' ? '1px solid #ccc' : 'none' }}
                        disabled={famlilySelectAll}>
                        {item}
                    </Option>)
            })
            !!familyList.length && familyList.unshift(<Option value="全部">全部</Option>)
        }
        switch (+userType) {
            case 1:
                break
            case 2:
                userTypePanel = <div>
                    <FormItem
                        {...formItemLayout}
                        label="用户归属"
                    >
                        <Row>
                            <Col span={2}>
                                <span className='ant-form-item-label'>学院</span>
                            </Col>
                            <Col span={9}>
                                {getFieldDecorator('select1', {
                                    rules: [{ required: true, message: '请选择学院！' }],
                                    initialValue: collegeSelectedList
                                })(
                                    <Select
                                        disabled={readOnly}
                                        mode="multiple"
                                        style={{
                                            height: '32px',
                                            position: 'absolute',
                                            zIndex: 1,
                                            overflow: 'hidden',
                                            opacity: 0,
                                        }}
                                        onClick={_ => false}
                                        onSelect={this.handleCollegeSelect}
                                        onDeselect={this.handleCollegeDeselect}
                                    >
                                        {collegeOptionList}
                                    </Select>
                                    )}
                                {getFieldDecorator('college', {
                                    initialValue: collegeSelectedList.join(',')
                                })(
                                    <Input readOnly={readOnly} style={{ position: 'absolute', left: 0 }} placeholder="请选择学院" />
                                    )}
                            </Col>
                            <Col span={3} offset={1}>
                                <span className='ant-form-item-label'>归属家族</span>
                            </Col>
                            <Col span={9}>
                                {getFieldDecorator('select2', {
                                    valuePropName: 'value',
                                    initialValue: famlilySelectedList,
                                    rules: [{ required: true, message: '请选择家族！' }],
                                })(
                                    <Select
                                        disabled={readOnly}
                                        mode="multiple"
                                        style={{
                                            height: '32px',
                                            position: 'absolute',
                                            zIndex: 1,
                                            overflow: 'hidden',
                                            opacity: 0,
                                        }}
                                        onSelect={this.handleFamilySelect}
                                        onDeselect={this.handleFamilyDeselect}
                                    >
                                        {familyList}
                                    </Select>
                                    )}
                                {getFieldDecorator('family', {
                                    initialValue: famlilySelectedList.join(',')
                                })(
                                    <Input readOnly={readOnly} style={{ position: 'absolute', left: 0 }} placeholder="请选择家族" />
                                    )}
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="轮次配置"
                    >
                        {getFieldDecorator('roundIds', {
                            // rules: [{ required: true, message: '请输入轮次id！' }],
                            initialValue: roundIds === '-1' ? '' : roundIds,
                        })(
                            <Input readOnly={readOnly} placeholder="请输入正确的轮次id，多个请以英文逗号隔开" />
                            )}
                    </FormItem>
                </div>
                break
            case 3:
                userTypePanel = <FormItem
                    {...formItemLayout}
                    label="机会归属配置"
                >
                    <div>
                        {/* <div style={{ borderBottom: '1px solid #E9E9E9' }}></div>
                        <br /> */}
                        <Checkbox
                            disabled={readOnly}
                            indeterminate={!!checkedCorps.length && (checkedCorps.length < allCorps.length)}
                            onChange={this.onCheckAllChange}
                            checked={coprsCheckedAll}
                        >
                            全选
                                </Checkbox>
                        <div style={{ height: '250px', overflow: 'auto' }}>
                            <CheckboxGroup disabled={readOnly} options={allCorps} value={checkedCorps} onChange={this.onChange} />
                        </div>
                        {getFieldDecorator('juntuan', {
                            valuePropName: 'checked',
                            initialValue:!!checkedCorps.length,
                            rules: [{ required: true, message: '请选择军团！', type: 'boolean', transform: value => value || '' }],
                        })(
                            <Checkbox
                                style={{ display: 'none' }}
                            >
                            </Checkbox>
                            )}
                    </div>

                </FormItem>
                break
            default:
                break
        }
        return userTypePanel
    }
    
    render() {
        const { readOnly, form: { getFieldDecorator }, formItemLayout } = this.props
        const { userType } = this.state
        return (
            <div>
                <FormItem
                    {...formItemLayout}
                    label="受众类型"
                >
                    {getFieldDecorator('userType', {
                        initialValue: userType,
                        rules: [{ required: true }],
                    })(
                        <RadioGroup disabled={readOnly} onChange={this.handleUserTypeChange}>
                            <Radio value={1}>全部用户</Radio>
                            <Radio value={2}>付费用户</Radio>
                            <Radio value={3}>免费用户</Radio>
                        </RadioGroup>
                        )}
                </FormItem>
                {this.renderUserTypePanel()}
            </div>
        )
    }
}

UserType.propTypes = {
    list: PropTypes.array,
    formItemLayout: PropTypes.object,
    form: PropTypes.object.isRequired,
    addVisible: PropTypes.bool,
    roundIds: PropTypes.string,
    collegeSelectedList: PropTypes.array, 
    famlilySelectedList: PropTypes.array,
    checkedCorps: PropTypes.array,
    UserType: PropTypes.number,
    readOnly: PropTypes.bool,
}

UserType.defaultProps = {
    formItemLayout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
    },
    addVisible: false,
    roundIds: '',
    collegeSelectedList: [], 
    famlilySelectedList: [], 
    checkedCorps:[],
    UserType: 1,
    readOnly: false,
}

export default UserType
