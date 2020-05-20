/*
 * @Author: zhangpengyu 
 * @Date: 2018-01-11 17:51:42 
 * @Last Modified by: zhangpengyu
 * @Last Modified time: 2018-09-11 11:29:53
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Row, Col, Button } from 'antd'
import copy from 'copy-to-clipboard'

const ResultModal =  (props) => {

    const handleOk = _ => {
        const { handleCancel } = props
        handleCancel()
    }
    const handleCopy = _ => {
        const { failIdList = ''} = props
        copy(failIdList)
    }
    const { success, succCount, failCount, failIdList, rsdesp = '' } = props
    let footerArray = [
        <Button key="submit" type="primary" size="large" onClick={handleOk}>
            确定
        </Button>,
    ]
    if(!success) {
        footerArray.unshift(
            <Button key="copy" type="primary" size="large" onClick={handleCopy}>
                复制失败内容
            </Button>
        )
    }
    return (
        <Modal
            visible={true}
            width={400}
            footer={footerArray}
            onCancel={handleOk}
        >
            <Row>
                <Col span={8}>已添加内容数:</Col>
                <Col span={16}>{succCount}</Col>
            </Row>
            { 
                !success ? 
                <Row>
                    <Col span={8}>部分添加失败:</Col>
                    <Col span={16}>{rsdesp}</Col>
                </Row>
                :
                null
            }
            <Row>
                <Col span={8}>添加内容失败数:</Col>
                <Col span={16}>{failCount}</Col>
            </Row>
            { 
                !success ? 
                <Row>
                <Col span={8}>添加失败内容:</Col>
                    <Col span={16} style={{wordWrap: 'break-word'}}>{failIdList}</Col>
                </Row>
                :
                null
            }
        </Modal> 
    ) 
}

// ResultModal.propTypes = {
//     link: PropTypes.object,
//     title: PropTypes.string.isRequired,
//     btnProps: PropTypes.array,
// }

// ResultModal.defaultProps = {
//     link: null,
//     title: '请添加标题~',
//     btnProps: [],
// }

export default ResultModal

