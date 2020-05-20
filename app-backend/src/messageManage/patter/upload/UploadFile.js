/*
*  @file
*  @author: gushouchuang
*  @data: 2018-09-19
* */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Icon, Button } from 'antd'
import cloneDeep from 'lodash/cloneDeep'

class UploadFile extends React.Component{
    constructor(props) {
        super(props)

        this.state = {
            uploadFileName: '',
        }
    }

    render() {
        const { fileList } = this.state

        const uploadProps = {
            onClick: () => {
                document.getElementById('importPatterFile').click()
            }
        }

        const inputProps = {
            id: 'importPatterFile',
            style: {
                display: 'none',
            },
            type: 'file',
            name: 'file',
            onChange: (e) => {
                const files = e.target.files

                this.setState({
                    uploadFileName: files[0].name,
                })

                this.props.changeState({
                    file: files[0],
                    name: files[0].name,
                })
            }
        }

        const btnLabelTxt = this.state.uploadFileName
            ? '更新'
            : '上传'

        return (
            <div style={{
                display: 'inline-block'
            }}>
                <Button {...uploadProps}>
                    <Icon type="upload" /> {btnLabelTxt}
                </Button>
                <p>{this.state.uploadFileName}</p>
                <input {...inputProps} />
            </div>
        )
    }
}

UploadFile.defaultProps = {
    change: () => {},
}

UploadFile.propTypes = {
    change: PropTypes.func,
}

export default UploadFile
