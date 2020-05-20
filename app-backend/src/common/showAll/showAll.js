import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Truncate from '../trunCate/trunCate'

class ShowAll extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showAll: false,
        }
    }

    showAll = e => {
        e.stopPropagation()
        this.setState({
            showAll: true,
        })
    }
    hideAll = e => {
        e.stopPropagation()
        this.setState({
            showAll: false,
        })
    }
    render() {
        const { showAll } = this.state
        const {
            content,
            lines,
            ellipsis,
            retract,
        } = this.props
        return (
            <div >
                {
                    showAll ?
                        <span>{content}{retract && <span onClick={this.hideAll}>{retract}</span>}</span>
                        :
                        <Truncate lines={lines} ellipsis={<span onClick={this.showAll}>{ellipsis}</span>}>
                            {content || ' '}
                        </Truncate>
                }
            </div>
        )
    }   
}
ShowAll.propTypes = {
    content: PropTypes.string,
    lines: PropTypes.number,
    ellipsis: PropTypes.element,
    retract: PropTypes.element,
}

ShowAll.defaultProps = {
    content: '',
    lines: 4,
    ellipsis: <div />,
    retract: <div />,
}

export default ShowAll
