/*
*  @file: 图片上传组件
*  @author: huanghaolei
*  @data: 2018-01-18
* */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Upload, Icon, Modal } from 'antd'
import cloneDeep from 'lodash/cloneDeep'

const URL = '/community-manager-war/base/uploadVideoFile.action'
const VALIDATE = [{
    key: 'size',
    label: '图片大小',
}]

class UploadImg extends React.Component{
    constructor(props) {
        super(props)

        this.state = {
            fileList: this.props.fileList, // Diy组件，数据需要自己维护，仅change时候将当前数据通信给Edit即可
            previewVisible: false,
            previewVideo: '',
        }
    }
    // Molda 预览
    handlePreview = file => {
        this.setState({
            previewVisible: true,
            previewVideo: file.videoUrl,
        })
    }

    // 取消预览
    handleCancel = _ => {
        this.setState({ 
            previewVisible: false
        })
    }

    // 上传图片
    handleChange = e => {
        let { fileList, file } = e
        let fileListNew = [...this.state.fileList]
        const index = fileList.length - 1

        // mock del
        // file.status = 'done'
        // fileList = [{
        //     response: {
        //         resultMessage: [{
        //             height: 50,
        //             width: 50,
        //             size: 90,
        //             linkUrl: 'http://172.16.117.224/assets/logo-ca207549507c811d027110077cf86e90.svg'
        //         }]
        //     }
        // }]
        
        //成功回调
        if(
            file.status === 'done' 
            && fileList && fileList[index] && fileList[index].response
            && fileList[index].response.resultMessage 
            && fileList[index].response.resultMessage[0]
        ) {
            const resultMessage = fileList[index].response.resultMessage[0]
            const { linkUrl, size, imgUrl } = resultMessage

            const validRst = VALIDATE.find(item => {
                if(this.props[item.key] !== -1) {
                    if (item.key === 'size') {
                        if(+(this.props.size * 1024 * 1024) < +size) {
                            alert('视频过大, 请重新上传')
                            return true // 跳出循环
                        }
                    }
                }
            })
            // 校验通过了
            if (!validRst) {
                // 同一张图片后端存储的地址url，应该也不一样，所以允许同一张图上传多次
                fileListNew.push({
                    uid: linkUrl, // 直接用url做文件唯一标识（不需要rd额外开业务口子）
                    name: file.name,
                    status: 'done',
                    url: imgUrl,
                    videoUrl: linkUrl,
                })
            }
            
            // 剔除掉脏数据
            fileListNew = fileListNew.filter(item => {
                return !item.percent
            })
            
            // Diy元组件中封装的可修改Edit.js中state的钩子：changeState。
            this.props.changeState(fileListNew)
            this.setState({
                fileList: fileListNew
            })
        } else {
            // alert('上传失败，请重试')
            this.setState({
                fileList,
            })
        }
    }

    // 删除已上传的图
    handleRemove = e => {
        const fileList = this.state.fileList.filter(item => item.uid !== e.uid)
        this.setState({
            fileList
        })
        // Diy元组件中封装的可修改Edit.js中state的钩子：changeState。
        this.props.changeState(fileList)
    }

    render() {
        const { previewVisible, previewVideo, fileList } = this.state

        const { uploadTips, width, height, size, } = this.props

        const uploadProps = {
            accept: 'video/mp4', // 需要的话 就外提
            name: 'file',
            listType: 'picture-card',
            action: URL,
            fileList,
            onPreview: this.handlePreview,
            onChange: this.handleChange,
            onRemove: this.handleRemove,
        }

        const modalProps = {
            visible: true,
            footer: null,
            onCancel: this.handleCancel,
        }

        const detailInfo = `${size}M以内，仅限MP4格式`

        return (
            <div style={{
                display: 'inline-block'
            }}>
                <Upload {...uploadProps}>
                    {
                        fileList.length < this.props.max && (
                            <div>
                                <Icon type="plus" />
                                <div style={{marginTop: '8px', color: '#666'}}>{uploadTips}</div>
                            </div>
                        )
                    }
                </Upload>
                <div style={{display:'inline-block',minWidth:'105px',height:'96px',lineHeight:'96px'}}>{detailInfo}</div>
                {
                    previewVisible && <Modal {...modalProps}>
                        <video src={previewVideo}  style={{width: '100%'}} controls="controls" />
                    </Modal>
                }
            </div>
        )
    }
}

UploadImg.defaultProps = {
    max: 1, // 支持的图片数目
    fileList: [], // 回填的图片
    // [{
    //     uid: -1, 
    //     name: '',
    //     status: 'done',
    //     url: '',
    // }]
    uploadTips: '上传视频', // 上传框的话术提示
    size: -1,
    remove: () => {},
    change: () => {},
}

UploadImg.propTypes = {
    fileList: PropTypes.array,
    uploadTips: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    size: PropTypes.number,
    max: PropTypes.number,
    remove: PropTypes.func,
    change: PropTypes.func,
}

export default UploadImg
