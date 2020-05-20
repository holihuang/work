import React from 'react';
import { appLinkDom } from '@sunl-fe/app-link';
import styles from '../../styles/less/footer.less';
import classNames from 'classnames';

const logo = require('../../images/logo.png');

class Footer extends React.Component {

    constructor(props) {
        super(props)

        this.openApp = this.openApp.bind(this);
    }

    componentDidMount() {
        this.renderAppLinkDom();
    }

    componentDidUpdate() {
        this.renderAppLinkDom();
    }

    renderAppLinkDom() {
        if (this.refs.div && !this.refs.div.children.length) {
            if (this.props.paramValue) {
                this.refs.div.appendChild(appLinkDom({ [this.props.paramName]: this.props.paramValue }));
            } else {
                this.refs.div.appendChild(appLinkDom());
            }
        }
    }

    openApp() {
        const ua = navigator.userAgent.toLowerCase();
        
        if (/iphone|ipad|ipod/.test(ua)) {
            location.href = `https://face.sunlands.com/user_center/mobileApk/transfer.html?${this.props.paramName}=${this.props.paramValue}`
            // location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.sunland.app';
        } else if (/android/.test(ua)) {
            location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.sunland.app';
        }
    }

    render() {
        return (
            <div className={styles['wrapper']} ref="div">
                
            </div>
        )
    }
}

export default Footer;
