import React from 'react';
import { appLinkDom } from '@sunl-fe/app-link';
import { url } from '@sunl-fe/util';
import styles from '../../styles/less/fixedTop.less';
import classNames from 'classnames';
import { envCfg } from '../../common/envCfg';

class FixedTop extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.renderAppLinkDom();
    }

    componentDidUpdate() {
        this.renderAppLinkDom();
    }

    renderAppLinkDom() {
        const obj = {};

        const { userid } = url.getParams();

        userid && (obj.userid = userid);

        const {pagedetail, param} = this.props;

        obj.pagedetail = pagedetail;
        obj.param = param;

        if (pagedetail === 'schoolvideo') {
            const {videotype, videourl} = this.props;
            obj.videotype = videotype;
            obj.videourl = videourl;
        }

        const child = this.refs.div.childNodes[0];

        child && this.refs.div.removeChild(child);

        this.refs.div.appendChild(appLinkDom(obj, {
            clickCallback: () => {
                const opt = location.hash.split('/');

                _hmt && _hmt.push(['_trackEvent', 'openApp', 'click', opt[0], opt[1]]);
            },
            test: envCfg.mlinkTest
        }));
    }

    // refresh = () => {
    //     location.reload();
    // }
    
    render() {
        return (
            <div className={styles['wrapper']} ref="div">
            </div>
        )
    }
}

export default FixedTop;
