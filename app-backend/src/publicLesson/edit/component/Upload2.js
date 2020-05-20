/*
*  @file: 上传图片组件（同行两个独立上传按钮）
*  @author: huanghaolei
*  @data: 2018-01-18
* */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Upload, Icon, Modal } from 'antd'
import _ from 'lodash'

const URL = '/community-manager-war/base/uploadPicture.action'
const REG = /^\d*$/

class Upload2 extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            previewVisibleArr: [false, false],
            fileListFirst: [],
            fileListSecond: [],
        }
    }

    getLengthWidthSize(lengthWidthRatioArr, index) {
        const lengthWidthRatio = lengthWidthRatioArr[index]
        const [lengthWidth, size] = lengthWidthRatio.slice(1, lengthWidthRatio.length - 1).split(',')
        const [requiredWidth, requiredHeight] = lengthWidth.split('*')
        const requiredSize = size.slice(1, size.length-1)
        return { requiredWidth, requiredHeight, requiredSize }
    }

    handlePreviewFirst = file => {
        const { previewImageFirst, dispatch, name } = this.props
        const { previewVisibleArr } = this.state
        const arr = [].concat(previewVisibleArr)
        let first = previewImageFirst
        arr[0] = true
        first = file.url || file.thumbUrl
        dispatch('changeUpload2PreviewUrl', { first, name })
        this.setState({
            previewVisibleArr: arr
        })
    }
    handleChangeFirst = e => {
        const { dispatch, name, lengthWidthRatioArr } = this.props
        let { fileList, file } = e
        let fileListFirstCopy = _.cloneDeep(fileList)
        //dispatch('changeUpload2FileList', { first: fileList, name })

        //成功回调
        if(file.status == 'done') {
            const [{ response }] = fileList
            const { resultMessage: [{height, width, linkUrl, size}] } = response
            const index = 0
            const { requiredWidth, requiredHeight, requiredSize } = this.getLengthWidthSize(lengthWidthRatioArr, index)

            if(REG.test(requiredWidth)) {
                if(+requiredWidth !== +width) {
                    alert('宽度不符合要求，请重新上传')
                    fileListFirstCopy = []
                    this.setState({ fileListFirst: fileListFirstCopy })
                    return
                }
            }
            if(REG.test(requiredHeight)) {
                if(+requiredHeight !== +height) {
                    alert('高度不符合要求，请重新上传')
                    fileListFirstCopy = []
                    this.setState({ fileListFirst: fileListFirstCopy })
                    return
                }
            }
            if(REG.test(requiredSize)) {
                if(+(requiredSize * 1024) < +size) {
                    alert('图片过大，请重新上传')
                    fileListFirstCopy = []
                    this.setState({ fileListFirst: fileListFirstCopy })
                    return
                }
            }
            dispatch('uploadSuccessCallBack', { height, width, linkUrl, name, type: 2, index })
            fileListFirstCopy = [{
                uid: -1,
                url: linkUrl,
                status: 'done',
                name: file.name,
            }]
        } else {
            fileListFirstCopy = fileList
        }
        this.setState({ fileListFirst: fileListFirstCopy })
    }
    handleCancelFirst = _ => {
        const { previewVisibleArr } = this.state
        const arr = [].concat(previewVisibleArr)
        arr[0] = false
        this.setState({
           previewVisibleArr: arr
        })
    }

    handleRemoveFirst = e => {
        const { dispatch, name } = this.props
        dispatch('handleRemoveUpload2', { name, index: 0 })
    }


    handlePreviewSecond = file => {
        const { previewImageSecond, dispatch, name } = this.props
        const { previewVisibleArr } = this.state
        const arr = [].concat(previewVisibleArr)
        let second = previewImageSecond
        arr[1] = true
        second = file.url || file.thumbUrl
        dispatch('changeUpload2PreviewUrl', { second, name })
        this.setState({
            previewVisibleArr: arr
        })
    }
    handleChangeSecond = e => {
        const { dispatch, name, lengthWidthRatioArr } = this.props
        const { fileList, file } = e
        //dispatch('changeUpload2FileList', { second: fileList, name })
        let fileListSecondCopy = _.cloneDeep(fileList)
        //成功回调
        if(file.status == 'done') {
            const [{ response }] = fileList
            const { resultMessage: [{height, width, linkUrl, size}] } = response
            const index = 1
            const { requiredWidth, requiredHeight, requiredSize } = this.getLengthWidthSize(lengthWidthRatioArr, index)

            if(REG.test(requiredWidth)) {
                if(+requiredWidth !== +width) {
                    alert('宽度不符合要求, 请重新上传')
                    fileListSecondCopy = []
                    this.setState({ fileListSecond: fileListSecondCopy })
                    return
                }
            }
            if(REG.test(requiredHeight)) {
                if(+requiredHeight !== +height) {
                    alert('高度不符合要求, 请重新上传')
                    fileListSecondCopy = []
                    this.setState({ fileListSecond: fileListSecondCopy })
                    return
                }
            }
            if(REG.test(requiredSize)) {
                if(+(requiredSize * 1024) < +size) {
                    alert('图片过大, 请重新上传')
                    fileListSecondCopy = []
                    this.setState({ fileListSecond: fileListSecondCopy })
                    return
                }
            }
            dispatch('uploadSuccessCallBack', { height, width, linkUrl, name, type: 2, index })
            fileListSecondCopy = [{
                uid: -2,
                url: linkUrl,
                status: 'done',
                name: file.name,
            }]
        } else {
            fileListSecondCopy = fileList
        }
        this.setState({ fileListSecond: fileListSecondCopy })
    }
    handleCancelSecond = _ => {
        const { previewVisibleArr } = this.state
        const arr = [].concat(previewVisibleArr)
        arr[1] = false
        this.setState({
            previewVisibleArr: arr
        })
    }
    handleRemoveSecond = e => {
        const { dispatch, name } = this.props
        dispatch('handleRemoveUpload2', { name, index: 1 })
    }

    render() {

        let { choseValue, uploadTxtArr, lengthWidthRatioArr, previewImageFirst, previewImageSecond, isAdd } = this.props
        let { previewVisibleArr, fileListFirst, fileListSecond } = this.state

        if(!isAdd) {
            if(choseValue instanceof Array) {
                if(!fileListFirst.length) {
                    choseValue[0] && (fileListFirst = [{
                        uid: -1,
                        name: '',
                        status: 'done',
                        url: choseValue[0],
                    }])
                }
                if(!fileListSecond.length) {
                    choseValue[1] && (fileListSecond = [{
                        uid: -1,
                        name: '',
                        status: 'done',
                        url: choseValue[1],
                    }])
                }
            }
        }

        const uploadFirstProps = {
            listType: "picture-card",
            name: 'picFile',
            action: URL,
            fileList: fileListFirst,
            onPreview: this.handlePreviewFirst,
            onChange: this.handleChangeFirst,
            onRemove: this.handleRemoveFirst,
        }
        const uploadSecondProps = {
            listType: "picture-card",
            name: 'picFile',
            action: URL,
            fileList: fileListSecond,
            onPreview: this.handlePreviewSecond,
            onChange: this.handleChangeSecond,
            onRemove: this.handleRemoveSecond,
        }

        const uploadModalFirstProps = {
            visible: previewVisibleArr[0],
            footer: null,
            onCancel: this.handleCancelFirst,
        }
        const uploadModalSceondProps = {
            visible: previewVisibleArr[1],
            footer: null,
            onCancel: this.handleCancelSecond,
        }

        return (
            <div style={{display:'inline-block', width:'50%'}}>
                <div style={{display:'inline-block',width:'50%'}}>
                    <Upload {...uploadFirstProps}>
                        {
                            fileListFirst.length >= 1 ? null : (
                                <div>
                                    <Icon type="plus" />
                                    <div style={{marginTop: '8px', color: '#666'}}>{uploadTxtArr[0]}</div>
                                </div>
                            )
                        }
                    </Upload>
                    <div style={{display:'inline-block',minWidth:'105px',height:'96px',lineHeight:'96px'}}>{(lengthWidthRatioArr[0])}</div>
                    <Modal {...uploadModalFirstProps}>
                        <img alt="example" style={{ width: '100%' }} src={previewImageFirst} />
                    </Modal>
                </div>
                <div style={{display:'inline-block',width:'50%'}}>
                    <Upload {...uploadSecondProps}>
                        {
                            fileListSecond.length >= 1 ? null : (
                                <div>
                                    <Icon type="plus" />
                                    <div style={{marginTop: '8px', color: '#666'}}>{uploadTxtArr[1]}</div>
                                </div>
                            )
                        }
                    </Upload>
                    <div style={{display:'inline-block',minWidth:'105px',height:'96px',lineHeight:'96px'}}>{(lengthWidthRatioArr[1])}</div>
                    <Modal {...uploadModalSceondProps}>
                        <img alt="example" style={{ width: '100%' }} src={previewImageSecond} />
                    </Modal>
                </div>
            </div>
        )
    }
}

Upload2.propTypes = {
    listType: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    isAdd: PropTypes.bool,
    choseValue: PropTypes.array,
    uploadTxtArr: PropTypes.array.isRequired,
    lengthWidthRatioArr: PropTypes.array,
    previewImageFirst: PropTypes.string.isRequired,
    previewImageSecond: PropTypes.string.isRequired,
}

export default Upload2
