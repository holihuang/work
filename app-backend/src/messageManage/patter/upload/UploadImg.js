/*
*  @file
*  @author: gushouchuang
*  @data: 2018-09-19
* */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Upload, Icon, Button } from 'antd'
import cloneDeep from 'lodash/cloneDeep'

const URL = '/community-manager-war/base/uploadPicture.action'

class UploadImg extends React.Component{
    constructor(props) {
        super(props)

        this.state = {
            fileList: this.props.fileList, // Diy组件，数据需要自己维护，仅change时候将当前数据通信给Edit即可
        }
    }

    // 上传图片
    handleChange = e => {
        const ignore = this.props.ignore
        let { fileList, file } = e
        let fileListNew = [...this.state.fileList]
        const index = fileList.length - 1

        //成功回调
        if(
            file.status === 'done' 
            && fileList && fileList[index] && fileList[index].response
            && fileList[index].response.resultMessage 
            && fileList[index].response.resultMessage[0]
        ) {
            const resultMessage = fileList[index].response.resultMessage[0]

            const { linkUrl } = resultMessage

            // 同一张图片后端存储的地址url，应该也不一样，所以允许同一张图上传多次
            fileListNew.push({
                uid: linkUrl, // 直接用url做文件唯一标识（不需要rd额外开业务口子）
                name: file.name,
                status: 'done',
                url: linkUrl,
            })
            
            // 剔除掉脏数据
            fileListNew = fileListNew.filter(item => {
                return !item.percent
            })

            // 只取最后一张图
            fileListNew = [fileListNew[fileListNew.length - 1]]
            
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
        // const fileList = this.state.fileList.filter(item => item.uid !== e.uid)
        this.setState({
            fileList: []
        })

        // Diy元组件中封装的可修改Edit.js中state的钩子：changeState。
        this.props.changeState([])
    }

    render() {
        const { fileList } = this.state

        const uploadProps = {
            accept: 'image/jpg,image/jpeg,image/png',
            name: 'picFile',
            action: URL,
            fileList,
            // onPreview: this.handlePreview,
            onChange: this.handleChange,
            onRemove: this.handleRemove,
        }

        return (
            <div style={{
                display: 'inline-block'
            }}>
                <Upload {...uploadProps}>
                    <Button disabled={this.props.disabled}>
                        <Icon type="upload" /> 上传
                    </Button>
                </Upload>
            </div>
        )
    }
}

UploadImg.defaultProps = {
    max: 1, // 支持的图片数目
    fileList: [], // 回填的图片
    remove: () => {},
    change: () => {},
}

UploadImg.propTypes = {
    fileList: PropTypes.array,
    max: PropTypes.number,
    remove: PropTypes.func,
    change: PropTypes.func,
}

export default UploadImg
