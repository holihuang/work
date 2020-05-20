/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-10 15:25:17 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-09-11 11:27:23
 */
import React from 'react'
import PropTypes from 'prop-types'
import noop from 'lodash/noop'
import { Upload, Button, Icon, Modal } from 'antd'
import { url } from '../url'
import './imgUpload.less'

class ImgUpload extends React.Component {
    constructor(props) {
        super(props);
        const { imageUrl } = props
        this.state = {
            imageUrl
        }
    }

    handleOk = _ => {
        const { handleOk } = this.props
        typeof handleOk === 'function' && handleOk()
    }

    getImgUrl = _ => {
        const { imageUrl } = this.state
        return imageUrl
    }

    onChange = ({ file = {}, fileList = [], event }) => {
        const { onChange = noop(), onUpload = noop() } = this.props
        let { imageUrl } = this.state
        if (file.status === 'done') {
            const response = file.response
            if (response.rs) {
                const { linkUrl, width, height } = response.resultMessage[0]
                console.log(onChange)
                if (typeof onChange === 'function' && onUpload({ width, height }) !== false) {
                    onChange({ linkUrl, width, height })
                    imageUrl = linkUrl
                }
            } else {
                Modal.error({
                    title: response.rsdesp
                })
            }
        }
        this.setState({ imageUrl })
    }

    beforeUpload = (file, fileList) => {
        const { size } = file
        const { maxSize } = this.props

        if (size > maxSize * 1024) {
            Modal.error({
                title: `图片大小不能超过${(maxSize / 1024) >= 1 ? (maxSize / 1024).toFixed(2) + 'M' : maxSize + 'k'}`
            })
            return false
        }
    }

    render() {
        const { actionUrl, desc } = this.props
        const { imageUrl } = this.state
        return (
            <div>
                <Upload
                    name="picFile"
                    className={'img-upload-antd-custom'}
                    action={actionUrl}
                    onChange={this.onChange}
                    beforeUpload={this.beforeUpload}
                    showUploadList={false}
                >
                    <Button>
                        <Icon type="upload" /> {imageUrl ? '更新' : '上传'}
                    </Button>
                    <span className="img-upload-desc">{desc}</span>
                </Upload>

                {
                    imageUrl ? <img className="img-upload-previw" src={imageUrl} /> : null
                }
            </div>
        );
    }
}
ImgUpload.propTypes = {
    maxSize: PropTypes.number,
    imageUrl: PropTypes.string,
    actionUrl: PropTypes.string,
    desc: PropTypes.string,
    onChange: PropTypes.func,
}

ImgUpload.defaultProps = {
    maxSize: 1024,
    imageUrl: '',
    actionUrl: url.UPLOAD_PIC,
    desc: '',
    onChange: noop(),
}
export default ImgUpload;
