import {service} from '../../common/service';
import {common} from '../../common/common';
import {Dialog} from '../../components/dialog/index';
import {Pager} from '../../components/pager/index';
import {Items} from './items/index';

var template = require('./tpl.html');
var addTpl = require('./dialogTpl/add.html');
var headTpl = require('./headTpl.html');

const PAGE_SIZE = 10;

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var FirstBoardAndCollege = Backbone.View.extend({

    initialize: function(options) {
        let {id,name,associateCollegeId} = options;
        this.model = new Model();
        this.model.set({id,name,associateCollegeId});
        this.render();
        this.listenTo(this.model, 'change:resultList', this.renderTableData);
        this.listenTo(this.model, 'change:notAssociateCollege', this.renderHeader);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.listenTo(this.model, 'change:pageNo', this.renderPager);
        this.getTableData();
        this.getNotAssociateCollege();
    },

    events: {
        'click #addFirstBoardBtn': 'addSecBoard'  //新建二级版块
    },

    //获取一级版块数据
    getTableData(options) {
        let { id } = this.model.toJSON()
        let pageSize = PAGE_SIZE;
        let pageNo = 1;
        if (options) {
            pageSize = options.pageSize;
            pageNo = options.pageNo;
        }
        var params = {
            userAccount: common.getUserInfo().userAccount,
            pageSize,
            pageNo,
            albumParentId:id,
        }
        service.getChildAlbumByParentId(params, (response) => {
            if (response.rs) {
                // let resultList = response.resultMessage.resultList;
                // this.model.set({resultList});
                var {resultList, countPerPage, pageIndex, pageCount} = response.resultMessage;
                this.model.set({
                    resultList,
                    pageSize: countPerPage,
                    pageNo: pageIndex,
                    pageCount
                });
            } else {
                alert(response.rsdesp);
            }
        })
    },

    renderPager() {
        var {pageCount, pageSize, pageNo} = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({el: this.$el.find('#pagerContainer')[0], pageCount, pageNo, pageSize, onChange: this.getTableData.bind(this)});
    },

    //渲染表格数据
    renderTableData() {
        var { resultList, id, associateCollegeId, pageSize, pageNo} = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({el: this.$el.find('tbody')[0], resultList, id, associateCollegeId, pageSize, pageNo});

        //页面滚动到顶部
        $('body').scrollTop(0);
    },

    // 未关联
    getNotAssociateCollege() {
        let { associateCollegeId } = this.model.toJSON();
        var params = {
            // "channelCode": "类型:String 说明:渠道码",
            // "associateCollegeId": "类型:Number 说明:一级版块关联的企业家学院id"
            channelCode: 'CS_BACKGROUND',
            associateCollegeId: associateCollegeId,
        }
        service.notAssociateSecProject(params, (response) => {
            if (response.rs) {
                let notAssociateCollege = response.resultMessage;
                let notAssociateCollegeLen = notAssociateCollege.length || 0
                this.model.set({notAssociateCollege, notAssociateCollegeLen});
            } else {
                alert(response.rsdesp);
            }
        })
    },
    
    // 渲染未关联
    renderHeader() {
        this.$el.find('.notAssociateCollege').html(headTpl(this.model.toJSON()))
    },

    //新增二级版块
    addSecBoard: function() {
        var that = this;

        var d = new Dialog({
            title: '新增二级版块',
            content: addTpl(),
            type: 2,
            hasUploadPicBtn: true,
            uploadArr: [
                // {
                //     uploadPicBtnId: 'file',
                //     imgUrlHolder: 'albumIcon',
                //     fileNameHolder: 'fileName',
                //     imgHolder: 'albumIconHolder'
                // },
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
                if (!albumName) {
                    alert('请输入版块名称!');
                    return;
                }
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
                var albumParentId = that.model.toJSON().id
                params.albumParentId = albumParentId
                service.createChildAlbumSec(params, $.proxy(function(response) {
                    if (response.rs) {
                        alert('添加成功！');
                        that.getTableData(); //刷新数据
                        this.closeDialog();
                    } else {
                        alert(response.rsdesp);
                    }
                }, this));
            }
        })
    },
  
    render: function() {
        this.$el.html(template(this.model.toJSON()));
    }
})

export {FirstBoardAndCollege};