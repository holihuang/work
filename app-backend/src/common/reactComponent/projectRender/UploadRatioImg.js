/*
*  @file: 图片上传组件 比例校验
*  @author: gushouchuang
*  @data: 2019-12-10
* */
import React from 'react'
import PropTypes from 'prop-types'
import { Upload, Icon, Modal } from 'antd'

const URL = '/community-manager-war/base/uploadPicture.action'

class UploadImg extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            fileList: this.props.fileList, // Diy组件，数据需要自己维护，仅change时候将当前数据通信给Edit即可
            previewVisible: false,
            previewImage: '',
        }
    }
    // Molda 预览
    handlePreview = file => {
        this.setState({
            previewVisible: true,
            previewImage: file.url || file.thumbUrl,
        })
    }

    // 取消预览
    handleCancel = _ => {
        this.setState({
            previewVisible: false,
        })
    }

    // 上传图片
    handleChange = e => {
        const { ratio, size } = this.props
        const { fileList, file } = e
        let fileListNew = [...this.state.fileList]
        const index = fileList.length - 1

        // 成功回调
        if (
            file.status === 'done'
            && fileList && fileList[index] && fileList[index].response
            && fileList[index].response.resultMessage
            && fileList[index].response.resultMessage[0]
        ) {
            const resultMessage = fileList[index].response.resultMessage[0]
            // const { resultMessage: [{height, width, linkUrl, size}] } = responses
            const { linkUrl } = resultMessage

            let validRst = true

            if (size !== -1) {
                if (+(size * 1024) < +resultMessage.size) {
                    alert('图片过大, 请重新上传')
                    validRst = false // 跳出循环
                }
            }

            if (ratio) {
                const ratioOrder = ratio.split(':')
                if (resultMessage[ratioOrder[0]] / resultMessage[ratioOrder[1]] !== this.props[ratioOrder[0]] / this.props[ratioOrder[1]]) {
                    alert('图片比例不符合要求, 请重新上传')
                    validRst = false // 跳出循环
                }
            }

            // 校验通过了
            if (validRst) {
                // 同一张图片后端存储的地址url，应该也不一样，所以允许同一张图上传多次
                fileListNew.push({
                    uid: linkUrl, // 直接用url做文件唯一标识（不需要rd额外开业务口子）
                    name: file.name,
                    status: 'done',
                    url: linkUrl,
                })
            }

            // 剔除掉脏数据
            fileListNew = fileListNew.filter(item => !item.percent)

            // Diy元组件中封装的可修改Edit.js中state的钩子：changeState。
            this.props.changeState(fileListNew)
            this.setState({
                fileList: fileListNew,
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
            fileList,
        })
        // Diy元组件中封装的可修改Edit.js中state的钩子：changeState。
        this.props.changeState(fileList)
    }

    render() {
        const { previewVisible, previewImage, fileList } = this.state

        const { uploadTips, detailInfo } = this.props

        const uploadProps = {
            accept: 'image/jpg,image/jpeg,image/png',
            name: 'picFile',
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

        return (
            <div style={{
                display: 'inline-block',
            }}
            >
                <Upload {...uploadProps}>
                    {
                        fileList.length < this.props.max && (
                            <div>
                                <Icon type="plus" />
                                <div style={{ marginTop: '8px', color: '#666' }}>{uploadTips}</div>
                            </div>
                        )
                    }
                </Upload>
                <div style={{ display: 'inline-block', minWidth: '105px', height: '96px', lineHeight: '96px' }}>{detailInfo}</div>
                {
                    previewVisible && <Modal {...modalProps}>
                        <img alt="example" style={{ width: '100%'}} src={previewImage} />
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
    // uploadTips: '上传图片', // 上传框的话术提示
    detailInfo: '', // 要忽视掉的校验
    width: -1, // 图片的宽、高、大小
    height: -1,
    size: -1,
    ratio: -1,
    remove: () => {},
    change: () => {},
    changeState: () => {},
}

UploadImg.propTypes = {
    fileList: PropTypes.array,
    uploadTips: PropTypes.string.isRequired,
    detailInfo: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    size: PropTypes.number,
    max: PropTypes.number,
    ratio: PropTypes.string,
    remove: PropTypes.func,
    change: PropTypes.func,
    changeState: PropTypes.func,
}

export default UploadImg
