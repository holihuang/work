import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd'
import noop from 'lodash/noop'
import util from 'common/util'
import { chatInfoModelUtil } from '../../chatInfo'

class AnswerList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    handleItemClick = item => _ => {
        const { callback, dispatch, answerList } = this.props
        callback(item)
        dispatch('destroy', 'select')
        dispatch('logPublic', item.content)
        util.slog('question_assist_item_click', {
            content: item.content,
            question: answerList.content,
            consultId: chatInfoModelUtil.model.get('activeChatInfo').messageList[0].consultId,
        })
    };

    handleClose = _ => {
        const { dispatch, answerList } = this.props
        // 老师未选择智能回复内容
        util.slog('question_assist_unclick', {
            question: answerList.content,
            consultId: chatInfoModelUtil.model.get('activeChatInfo').messageList[0].consultId,
        })

        dispatch('destroy', 'close')
    };

    render() {
        const { answerList, isShowAssist } = this.props
        const { assistList, content } = answerList || {}
        // 触发问答辅助时输入框中的内容
        return (
            <div>
                {isShowAssist && assistList && assistList.length > 0 ? (
                    <div className="question-assist-wrap">
                        <span className="question-assist-bot" />
                        <span className="question-assist-top" />
                        <Icon
                            onClick={this.handleClose}
                            style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                            }}
                            type="close"
                            size="large"
                        />
                        <div className="assist-title-wrap">
                            <p className="question-assist-title">
                                <span style={{ color: '#333' }}>学员：</span>
                                {content}
                            </p>
                        </div>

                        <ul className="question-assist-list">
                            {assistList.map(item => (
                                <li onClick={this.handleItemClick(item)}>
                                    {item.content}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        )
    }
}

AnswerList.defaultProps = {
    answerList: {
        assistList: [],
        content: '',
    },
    callback: noop(),
    isShowAssist: false,
}

AnswerList.propTypes = {
    answerList: PropTypes.shape({
        assistList: PropTypes.array,
        content: PropTypes.string,
    }),
    callback: PropTypes.func,
    isShowAssist: PropTypes.bool,
}

export default AnswerList
