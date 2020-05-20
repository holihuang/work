/*
**@file: File - 上传文件组件
**@author: huanghaolei
**@date: 2019-10-16
*/
import React, { useState } from 'react'
import { Button } from 'antd'

const excelAddress = 'http://store.sunlands.com/common/community/student_story_push_template.xlsx'

function handleUploadClick(e) {
    const uploadFile = document.getElementById('storyPushUploadFile')
    uploadFile.click()
}

function handleInputFileChange(e, opt = {}) {
    const { setState, props: { onUpload } } = opt
    const { files: [file] } = e.target
    setState({
        uploadFileName: file.name,
    })
    onUpload(file, file.name)
}

function File(props) {
    const defaults = {
        uploadFileName: '',
    }
    const [state, setState] = useState(defaults)
    const { uploadFileName } = state
    const linkStyle = {
        color: '#1890ff',
    }
    const uploadProps = {
        type: 'primary',
        style: {
            marginRight: '10px',
        },
        onClick: handleUploadClick,
    }
    const iptProps = {
        id: 'storyPushUploadFile',
        type: 'file',
        style: {
            display: 'none',
        },
        onChange: e => {
            handleInputFileChange(e, { setState, props })
        },
    }
    const fileNameStyle = {
        margin: '10px 0',
    }
    return (
        <div>
            <Button {...uploadProps}>上传推送名单文件</Button>
            <a href={excelAddress} style={linkStyle}>下载推送名单模板</a>
            <input {...iptProps} />
            {
                uploadFileName ? <div style={fileNameStyle}>{uploadFileName}</div> : null
            }
        </div>
    )
}

File.defaultProps = {
    onUpload: () => {},
}

export default File
