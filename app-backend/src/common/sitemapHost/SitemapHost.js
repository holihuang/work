import React from 'react'
import ReactDom from 'react-dom'

import {common} from '../common';
import LeftNav from 'src/common/leftNav/leftNav'

var template = require('./SitemapHost.html');

var Model = Backbone.Model.extend({
});

var SitemapHost = Backbone.View.extend({
    el: "#sitemapHost",

    initialize(options) {
        var userInfo = common.getUserInfo();
        var siteMap = JSON.parse(userInfo.siteMap);
        this.model = new Model(siteMap);
        //this.listenTo(this.model, "change", this.render);
        //this.model.set(this.getActiveClass(location.hash));
        this.render();
    },

    events: {
        'click dd': 'handleClick',
        'click dt': 'toggleFold',
        'click #toggleSitemapBtn': 'toggleSitemap'
    },

    handleClick(e){
        this.$el.find('.active').removeClass('active');
        $(e.currentTarget).addClass('active');
    },

    toggleFold(e) {
        $(e.currentTarget).toggleClass('fold');
        $(e.currentTarget).parent().toggleClass('dl-fold');
        if (!$(e.currentTarget).parent().hasClass('dl-fold')) {
            $(e.currentTarget).parent().siblings().addClass('dl-fold');
            $(e.currentTarget).parent().siblings().find('dt').removeClass('fold');
        }
    },

    toggleSitemap(e) {
        $('#sitemapHost').toggleClass('hide-left-nav');
        $('#main').toggleClass('show-full-main-right');
        $(e.currentTarget).toggleClass('sitemap-fold');
    },

    getActiveClass(hash){
        var rs = {
            homeActiveClass: '',
            detailActiveClass: '',
            aboutActiveClass: ''
        };
        var activeClass = 'active';
        if(hash.startsWith('#home')){
            rs.homeActiveClass = activeClass;
        }
        else if(hash.startsWith('#detail')){
            rs.detailActiveClass = activeClass;
        }
        else if(hash.startsWith('#about')){
            rs.aboutActiveClass = activeClass;
        }
        else{
            rs.homeActiveClass = activeClass;
        }
        return rs;
    },

    format(data) {
        var {siteMap} = data;
        var activeHash = location.hash;
        if (activeHash.indexOf('/') != -1) {
            activeHash = activeHash.substr(0, activeHash.indexOf('/'));
        }
        siteMap.forEach((item, index) => {
            let itemTitle = item.nodeListTitle;
            switch (itemTitle) {
                case '内容管理':
                    item.nodeClass = 'content-title';
                    break;
                case '社区管理':
                    item.nodeClass = 'community-title';
                    break;
                case '班主任管理':
                    item.nodeClass = 'teacher-title';
                    break;
                case '消息管理':
                    item.nodeClass = 'message-title';
                    break;
                case '权限管理':
                    item.nodeClass = 'authority-title';
                    break;
                case '敏感词管理':
                    item.nodeClass = 'sensitive-words-manage-title';
                    break;
                case '值班老师管理':
                    item.nodeClass = 'duty-teacher-title';
                    break;
                case '客诉老师管理':
                    item.nodeClass = 'after-teacher-title';
                    break;
                case '话题管理':
                    item.nodeClass = 'topic-title';
                    break;
                case '群聊管理':
                    item.nodeClass = 'group-talk-title';
                    break;
                case '信息通道':
                    item.nodeClass = 'msg-channel-title';
                    break;
                default:
                    item.nodeClass = 'content-title';
                    break;
            }

            item.foldClass = 'dl-fold';
            item.nodeFoldClass = '';

            let nodeList = item.nodeList;
            nodeList.forEach((node) => {
                if (node.hash === activeHash) {
                    node.activeHashClass = 'active';
                    item.foldClass = '';
                    item.nodeFoldClass = 'fold';
                }
                if (node.hash === '#myConversation') {
                    //我的会话
                    node.id = 'myConversation';
                }
                if (node.hash === '#myGroupTalk') {
                    node.id = 'myGroupTalkLink';
                }
                if (node.hash === '#subject') {
                    node.id = 'subjectLink';
                }
            })
        })
        return {siteMap}
    },
    initLeftNavReact() {
        const that = this
        // 页面加载直接渲染leftNav react 组件
        const props = {
            ...this.model.toJSON(), // 获取model中的所有数据
            // dispatch: (name = '', evt = {}) => {
            //     if(that[name]) {
            //         that[name](evt)
            //     }else {
            //         console.warn(`方法name不存在`)
            //     }
            // },
            // getDefaultParams: this.getDefaultParams,
            // sendMessage: this.sendMessage,
            // onClick: this.onClick,
            // generateKey: this.generateKey,
        }
        ReactDom.render(
            <LeftNav {...props} />,
            document.getElementById('sitemapHost'),
        )
    },
    // render() {
    //     var data = this.format(this.model.toJSON());
    //     this.$el.html(template(data));
    // }
    render() {
        var data = this.format(this.model.toJSON());
        this.initLeftNavReact()
    }
});

export { SitemapHost };
