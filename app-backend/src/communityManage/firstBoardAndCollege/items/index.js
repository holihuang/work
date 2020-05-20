import {service} from '../../../common/service';
import {common} from '../../../common/common';
import {Dialog} from '../../../components/dialog/index';

var tpl = require('./tpl.html');
var updateTpl = require('../dialogTpl/update.html');
var logTpl = require('../dialogTpl/log.html');
var headTpl = require('../headTpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        
    }
})

var Items = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set({
            resultList: options.resultList,
            id: options.id,
            pageSize: options.pageSize,
            pageNo: options.pageNo,
            associateCollegeId: options.associateCollegeId,
        });
        this.getNotAssociateCollege();
    },

    events: {
        'click .update': 'update',  //更新版面信息
        'click .my-show': 'showBoard',  //显示版面
        'click .my-hide': 'hideBoard',  //隐藏版面
        'click .my-delete': 'deleteBoard',  //删除版面
        'click .item-delete': 'deleteLink',  //删除关联
        'click .item-add': 'addLink',  //点击新增关联
        'click .item-cancel': 'cancelLink',
        'click .item-save': 'saveLink',
        'click .my-log': 'showLog',  //查看日志
    },

    // 查看日志
    showLog(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var albumId = resultList[index].albumId;
        var params = {
            albumId,
            type: 2,
            channelCode: 'CS_BACKGROUND',
            
        };
        service.listAlbumOperateLog(params, (response) => {
            if (response.rs) {
                var logList = response.resultMessage;
                this.showLogRender(logList)
            } else {
                alert('获取日志失败，请稍后再试！');
            }
        })
    },

    // 渲染日志
    showLogRender(logList) {
        let data = { logList }
        var d = new Dialog({
            title: '日志',
            type: 2,
            content: logTpl(data),
            ok: function() {
                this.closeDialog();
            }
        })
    },

    //更新版面
    update(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var itemModel = resultList[index];
        itemModel.albumShowChecked = itemModel.albumIsInner ? '' : 'checked';
        itemModel.albumHideChecked = itemModel.albumIsInner ? 'checked' : '';
        itemModel.agencyShowChecked = itemModel.isAgencyShow ? 'checked' : '';
        itemModel.agencyHideChecked = itemModel.isAgencyShow ? '' : 'checked';

        var that = this;

        var d = new Dialog({
            title: '更新二级版块',
            type: 2,
            content: updateTpl(itemModel),
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
                var params = common.getFormData({formId: 'form'});

                var albumName = $('#albumName').val();
                if (!albumName) {
                    alert('请填写版块名称！');
                    return;
                }
                if (albumName.length > 10) {
                    alert('版块名称在10个汉字以内！');
                    return false;
                }

                //版块介绍
                // var albumDesp = $('#albumDesp').val();
                // if (albumDesp.length > 8) {
                //     alert('版块介绍限定8个字！');
                //     return;
                // }

                var agencyDesp = $('#agencyDesp').val();
                if (!agencyDesp) {
                    alert('请填写专业简介！');
                    return;
                }
                if (agencyDesp.length > 200) {
                    alert('专业简介不能超过200字！');
                    return;
                }

                service.updateChildAlbumSec(params, $.proxy(function(response) {
                    if (response.rs) {
                        alert("更新成功！");
                        that.getTableData();
                        this.closeDialog();
                    } else {
                        // alert('更新失败！');
                        alert(response.rsdesp);
                    }
                }, this));
            }
        })
    },

    showBoard: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var albumId = resultList[index].albumId;

        if(confirm('确定显示该版块吗？')) {
            this.boardDisplay(0, albumId);
        }
    },

    hideBoard: function(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var albumId = resultList[index].albumId;

        if(confirm('确定隐藏该版块吗？')) {
            this.boardDisplay(1, albumId);
        }
    },

    boardDisplay: function(albumIsInner, albumId) {

        var params = {
                albumIsInner,
                albumId
            };

        service.updateChildAlbumSec(params, (response) => {
            if (response.rs) {
                alert('操作成功!');
                this.getTableData();
            } else {
                alert('操作失败，请稍后再试！');
            }
        })
    },

    //删除版面
    deleteBoard(e) {
        if(confirm('确定删除该版块吗？')) {
            let index = $(e.currentTarget).attr('index');
            let {resultList} = this.model.toJSON();
            let albumId = resultList[index].albumId;
            let userAccount = window.userInfo.userAccount
            var params = {
                // "channelCode": "类型:String 说明:渠道码",
                // "albumId": "类型:Number 说明:二级版块id",
                // "userAccount": "类型:String 说明:用户的263账号"
                channelCode: 'CS_BACKGROUND',
                userAccount,
                albumId,
            };

            service.deleteChildAlbumSec(params, (response) => {
                if (response.rs) {
                    alert('操作成功');
                    this.getTableData();
                } else {
                    alert('操作失败，请稍后再试！');
                }
            })
        }
    },

    // 删除关联
    deleteLink(e) {
        if(confirm('确定删除该关联吗？')) {
            let id = $(e.currentTarget).attr('id');
            let index = $(e.currentTarget).attr('index');
            let {resultList} = this.model.toJSON();
            let albumId = resultList[index].albumId;
            let userAccount = window.userInfo.userAccount
            var params = {
                // "id": "类型:Number 说明:主键id",
                // "channelCode": "类型:String 说明:渠道码",
                // "albumId": "类型:Number 说明:二级版块的id",
                // "userAccount": "类型:String 说明:用户的263账号"
                channelCode: 'CS_BACKGROUND',
                userAccount,
                albumId,
                id,
            };
            
            service.adminDelAssociateSecProject(params, (response) => {
                if (response.rs) {
                    alert('操作成功');
                    this.getTableData();
                } else {
                    alert('操作失败，请稍后再试！');
                }
            })
        }
    },

    // 新增关联
    addLink(e) {
        var that = this
        var dom = $(e.currentTarget).parents('tr')
        dom.find('.link-add').slideDown();

        // 处理学院
        let id;
        service.listAllCollegeSec({},(response) => {
            if (response.rs) {
                let optionList = response.resultMessage
                id = optionList[0].id
                let selectDom = dom.find('.link-add .link-college');
                selectDom.empty();
                if (optionList.length) {
                    optionList.forEach((item,index) => {
                        let $option = $('<option value='+item.id+'##'+item.value+'>'+item.value+'</option>');
                        selectDom.append($option);
                    })
                }
                selectDom.off().bind('change',that.changeSecProject);

                // 处理二级项目
                var params = {
                    channelCode: 'CS_BACKGROUND',
                    associateCollegeId: id,
                }
                service.notAssociateSecProject(params, (response) => {
                    if (response.rs) {
                        let optionList = response.resultMessage;
                        let selectDom = dom.find('.link-add .link-secProject');
                        selectDom.empty();
                        if (optionList.length) {
                            optionList.forEach((item,index) => {
                                let $option = $('<option value='+item.id+'##'+item.value+'>'+item.value+'</option>');
                                selectDom.append($option);
                            })
                        }
                    } else {
                        alert('获取二级项目备选项失败！');
                    }
                })
            } else {
                alert('获取学院备选项失败！');
            }
        })
        
    },

    changeSecProject(e) {
        var dom = $(e.currentTarget).parents('tr')
        let id = $(e.currentTarget).val().split('##')[0]
        // 处理二级项目
        var params = {
            channelCode: 'CS_BACKGROUND',
            associateCollegeId: id,
        }
        service.notAssociateSecProject(params, (response) => {
            if (response.rs) {
                let optionList = response.resultMessage;
                let selectDom = dom.find('.link-add .link-secProject');
                selectDom.empty();
                if (optionList.length) {
                    optionList.forEach((item,index) => {
                        let $option = $('<option value='+item.id+'##'+item.value+'>'+item.value+'</option>');
                        selectDom.append($option);
                    })
                }
            } else {
                alert('获取二级项目备选项失败！');
            }
        })
    },

    // 取消新增关联
    cancelLink(e) {
        var dom = $(e.currentTarget).parents('tr')
        dom.find('.link-add').slideUp();
    },

    // 保存关联
    saveLink(e) {
        var dom = $(e.currentTarget).parents('tr')
        let index = $(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        let secAlbumId = resultList[index].albumId;
        let secProjectItem = dom.find('.link-add .link-secProject').val();
        let collegeItem = dom.find('.link-add .link-college').val();
        // "userAccount": "类型:String 说明:用户263账号",
        // "collegeId": "类型:Number 说明:学院id",
        // "collegeName": "类型:String 说明:学院名称",
        // "secProjectId": "类型:Number 说明:二级项目id",
        // "secProjectName": "类型:String 说明:二级项目名称",
        // "secAlbumId": "类型:Number 说明:二级板块id",
        // "channelCode": "类型:String 说明:渠道码"
        if(secProjectItem && collegeItem){
            let collegeId = collegeItem.split('##')[0]
            let collegeName = collegeItem.split('##')[1]
            let secProjectId = secProjectItem.split('##')[0]
            let secProjectName = secProjectItem.split('##')[1]
            var params = {
                userAccount: common.getUserInfo().userAccount,
                secAlbumId,
                channelCode:'CS_BACKGROUND',
                collegeId,
                collegeName,
                secProjectId,
                secProjectName,
            }
            service.adminAddAssociateSecProject(params, (response) => {
                if (response.rs) {
                    alert('操作成功');
                    this.getTableData();
                } else {
                    alert(response.rsdesp);
                }
            })
        } else {
            alert('学院和二级项目不能为空！')
        }
        
    },

    getTableData() {
        let { id, pageSize, pageNo} = this.model.toJSON()
        var params = {
            userAccount: common.getUserInfo().userAccount,
            pageSize,
            pageNo,
            albumParentId:id,
        }
        service.getChildAlbumByParentId(params, (response) => {
            if (response.rs) {
                let resultList = response.resultMessage.resultList;
                this.model.set({resultList});
            } else {
                alert(response.rsdesp);
            }
        })
        this.getNotAssociateCollege();
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

    format(data) {
        var {resultList} = data;
        resultList.forEach((item, index) => {
            let albumIsInner = item.albumIsInner;
            if (albumIsInner) {
                item.status = '隐藏';
            } else {
                item.status = '显示';
            }
            item.index = index;
        })
        return {resultList}
    },

    render() {
        // 刷新头部
        $('.notAssociateCollege').html(headTpl(this.model.toJSON()))
        // 刷新数据
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}