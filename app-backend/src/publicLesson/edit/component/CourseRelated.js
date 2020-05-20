/**
* @file 公开课|课程相关项组件
* @author huanghaolei
* @data 2018-01-11
*
* */

import React from 'react'
import PropTypes from 'prop-types'
import { Button, Input, Radio, Select, Upload, Icon, Modal } from 'antd'

import Label from '../../component/Label'
import service from '../../service'

import samplePic from '../../../images/samplePic.png'

import OptList from './OptList'
import Upload1 from './Upload1'
import Upload2 from './Upload2'
import RadioList from './RadioList'
import SamplePic from './SamplePic'
import SelectComponent from './SelectComponent'

class CourseRelated extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            labelNamerender: false,
            previewVisible: false,
            previewImage: '',

        }
    }

    handleTxtAreaChange = e => {
        const { dispatch } = this.props
        const { upperlimitwordnumber } = e.target.dataset
        const name = e.target.name
        const value = e.target.value
        if(value.length > +upperlimitwordnumber) {
            alert(`${name}不超过${upperlimitwordnumber}个字符`)
            return
        }
        dispatch('handleTxtAreaValue', { name, value, })
    }

    handleIptChange = e => {
        const { dispatch } = this.props
        const { upperlimitwordnumber } = e.target.dataset
        const val = e.target.value.trim()
        const label = e.target.name
        const params =  {
            label,
            val,
        }
        if(val.length > +upperlimitwordnumber) {
            alert(`${label}不超过${upperlimitwordnumber}个字符`)
            return
        }
        dispatch('changeIptVal', params)
    }

    //reDisplayChoseTag(courseTagName) {
    //    const list = []
    //    courseTagName.forEach((item, index) => {
    //        list.push(item.label)
    //    })
    //    return list.join(',')
    //}

    showTagDialog = e=> {
        this.setState({
            labelNamerender: true
        })
    }
    showOptListDialog = e => {
        const { dispatch } = this.props
        //获取标签列表
        const name = e.target.name
        if(name == 'courseTag') {
            dispatch('getCourseTag', {})
        }
        this.setState({ optListDialogVisible: true, optListDialogName: e.target.name })
    }
    hideOptListDialog = e => {
        this.setState({ optListDialogVisible: false })
    }
    // 选择直播课程
    submitChoseLiveCourse = e => {
        this.setState({ optListDialogVisible: false })
        const { dispatch, dataSource = [] } = this.props
        const [{ lessonName, lessonDate, beginTime, endTime, teacherName, liveProvider, liveWebcastid, liveId }] = dataSource.filter(item => item.checked)
        const params = {
            choseLessonName: lessonName,
            choseTeacherName: teacherName,
            choseLiveProvider: liveProvider,
            choseLiveWebCastId: liveWebcastid,
            choseLessonDate: lessonDate,
            choseBeginTime: beginTime,
            choseEndTime: endTime,
            choseLiveId: liveId,
        }
        dispatch('getChoseCourse', params)
    }

    rendDom() {
        const { dispatch, list, dataSource, columns, choseLessonName = '', courseTagId = [], courseTagName = [], courseSourceList=[], isAdd, } = this.props
        const { previewVisible, previewImage, fileList, optListDialogVisible, optListDialogName, labelNamerender } = this.state
        const optListProps = {
            name: optListDialogName,
            dataSource,
            columns,
            submitChoseLiveCourse: this.submitChoseLiveCourse.bind(this),
            dispatch: dispatch,
        }
        const labelProps = {
            selected: courseTagId,
            cbValue: (e) => {
                dispatch('setCourseTagSelected', {e, list})
                this.setState({labelNamerender: false})
            },
            changeState: (e) => {
                this.setState(e)
            },
        }

        const uploadProps = {
            listType: "picture-card",
            onPreview: this.handlePreview,
            onChange: this.handleChange,
        }
        const  baseLabelTextStyle = {
            width: '120px',
            height: '20px',
            lineHeight: '20px',
            float: 'left',
        }
        return list.map((item, index) => {
            const { label='', previewImage, previewImageFirst, previewImageSecond, fileList, fileListFirst, fileListSecond, type, placeholder='', choseValue, btnText='',
                uploadTxtArr, lengthWidthRatioArr, choseType='', required=false, radioTxtArr, radioGroupVal, upperLimitWordNumber='', isShow=true, defaultValue } = item
            const isShowAsterisk = required ? 'visible': 'hidden'
            switch(type) {
                case 'choseButton':
                    return (
                        isShow ? (
                            isAdd ? (
                                <div key={index} style={{marginBottom: '10px'}}>
                                    <div style={{...baseLabelTextStyle, height: '28px', lineHeight: '28px'}}>
                                        <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                        <span>{label}</span>
                                    </div>
                                    {
                                        (choseType == 'liveCourse') && (choseValue ? <div style={{display: 'inline-block',padding:'5px', textAlign:'center', minWidth:'70px'}}>
                                          {choseValue}</div> : null)
                                    }
                                    <Button type="primary" name={choseType} onClick={this.showOptListDialog}>{btnText}</Button>
                                    <Modal title={label} visible={optListDialogVisible} maskClosable={false}
                                           footer={null} onOk={this.hideOptListDialog} onCancel={this.hideOptListDialog}
                                           width="990"
                                    >
                                        <OptList {...optListProps} />
                                    </Modal>
                                </div>
                            ) : null

                        ) : null
                    )
                case 'choseTagButton':
                    return (
                        isShow ? (
                            <div key={index} style={{marginBottom: '10px'}}>
                                <div style={{...baseLabelTextStyle, height: '28px', lineHeight: '28px'}}>
                                    <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                    <span>{label}</span>
                                </div>
                                {
                                    courseTagName.length ? (<div style={{display: 'inline-block',padding:'5px', textAlign:'center', minWidth:'70px'}}>
                                      {courseTagName.join(',')}</div>) : null
                                }
                                <Button type="primary" name={choseType} onClick={this.showTagDialog}>{btnText}</Button>
                                {
                                    labelNamerender && <Label {...labelProps} />
                                }
                            </div>
                        ) : null
                    )
                case 'upload':
                    const upload1Props = {
                        listType: "picture-card",
                        name: label,
                        isAdd,
                        choseValue,
                        dispatch,
                        uploadTxtArr,
                        lengthWidthRatioArr,
                        previewImage,
                        fileList,
                    }
                    return (
                        isShow ? (
                            <div key={index} style={{marginBottom: '10px'}}>
                                <div style={{...baseLabelTextStyle, height:'104px', lineHeight: '104px'}}>
                                    <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                    <span>{label}</span>
                                </div>
                                <div style={{display: 'inline-block'}}>
                                    <Upload1 {...upload1Props} />
                                </div>
                            </div>
                        ) : null
                    )
                case 'upload2':
                    const upload2Props = {
                        listType: "picture-card",
                        name: label,
                        dispatch,
                        isAdd,
                        choseValue,
                        uploadTxtArr,
                        lengthWidthRatioArr,
                        previewImageFirst,
                        previewImageSecond,
                        fileListFirst,
                        fileListSecond,
                    }
                    return (
                        isShow ? (
                            <div key={index} style={{marginBottom: '10px'}}>
                                <div style={{...baseLabelTextStyle, height: '104px', lineHeight: '104px'}}>
                                    <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                    <span>{label}</span>
                                </div>
                                <Upload2 {...upload2Props}/>
                            </div>
                        ) : null
                  )
                case 'input':
                    return (
                        isShow ? (
                            <div key={index} style={{marginBottom: '10px'}}>
                                <div style={{...baseLabelTextStyle, height:'30px', lineHeight:'30px'}}>
                                    <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                    <span>{label}</span>
                                </div>
                                <div style={{width: '50%', display: 'inline-block'}}>
                                    <Input placeholder={placeholder} name={label} value={choseValue} data-upperlimitwordnumber={upperLimitWordNumber}
                                           onChange={this.handleIptChange} />
                                </div>
                            </div>
                        ) : null
                    )
                case 'select':
                    const selectProps = {
                        dispatch,
                        choseValue,
                        defaultValue,
                        name: label,
                        children: courseSourceList,
                    }
                    return (
                        isShow ? (
                            <div key={index} style={{marginBottom: '10px'}}>
                                <div style={{...baseLabelTextStyle, height:'28px',lineHeight:'28px'}}>
                                    <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                    <span>{label}</span>
                                </div>
                                <div style={{display:'inline-block'}}>
                                    <SelectComponent {...selectProps}  />
                                </div>
                            </div>
                        ) : null
                    )
                case 'textarea':
                    return (
                        isShow ? (
                            <div key={index}>
                                <div style={{...baseLabelTextStyle, height:'70px', lineHeight:'70px'}}>
                                    <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                    <span>{label}</span>
                                </div>
                                <div style={{width: '50%', display: 'inline-block', fontSize:'12px'}}>
                                    <textarea placeholder={placeholder} style={{padding: '5px',width:'100%'}} value={choseValue} rows="3"
                                        name={label} data-upperlimitwordnumber={upperLimitWordNumber} onChange={this.handleTxtAreaChange}
                                    >
                                    </textarea>
                                </div>
                            </div>
                        ) : null

                    )
                case 'radio2':
                      const radioListProps = {
                          radioTxtArr,
                          name: label,
                          choseValue: +choseValue,
                          dispatch,
                      }
                      const samplePicProps = {
                          imgUrl: samplePic,
                      }
                      return (
                          isShow ? (
                              <div key={index}>
                                  <div style={{...baseLabelTextStyle, height:'31px', lineHeight:'31px'}}>
                                      <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                      <span>{label}</span>
                                  </div>
                                  <div style={{display:'inline-block', padding:'5px'}}>
                                      <RadioList {...radioListProps} />
                                  </div>
                                  <SamplePic {...samplePicProps} />
                              </div>
                          ) : null
                      )
                default:
                    return null
            }
        })
     }

    render() {
        return (
            <div style={{padding: '50px 50px 0', width: '80%'}}>
                { this.rendDom() }
            </div>
        )
    }
}
CourseRelated.propTypes = {
    list: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
}

CourseRelated.defaultProps = {

}

export default CourseRelated

