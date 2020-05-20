import React from 'react';
import styles from '../../styles/less/topics.less';
import classNames from 'classnames';
import util from '../../common/util';
import { link_blue } from '../../styles/less/common.less';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOverflow: false,
            shouldShowAll: false
        }

        this.showAll = this.showAll.bind(this);
    }

    componentDidUpdate() {
        let {shouldShowAll, isOverflow} = this.state;

        if (this.refs.brief.clientHeight > 170) {
            if (!shouldShowAll && !isOverflow) {
                this.setState({
                    isOverflow: true
                });
            }
        }  
    }

    showAll() {
        this.setState({
            isOverflow: false,
            shouldShowAll: true
        })
    }

    render() {
        let {
            topicTitle,
            topicBrief,
            mediaLinks,
            discussCount
        } = this.props;

        mediaLinks = mediaLinks || './images/topic-default.jpg';
        //将链接转换为a标签
        topicBrief = util.replaceLinkText(topicBrief, link_blue);

        const {isOverflow} = this.state;
        const overflowClass = classNames(styles['topic-brief'], styles['topic-brief--overflow']);
        return (
            <div ref='abc'>
                <div className={styles['bg-panel']}>
                    <img src={mediaLinks} className={styles['bg-img']}/>
                    <div className={styles['bg-img-mask']}></div>
                    <div className={styles['topic-info']}>
                        <img src={mediaLinks} className={styles['topic-img']}/>
                        <h1 className={styles['topic-title']}>#{topicTitle}#</h1>
                        <p className={styles['tip']}>{discussCount}人参与讨论</p>
                    </div>
                </div>
                {
                    isOverflow ? (
                        <div>
                            <div ref="brief" className={overflowClass} dangerouslySetInnerHTML={{__html: topicBrief}}>
                                
                            </div>
                            <div className={styles['more']} onClick={this.showAll}>
                                <i className={styles['icon--more']}></i>
                                更多
                            </div>
                        </div>
                    ) : (
                        <div ref="brief" className={styles['topic-brief']} dangerouslySetInnerHTML={{__html: topicBrief}}></div>
                    )
                }
            </div>
        )
    }
}

export default Header