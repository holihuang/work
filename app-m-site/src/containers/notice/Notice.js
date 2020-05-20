import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import moment from 'moment'
import weixinShare from '@sunl-fe/wechat-tools';
import styles from '../../styles/less/notice.less';
import {url, ua} from '@sunl-fe/util';
import util from '../../common/util';
import FixedTop from '../../components/fixedTop/Index';
import iconUnread from '../../images/icon-unRead.png'

import { Button, Toast, Card, Modal } from 'antd-mobile';
import { GET_GROUP_BATCH_REQUESTED, GET_TEACHER_MSG_DETAIL_REQUESTED, GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_REQUESTED } from '../../constants/notice';

const isWX = ua.isWX();

class Notice extends React.Component {
    static defaultProps = {
        content: ''  // 群发消息内容
    }

    constructor(props) {
        super(props);

        this.getGroupBatch();
    }

    getGroupBatch() {
        // 区分是系统自动发送，还是人工发送，通过路由
        const {route: { path }, dispatch} = this.props;

        let otherParams = url.getParams();
        let {isTeacher = false} = url.getParams();

        // app端推动无意义参数下线，userId在app端仍被需要，转为从JSBridge获取
        if (!otherParams.userId) {
            if (typeof JSBridge !== 'undefined') {
                const userInfo = JSON.parse(JSBridge.getData('userInfo'))
                const { userId } = userInfo
                otherParams.userId = userId
            }
        }

        if (/notice/.test(path)) {
            let {groupId} = this.props.params;
            dispatch({
                type: isTeacher ? GET_TEACHER_MSG_DETAIL_REQUESTED : GET_GROUP_BATCH_REQUESTED,
                params: {
                    groupId,
                    channelCode: 'CS_BACKGROUND',
                    ...otherParams
                }
            });
        } else if (/systemNotice/.test(path)) {
            let {sysMessageId} = this.props.params;
            dispatch({
                type: GET_SYS_MSG_DETAIL_BY_SYS_MSG_ID_REQUESTED,
                params: {
                    messageId: sysMessageId,
                    channelCode: 'CS_BACKGROUND',
                    ...otherParams
                }
            });
        }
    }

    strToDomTree(str) {
        const nodeToTree = function (node, obj) {
            obj.node = node.nodeName;
            if (node.nodeType === 3) {
                // text node
                obj.value = node.nodeValue;
            }

            if (node.nodeName.toUpperCase() === 'IMG') {
                // 图片
                obj.isImg = true;
                obj.src = node.getAttribute('src');
                if (/emotion-small/.test(obj.src)) {
                    obj.isEmotion = true;
                }
            }

            if (node.nodeName.toUpperCase() === 'A') {
                // 链接
                obj.isLink = true;
                obj.href = node.getAttribute('href');
            }

            obj.child = [];
            if (node.attributes) {
                for (var t = 0, tl = node.attributes.length; t < tl; t++) {
                    if (node.attributes[t].name === 'style') {
                        // 针对历史数据，过滤样式中的font-size
                        if (node.attributes[t].value) {
                            if (obj.style) {
                                obj.style = node.attributes[t].value.replace(/font-size:\s*?\S*?;/ig, '') + obj.style
                            } else {
                                obj.style = node.attributes[t].value.replace(/font-size:\s*?\S*?;/ig, '')
                            }
                        }
                    } else if (node.attributes[t].name === 'color') {
                        if (node.attributes[t].value) {
                            if (obj.style) {
                                obj.style = `color: ${node.attributes[t].value};` + obj.style
                            } else {
                                obj.style = `color: ${node.attributes[t].value};`
                            }
                        }    
                    }
                }

                obj.style = obj.style || '';
            }
            if (node.childNodes) {
                for (var i = 0, len = node.childNodes.length; i < len; i++) {
                    obj.child[i] = {};
                    nodeToTree(node.childNodes[i], obj.child[i]);
                }
            }
        }

        const obj = {};
        const div = document.createElement('div');
        div.innerHTML = str;

        nodeToTree(div, obj);

        return obj;
    }

    domTreeToStr(tree) {
        const treeToArray = function (array, tree) {
            if (!tree.child) {
                return;
            }
            for (var n = 0, m = tree.child.length; n < m; n++) {
                if (tree.child[n].node === '#text') {
                    // 对于textnode，匹配其中的链接
                    let text = tree.child[n].value;
                    const urlArr = util.testUrl(text);

                    if (urlArr) {
                        // 判断每个链接外层是否有a标签
                        for (let i = 0, len = urlArr.length; i < len; i++) {
                            // 是否是图片
                            let ext = urlArr[i].substr(urlArr[i].length - 4, 4);
                            if (ext.toLowerCase() == '.jpg' ||
                                ext.toLowerCase() == '.png' ||
                                ext.toLowerCase() == '.gif' ||
                                ext.toLowerCase() == '.bmp') {
                                // img
                                continue;
                            }

							const encodeUrlCnt = urlArr[i].replace(/&/g, '&amp;')

							// 加a标签
							text = text.replace(urlArr[i], `<a href="${urlArr[i]}" target="_blank">${encodeUrlCnt}</a>`);
                        }
                    }
                    rs.push(text);
                    continue;
                } else if (tree.child[n].isImg) {
                    var src = tree.child[n].src;
                    if (tree.child[n].isEmotion) {
                        rs.push(`<img src="${src}" class="${styles['img-emotion']}">`);
                    } else {
                        rs.push(`<img src="${src}" class="${styles.img}">`);
                    }
                    continue;
                } else {
                    const node = tree.child[n].node.toLowerCase();
                    if (tree.child[n].isLink) {
                        const href = tree.child[n].href;
                        rs.push(`<${node} href="${href}" style="${tree.child[n].style}">`);
                    } else {
                        rs.push(`<${node} style="${tree.child[n].style}">`)
                    }
                    treeToArray(rs, tree.child[n]);
                    rs.push(`</${node}>`);
                }
            }
        }

        const rs = [];
        treeToArray(rs, tree);

        return rs.join('');
    }

    getNodeText(node) {
        var rs = [];
        if (node.nodeName == 'P' || node.nodeName == 'DIV' || node.nodeName == 'BR') {
            // 如果块级元素只有一个子节点，且该字节为br，则移除该子节点
            if (node.children && node.children.length == 1) {
                if (node.children[0].nodeName == 'BR') {
                    node.removeChild(node.children[0]);
                }
            }
            rs.push('\r\n');
        }

        if (node.nodeName == 'IMG') {
            let imgUrl = node.getAttribute('src');
            rs.push(`<img src=${imgUrl} class="${styles.img}">`);
        }

        if (node.nodeName == 'A') {
            let link = node.getAttribute('href');
            let aChildNodes = node.childNodes;
            let text = [];
            if (aChildNodes) {
                for (let aK = 0, aN = aChildNodes.length; aK < aN; aK++) {
                    text.push(this.getNodeText(aChildNodes[aK]));
                }
            }

            text = text.join(',');

            // 判断是否是规则的url
            if (util.testUrl(link)) {
                rs.push(`<a href="${link}" target="_blank">${text}</a>`);
            } else {
                rs.push(`${text}`)
            }
        }

        if (node.nodeType == 3) { // textnode
            // 对于textnode，匹配其中的链接
            let text = node.nodeValue;

            var urlArr = util.testUrl(text);

            if (urlArr) {
                // 判断每个链接外层是否有a标签
                for (let i = 0, len = urlArr.length; i < len; i++) {
                    // 是否是图片
                    let ext = urlArr[i].substr(urlArr[i].length - 4, 4);
                    if (ext.toLowerCase() == '.jpg' ||
                        ext.toLowerCase() == '.png' ||
                        ext.toLowerCase() == '.gif' ||
                        ext.toLowerCase() == '.bmp') {
                        // img
                        continue;
                    }

                    // 加a标签
                    text = text.replace(urlArr[i], `<a href="${urlArr[i]}" target="_blank">${urlArr[i]}</a>`);
                }
            }

            rs.push(text);
        }

        var childNodes = (node.nodeName != 'A') && (node.nodeName != 'STYLE') && node.childNodes;

        if (childNodes) {
            for (var i = 0, len = childNodes.length; i < len; i++) {
                rs.push(this.getNodeText(childNodes[i]));
            }
        }

        return rs.join('');
    }

    formatContent(content = '') {
        let rs = this.domTreeToStr(this.strToDomTree(content));
        return {
            __html: rs
        }
    }

    // 设置app分享
    componentDidUpdate() {
        let {title, batchAbstract} = this.props;
        title = '通知详情'
        if (isWX) {
            weixinShare({
                title: title,
                desc: batchAbstract
            });
        } else {
            if (typeof window.JSBridge !== 'undefined') {
                //JSBridge.doAction('setShareContent', JSON.stringify({}), JSON.stringify({
                //    title: title, // 标题
                //    content: batchAbstract // 内容
                //}));
                JSBridge.doAction('actionSetTitle', '{}', JSON.stringify({
                    title: title
                }))
                JSBridge.doAction('hideShareButton', JSON.stringify({}), JSON.stringify({}))
            }
        }
    }

    render() {
        const { messagePublishTime, title = '', secondProj = '', showOptTips } = this.props;
        return (
            <div className={styles['content-wrapper']}>
                {
                    isWX ? <FixedTop pagedetail='webview' param={encodeURIComponent(location.href)}/> : null
                }
                {
                    showOptTips
                    ? <div style={{
                        padding: '10px',
                    }}>
                        您是非付费用户，暂时无法查看班主任通知
                    </div>
                    : <div>
                        {
                            /*url.getParams().isTeacher ? <p className={styles.detail}>{messagePublishTime}</p> :
                                <div className={styles.title}>{title}</div>*/
                            <div className={styles.title}>{title}</div>
                        }
                        <div className={styles['sys_wrapper']}>
                            <img className={styles['sys_img']} src={iconUnread} alt="icon" />
                            <span className={styles['sys_itm']}>{secondProj.length ? secondProj : '尚德机构'}</span>
                            <span className={styles['sys_time']}>{moment(messagePublishTime).format('YYYY-MM-DD HH:mm')}</span>
                        </div>
                        {
                            this.props.content && <div className={styles.detail}
                                                    dangerouslySetInnerHTML={this.formatContent(this.props.content)}></div>
                        }
                    </div>
                }

            </div>
        );
    }
}

const getNotice = (state) => {
    return state.notice;
}
const selectors = createSelector(
    [getNotice],
    (notice) => {
        return {...notice};
    }
)

export default connect(selectors)(Notice);
