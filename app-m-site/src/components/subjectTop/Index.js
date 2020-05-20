import React from 'react';
import Truncate from '../truncate/Truncate.CommonJS';

import styles from '../../styles/less/subject.less';
import classNames from 'classnames';
import util from '../../common/util';
import { link_blue } from '../../styles/less/common.less';

class SubjectTop extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOverflow: false,
            shouldShowAll: false
        }

        this.showAll = this.showAll.bind(this);
    }

    componentDidUpdate() {
        // let {shouldShowAll, isOverflow} = this.state;

        // if (this.refs.brief.clientHeight > 170) {
        //     if (!shouldShowAll && !isOverflow) {
        //         this.setState({
        //             isOverflow: true
        //         });
        //     }
        // }  
    }

    checkHeight() {
        let ele = document.createElement('div')

    }

    showAll() {
        this.setState({
            isOverflow: false,
            shouldShowAll: true
        })
    }

    render() {
        let {
            subjectName,
            subjectAbstract,
            subjectImageUrl,
        } = this.props.subjectDetail;

        subjectImageUrl = subjectImageUrl || './images/subject-default@3x.png';
        //将链接转换为a标签
        subjectAbstract = util.replaceLinkText(subjectAbstract, link_blue);
        const {shouldShowAll} = this.state;
        const overflowClass = classNames(styles['topic-brief'], styles['topic-brief--overflow']);
        return (
            <div className={styles['top-wrap']}>
                <img src={subjectImageUrl} className={styles['subject-img']}/>
                <h1 className={styles['top-title']}>{subjectName}</h1>
                <div  className={styles['top-content']}>
                    {
                        shouldShowAll ? 
                        <div dangerouslySetInnerHTML={{__html: subjectAbstract}}></div> :
                        <Truncate lines={3} ellipsis={<span>... <a className={styles['show-all']} onClick={this.showAll}>显示全部</a></span>}>
                                {subjectAbstract || ' '}
                        </Truncate>
                    }
                </div>
            </div>
        )
    }
}

export default SubjectTop