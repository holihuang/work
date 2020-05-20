/**
 * @file app后台 Abstract Table Render Oper
 *
 * @author gushouchuang
 * @date 2018-1-3
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'

const OperCell =  ({
    args,
    list,
}) => {

    const [
        value,
        row,
        index,
    ] = args

    function creatAFactory () {
        return list.map((item, i) => {
            let aProps = {
                key: item.key || 'oper-a-' + i,
                href: "javascript:;",
                onClick() {
                    item.onClickCb({
                        value,
                        row,
                        index,
                    })
                },
                style: {
                    display: 'inline-block',
                    lineHeight: '18px',
                    padding: '0 8px',
                    borderLeft: '1px solid #ccc',
                    color: '#108ee9'
                }
            }

            if (i === 0) {
                aProps.style.borderLeft = 'none'
                aProps.style.paddingLeft = '0'
            }

            return (
                <a {...aProps}>{item.label}</a>
            )
        })
    }

    return (
        <div className="app-back-oper-cell">
            {creatAFactory()}
        </div>
    ) 
}

OperCell.propTypes = {
    list: PropTypes.array,
    args: PropTypes.array,
}

OperCell.defaultProps = {
    list: [],
    args: [],
}

export default OperCell

