/**
 * @file app后台 Abstract Title (hx + btn)
 *
 * @author gushouchuang
 * @date 2017-12-29
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Button } from 'antd'

const Title =  ({
    link,
    title,
    btnProps,
}) => {

    function creatBtnFactory () {
        return btnProps.map((item, index) => {
            const btnProps = {
                key: item.key || 'btn' + index,
                type: item.type || 'primary',
                style: {
                    width: '120px',
                    textAlign: 'center',
                    marginLeft: '15px',
                    height: '30px',
                },
                onClick: item.onClickCb,
            }

            return (
                <Button {...btnProps}>{item.label}</Button>
            )
        })
    }

    return (
        <div style={{
            padding: '0 30px 13px',
            borderBottom: '1px solid #e0e0e0'
        }}>
            {
                link
                ? <span onClick={link.onChangeCb} style={{
                    paddingRight: '10px',
                    cursor: 'pointer',
                    fontSize: '20px',
                }}>{link.label}</span>
                : null
            }
            <span style={{
                paddingLeft: '8px',
                fontWeight: 'normal',
                fontSize: '20px',
                color: '#333',
            }}>{title}</span>
            <div style={{
                float: 'right'
            }}>
                {creatBtnFactory()}
            </div>
        </div>
    ) 
}

Title.propTypes = {
    link: PropTypes.object,
    title: PropTypes.string.isRequired,
    btnProps: PropTypes.array,
}

Title.defaultProps = {
    link: null,
    title: '请添加标题~',
    btnProps: [],
}

export default Title

