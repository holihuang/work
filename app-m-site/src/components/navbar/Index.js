import React from 'react';
import styles from '../../styles/less/topics.less';
import classNames from 'classnames';

class Navbar extends React.Component {
    createNavs() {
        const {navs, handleClickCallback} = this.props;
        
        let navsHtml = navs.map((item) => {
            let textClass = item.active ? 'nav-text--active' : 'nav-text';
            
            return (
                <li className={styles['nav-item']} onClick={() => handleClickCallback(item.type)}>
                    <div className={styles['nav-item-inner']}>
                        <span className={styles[textClass]}>{item.name}</span>
                    </div>
                </li>
            )
        })

        return navsHtml;
    }

    render() {
        let {isNavbarFixed} = this.props;
        let navClass = isNavbarFixed ? classNames(styles['nav'], styles['nav--fixed']) : classNames(styles['nav']);
        return (
            <ul className={navClass}>
                {this.createNavs()}
            </ul>
        )
    }
}

export default Navbar;