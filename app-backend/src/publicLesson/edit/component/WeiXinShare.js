/*
*  @file: 微信分享组件
*  @author: huanghaolei
*  @date: 2018-01-19
*
* */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Upload1 from './Upload1'
import SelectComponent from './SelectComponent'

class WeiXinShare extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    render() {
        const { dispatch, list } = this.props
        const shareContentProps = {
            list,
            dispatch,
        }

        return (
            <div style={{padding: '50px 50px 0', width: '80%'}}>
                <b style={{marginBottom:'10px'}}>微信分享</b>
                <WeiXinShareContent {...shareContentProps} />
            </div>
        )
    }
}

WeiXinShare.propTypes = {
    list: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
}

export default WeiXinShare


class WeiXinShareContent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    renderDOM() {
        const { list, dispatch } = this.props
        const  baseLabelTextStyle = {
            width: '120px',
            height: '20px',
            lineHeight: '20px',
            float: 'left',
        }
        return list.map((item, index) => {
            const { label, type, required=false, uploadTxtArr, lengthWidthRatioArr, previewImage, fileList, isShow=true, defaultValue, jumpToTypeList, choseValue } = item
            const isShowAsterisk = required ? 'visible': 'hidden'
            switch (type) {
                case 'upload':
                    const upload1Props = {
                        listType: "picture-card",
                        name: label,
                        choseValue,
                        filterList: list,
                        dispatch,
                        uploadTxtArr,
                        lengthWidthRatioArr,
                        previewImage,
                        fileList,
                    }
                    return (
                        isShow ? (
                            <div key={index} style={{marginBottom: '10px'}}>
                                <div style={{...baseLabelTextStyle, height: '104px', lineHeight:'104px'}}>
                                    <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                    <span>{label}</span>
                                </div>
                                <div style={{display: 'inline-block'}}>
                                    <Upload1 {...upload1Props} />
                                </div>
                            </div>
                        ) : null
                    )
                case 'select':
                    const selectProps = {
                        dispatch,
                        defaultValue,
                        choseValue,
                        name: label,
                        children: jumpToTypeList,
                    }
                    return (
                        isShow ? (
                            <div key={index} style={{marginBottom: '10px'}}>
                                <div style={{...baseLabelTextStyle, height:'28px', lineHeight:'28px'}}>
                                    <span style={{color: 'red', visibility: isShowAsterisk}}>*</span>
                                    <span>{label}</span>
                                </div>
                                <div style={{display:'inline-block'}}>
                                    <SelectComponent {...selectProps}  />
                                </div>
                            </div>
                        ) : null
                    )
            }
        })
    }

    render() {
        return (
            <div>
                {this.renderDOM()}
            </div>
        )
    }
}
