import React from 'react';
import {gotoApp} from '@sunl-fe/app-link';
import styles from '../../styles/less/goFollow.less';
import classNames from 'classnames';
import {envCfg} from '../../common/envCfg';
import {url} from '@sunl-fe/util';

const logo = require('../../images/logo.png');

class GoFollow extends React.Component {

    constructor(props) {
        super(props)

        this.openApp = this.openApp.bind(this);
    }

    openApp() {
        const obj = {};

        const {userid} = url.getParams();

        userid && (obj.userid = userid);

        const {pagedetail, param} = this.props;

        obj.pagedetail = pagedetail;
        obj.param = param;

        if (pagedetail === 'schoolvideo') {
            const {videotype, videourl} = this.props;
            obj.videotype = videotype;
            obj.videourl = videourl;
        }

        gotoApp(obj, {
            clickCallback: () => {
                const opt = location.hash.split('/');
                window._hmt && _hmt.push(['_trackEvent', 'getMore', 'click', opt[0], opt[1]]);
            },
            test: envCfg.mlinkTest
        })
    }

    render() {
        return (
            <div className={styles['user-info-panel-right--Unconcerned']} onClick={this.openApp}></div>
        )
    }
}

export default GoFollow;
