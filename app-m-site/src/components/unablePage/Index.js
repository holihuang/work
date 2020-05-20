import React from 'react';
import styles from '../../styles/less/unablePage.less';
import classNames from 'classnames';
import FixedTop from '../../components/fixedTop/Index';

class unablePage extends React.Component {

    render() {
        return (
            <div >
                <FixedTop paramName='postid' paramValue={this.props.params.postMasterId} />
                <div className={styles.container}>
                    <img className={styles['img-delete']} src="./images/post-delete@2x.png" />
                    <p className={styles['text']}>哎呀，你来晚了</p>
                    <p className={styles['text']}>分享的内容已经被取消了</p>
                    <p className={styles['text']}>打开尚德机构APP</p>
                    <p className={styles['text']}>浏览更多精彩内容吧</p>
                </div>
            </div>
        )
    }
}

export default unablePage;