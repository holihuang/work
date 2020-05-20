import {service} from '../../common/service';
import {common} from '../../common/common';
import {Dialog} from '../../components/dialog/index';
import {Pager} from '../../components/pager/index';
import {Items} from './items/index';

var template = require('./tpl.html');
var addTpl = require('./dialogTpl/add.html');

const PAGE_SIZE = 20;

var Model = Backbone.Model.extend({
    defaults: {}
})

var SecondBoard = Backbone.View.extend({
    
    initialize: function() {
        this.render();
        this.model = new Model();
        this.listenTo(this.model, 'change:resultList', this.renderTableList);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.listenTo(this.model, 'change:pageNo', this.renderPager);

        this.initTableList();
    },

    events: {
        'click #addSecondBoard': 'addSecondBoard'
    },

    initTableList() {
        var userAccount = common.getUserInfo().userAccount;

        var params = {
            pageSize: PAGE_SIZE,
            pageNo: 1,
            userAccount
        };

        service.showAllChildAlbums(params, (response) => {
            if (response.rs) {
                var {resultList, pageCount, countPerPage, pageIndex} = response.resultMessage;
                this.model.set({
                    pageSize: countPerPage,
                    pageNo: pageIndex,
                    resultList, 
                    pageCount});
            } else {
                alert('请求数据失败，请稍后重试');
            }
        })
    },

    getTableData(options) {
        var {pageSize, pageNo} = options;
        var userAccount = common.getUserInfo().userAccount;

        var params = {
            pageSize,
            pageNo,
            userAccount
        };

        service.showAllChildAlbums(params, (response) => {
            if (response.rs) {
                var {resultList, countPerPage, pageIndex, pageCount} = response.resultMessage;
                this.model.set({
                    resultList,
                    pageSize: countPerPage,
                    pageNo: pageIndex,
                    pageCount
                });
            } else {
                alert('请求数据失败，请稍后重试');
            }
        })
    },

    renderTableList() {
        var {resultList, pageSize, pageNo} = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({el: this.$el.find('tbody')[0], resultList, pageSize, pageNo});

        $('body').scrollTop(0);
    },

    renderPager() {
        var {pageCount, pageSize, pageNo} = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({el: this.$el.find('#pagerContainer')[0], pageCount, pageNo, pageSize, onChange: this.getTableData.bind(this)});
    },

    addSecondBoard: function() { //弹出新增窗口
        var that = this;

        var d = new Dialog({
            title: '新建二级版块',
            content: addTpl(),
            type: 2,
            hasUploadPicBtn: true,
            uploadArr: [
                {
                    uploadPicBtnId: 'file',
                    imgUrlHolder: 'albumIcon',
                    fileNameHolder: 'fileName',
                    imgHolder: 'albumIconHolder'
                },
                {
                    uploadPicBtnId: 'uploadAgencyIconBtn',
                    imgUrlHolder: 'agencyIcon',
                    fileNameHolder: 'agencyIconName',
                    imgHolder: 'agencyIconHolder',
                    callback: function(options) {
                        let {width, height} = options; //(750*560)
                        if (width * 56 !== height * 75) {
                            alert('图片请满足750*560的比例');
                            return false;
                        }
                        return true;
                    }
                }
            ],
            ok: function() {
                var params = common.getFormData({
                    formId: 'form'
                })

                var albumName = $('#albumName').val();
                if (albumName.length > 10) {
                    alert('版块名称在10个汉字以内！');
                    return false;
                }

                var agencyName = $('#agencyName').val();
                if (!agencyName) {
                    alert('请输入专业名称!');
                    return;
                }

                //版块介绍
                // var albumDesp = $('#albumDesp').val();
                // if (albumDesp.length > 8) {
                //     alert('版块介绍不能超过8个字！');
                //     return;
                // }

                var agencyDesp = $('#agencyDesp').val();
                if (!agencyDesp) {
                    alert('请填写专业简介');
                    return;
                }
                if (agencyDesp.length > 200) {
                    alert('专业简介不能超过200字！');
                    return;
                }

                service.createNewChildAlbum(params, $.proxy(function(response) {
                    if (response.rs) {
                        alert('添加成功！');
                        that.initTableList(); //刷新数据
                        this.closeDialog();
                    } else {
                        alert(response.rsdesp);
                    }
                }, this));
            }
        })
    },

    render: function() {
        this.$el.html(template());
    }
})

export {SecondBoard};