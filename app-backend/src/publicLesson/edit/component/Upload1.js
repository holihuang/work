/*
*  @file: 图片上传组件（同行单个上传按钮）
*  @author: huanghaolei
*  @data: 2018-01-18
* */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Upload, Icon, Modal } from 'antd'
import cloneDeep from 'lodash/cloneDeep'

const URL = '/community-manager-war/base/uploadPicture.action'

class Upload1 extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            previewVisible: false,
            previewImage: '',
            fileList: [],
        }
    }

    handlePreview = file => {
        //let { dispatch, previewImage, name, filterList } = this.props
        //previewImage = file.url || file.thumbUrl
        //dispatch('changeUpload1PreviewUrl', { previewImage, name, filterList })
        this.setState({
            previewVisible: true,
            previewImage: file.url || file.thumbUrl,
        })
    }

    getLengthWidthSize(lengthWidthRatioArr) {
        const [lengthWidthRatio] = lengthWidthRatioArr
        const [lengthWidth, size] = lengthWidthRatio.slice(1, lengthWidthRatio.length - 1).split(',')
        const [requiredWidth, requiredHeight] = lengthWidth.split('*')
        const requiredSize = size.slice(1, size.length-1)
        return { requiredWidth, requiredHeight, requiredSize }
    }

    handleChange = e => {
        const { dispatch, name, filterList, lengthWidthRatioArr } = this.props
        let { fileList, file } = e
        const  { fileList: stateFileList } = this.state
        let fileListCopy = cloneDeep(fileList)
        //dispatch('changeUpload1FileList', { fileList, name, filterList })

        //成功回调
        if(file.status == 'done') {
            const [{ response }] = fileList
            const { resultMessage: [{height, width, linkUrl, size}] } = response
            const { requiredWidth, requiredHeight, requiredSize } = this.getLengthWidthSize(lengthWidthRatioArr)
            const reg = /^\d*$/
            if(reg.test(requiredWidth)) {
                if(+requiredWidth !== +width) {
                    alert('宽度不符合要求, 请重新上传')
                    fileListCopy = []
                    this.setState({
                        fileList: fileListCopy
                    })
                    return
                }
            }
            if(reg.test(requiredHeight)) {
                if(+requiredHeight !== +height) {
                    alert('高度不符合要求, 请重新上传')
                    fileListCopy = []
                    this.setState({
                        fileList: fileListCopy
                    })
                    return
                }
            }
            if(reg.test(requiredSize)) {
                if(+(requiredSize * 1024) < +size) {
                    alert('图片过大, 请重新上传')
                    fileListCopy = []
                    this.setState({
                        fileList: fileListCopy
                    })
                    return
                }
            }
            dispatch('uploadSuccessCallBack', { height, width, linkUrl, name, type: 1, })
            fileListCopy = [{
                uid: -2,
                url: linkUrl,
                status: 'done',
                name: file.name,
            }]
        } else {
            fileListCopy = fileList
        }
        this.setState({
            fileList: fileListCopy
        })
    }

    handleCancel = _ => {
        this.setState({ previewVisible: false })
    }

    handleRemove = _ => {
        const { dispatch, name } = this.props
        dispatch('handleUpload1Remove', { name })
    }

    render() {

        let { listType, uploadTxtArr, lengthWidthRatioArr, isAdd, choseValue, } = this.props
        let { previewVisible, fileList, previewImage } = this.state

        if(!isAdd) {
            if(!fileList.length) {
                choseValue && (fileList = [{
                    uid: -1,
                    name: '',
                    status: 'done',
                    url: choseValue,
                }])
            }
        }

        const uploadProps = {
            name: 'picFile',
            listType,
            action: URL,
            fileList,
            onPreview: this.handlePreview,
            onChange: this.handleChange,
            onRemove: this.handleRemove,
        }
        const modalProps = {
            visible: previewVisible,
            footer: null,
            onCancel: this.handleCancel,
        }
        return (
            <div style={{display:'inline-block'}}>
                <Upload {...uploadProps}>
                    {
                        fileList.length >= 1 ? null : (
                            <div>
                                <Icon type="plus" />
                                <div style={{marginTop: '8px', color: '#666'}}>{uploadTxtArr[0]}</div>
                            </div>
                        )
                    }
                </Upload>
                <div style={{display:'inline-block',minWidth:'105px',height:'96px',lineHeight:'96px'}}>{(lengthWidthRatioArr[0])}</div>
                <Modal {...modalProps}>
                    <img alt="example" style={{width: '100%'}} src={previewImage}/>
                </Modal>
            </div>
        )
    }
}

Upload1.propTypes = {
    listType: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isAdd: PropTypes.bool,
    choseValue: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    uploadTxtArr: PropTypes.array.isRequired,
    lengthWidthRatioArr: PropTypes.array,
}

export default Upload1
