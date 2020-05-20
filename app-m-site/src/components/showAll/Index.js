import React, {Component, PropTypes} from 'react'
import Truncate from '../truncate/Truncate.CommonJS'

class ShowAll extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAll: false
        }
    }

    showAll = _ => {
        this.setState({
            showAll: true
        })
    }
    render() {
        const { showAll } = this.state
        const { content, lines, ellipsis } = this.props
        return (
            <div >
                {
                    showAll ? content
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
}

ShowAll.defaultProps = {
    content: '',
    lines: 3,
    ellipsis: <div></div>,
}

export default ShowAll;