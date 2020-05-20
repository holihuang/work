import React from 'react'
import PropTypes from 'prop-types'
import ImgRender from 'common/reactComponent/tableRender/ImgRender'
import ShowAll from '../../common/showAll/showAll'


class PopOver extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isShowSend: false,
        }
    }
    contextMenuHandler = e => {
        e.preventDefault()
        this.setState({ isShowSend: !this.state.isShowSend }, _ => {
            document.addEventListener('contextmenu', this.handleDocumentClick)
            document.addEventListener('click', this.handleDocumentClick)
        })
    }
    handleDocumentClick = e => {
        this.setState({ isShowSend: false }, _ => {
            document.removeEventListener('contextmenu', this.handleDocumentClick)
            document.removeEventListener('click', this.handleDocumentClick)
        })
    }
    sendHandler = () => {
        const { handleBtnSend, replyItem } = this.props
        this.setState({ isShowSend: !this.state.isShowSend })
        handleBtnSend(replyItem)
    }
    render() {
        const {
            isShowImg,
            replyItem,
            handleBtnSend,
        } = this.props
        const { isShowSend } = this.state
        const { id, type, quickReplyContent, remark } = replyItem
        return (
            <div ref={ ref => this.wrap = ref } onContextMenu={this.contextMenuHandler} className="replyItemStyle" id="replyItemWrapper">
                { type === 2 ?
                    <ImgRender isShowImg={isShowImg} remark={remark} onOk={() => handleBtnSend(replyItem)} src={quickReplyContent} height="auto" width="100%" title="图片预览" />
                    :
                    <div onClick={() => { this.props.appendTextHandler({ quickReplyContent, id }) }}>
                        <ShowAll content={quickReplyContent} lines={4} ellipsis={<span>...<span className="color-blue">展开</span></span>} retract={<span className="color-blue">收起</span>} />
                    </div>
                }
                {isShowSend && <div className="reply-pop" onClick={this.sendHandler}>发送</div>}
            </div>
        )
    }
}

export default PopOver
