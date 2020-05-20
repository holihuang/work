import React from 'react'
import PropTypes from 'prop-types'
// import { global } from 'common/global'
// import { clearTimeout } from 'timers'
import { common } from '../../common/common'
import util from '../../common/util'

class SearchRegion extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isClick: false, // eslint-disable-line
        }
    }
    componentDidMount() {
        const { list } = this.props
        if (list.length === 0) {
            this.regionDom.style.display = 'none'
        } else {
            this.regionDom.style.display = 'block'
        }
    }

    componentWillReceiveProps(nextProps) {
        this.regionDom.scrollTo(0, 0)
        // const { isClick } = this.state
        // console.log(nextProps)
        // console.log(this.timer)
        // if (nextProps.list.length === 0 ){
        //     this.regionDom.style.display = 'none'
        // } else {
        //     this.timer && clearTimeout(this.timer)
        //     this.regionDom.style.display = 'table'
        //     if(!isClick) {
        //         this.timer = setTimeout(() => {
        //             this.regionDom.style.display = 'none'
        //         }, 5000)
        //     }
        // }
    }

    // componentWillUnmount() {
    //     this.timer && clearTimeout(this.timer)
    // }
    clickHanlder = item => {
        const { dispatch } = this.props
        // 添加点击事件的埋点
        const { userAccount, userId } = common.getUserInfo()
        // slog: 老师点击智能搜索弹窗中内容
        util.slog('clicked_intelligent_dialog_content', { userId, userAccount, clickedMessageId: item.id })
        this.setState({ isClick: true }, _ => { // eslint-disable-line
            dispatch('backfillHandler', item.quickReplyContent)
            this.regionDom.style.display = 'block'
        })
    }
    renderReplysItem = _ => {
        const { list } = this.props
        return list && list.length > 0 && list.map(item =>
            (
                <div className="replyItem" onClick={() => { this.clickHanlder(item) }}>{item.quickReplyContent}</div>
            ),
        )
    }
    render() {
        return (
            <div style={{ position: 'relative' }}>
                <div className={this.props.list && this.props.list.length > 5 ? 'searchRegionNew' : 'searchRegion'} ref={dom => { this.regionDom = dom }}>
                    {this.renderReplysItem()}
                </div>
                <i className="iconArrow" />
            </div>
        )
    }
}

export default SearchRegion

SearchRegion.propTypes = {
    list: PropTypes.array,
}

SearchRegion.defaultProps = {
    list: [],
}
