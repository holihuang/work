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
        let notAssociateCollegeLen = 0
        if (options.notAssociateCollege){
            notAssociateCollegeLen = options.notAssociateCollege.length
        }
        this.model.set({
            resultList: options.resultList,
            // notAssociateCollege: options.notAssociateCollege,
            // notAssociateCollegeLen,
        });
        this.getNotAssociateCollege()
    },

    events: {
        'click .update': 'update',  //更新版面信息
        'click .my-show': 'showBoard',  //显示版面
        'click .my-hide': 'hideBoard',  //隐藏版面
        'click .my-delete': 'deleteBoard',  //删除版面
        'click .my-log': 'showLog',
    },

    // 查看日志
    showLog(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var albumId = resultList[index].albumId;
        var params = {
            albumId,
            type: 1,
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
        var { resultList, notAssociateCollege } = this.model.toJSON();
        var itemModel = resultList[index];
        var majors = itemModel.majors;
        if (!majors || !majors.length) {
            //没有专业或者专业为空
            itemModel.majors = new Array(3);  //默认显示3个输入框
        }

        itemModel.agencyShow = itemModel.isAgencyShow ? 'checked' : '';
        itemModel.agencyHide = itemModel.isAgencyShow ? '' : 'checked';
        itemModel.albumShowChecked = itemModel.albumIsInner ? '' : 'checked';
        itemModel.albumHideChecked = itemModel.albumIsInner ? 'checked' : '';
        itemModel.notAssociateCollege = notAssociateCollege;
        itemModel.associateCollegeId = itemModel.associateCollegeId + '_' + itemModel.associateCollegeName;
        var that = this;
        var d = new Dialog({
            title: '编辑一级版面信息',
            content: updateTpl(itemModel),
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
            hasCustomEvents: true,
            dom: '.btn-add-one-input',
            eventsFunc: function() {
                this.$el.find('.input-list').append(`<input class="form-input" type="text" name="majors">`);
            },
            ok: function() {
                var params = common.getFormData({formId: 'form'});

                //字段校验
                var albumName = $('#albumName').val();
                if (albumName.length > 10) {
                    alert('版块名称请限制在10个汉字以内！');
                    return false;
                }

                // var albumDesp = $('#albumDesp').val();
                // if (albumDesp.length > 8) {
                //     alert('版块介绍限定8个字！');
                //     return false;
                // }

                //校验机构号简介字数
                var agencyDesp = $('#agencyDesp').val();
                if (!agencyDesp) {
                    alert('请输入学院简介');
                    return;
                }
                if (agencyDesp.length > 200) {
                    alert('学院简介不能超过200字！');
                    return;
                }

                //获取专业信息majors
                let majors = [],
                    len = $('input[name="majors"]').length;
                for (let i = 0; i < len; i++) {
                    majors.push($('input[name="majors"]')[i].value);
                }
                params.majors = majors;

                let associateCollege = params.associateCollegeId.split('_')
                if (associateCollege.length > 1) {
                    params.associateCollegeId = associateCollege[0]
                    params.associateCollegeName = associateCollege[1]    
                } else {
                    params.associateCollegeId = 0
                    params.associateCollegeName = ''
                }
                service.updateParentAlbum(params, $.proxy(function(response) {
                    if (response.rs) {
                        //刷新列表
                        that.getTableData();
                        alert("更新成功！");
                        this.closeDialog();
                    } else {
                        // alert('更新失败！');
                        alert(response.rsdesp);
                    }
                }, this));
            }
        })

        $('#albumName').on('blur', function() {
            let val = $(this).val();
            $('#agencyName').val(val);
        })
    },

    //显示版面
    showBoard: function(e) {
        if(confirm('确定显示该版块吗？')) {
            let index = $(e.currentTarget).attr('index');
            let {resultList} = this.model.toJSON();
            let albumId = resultList[index].albumId;
            this.boardDisplay(0, albumId);
        }
    },

    //隐藏版面
    hideBoard: function(e) {
        if(confirm('确定隐藏该版块吗？')) {
            let index = $(e.currentTarget).attr('index');
            let {resultList} = this.model.toJSON();
            let albumId = resultList[index].albumId;
            this.boardDisplay(1, albumId);
        }
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
                // "albumId": "类型:Number 说明:一级版块id",
                // "userAccount": "类型:String 说明:用户的263账号"
                channelCode: 'CS_BACKGROUND',
                userAccount,
                albumId,
            };

            service.delParentAlbum(params, (response) => {
                if (response.rs) {
                    alert('操作成功');
                    this.getTableData();
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    boardDisplay: function(albumIsInner, albumId) {
     
        var params = {
                albumIsInner,
                albumId
            };

        service.updateParentAlbum(params, (response) => {
            if (response.rs) {
                alert('操作成功');
                this.getTableData();
            } else {
                alert(response.rsdesp);
            }
        })
    },

    getTableData() {
        //一级版面数据较少，暂时不作分页处理
        var params = {
            userAccount: common.getUserInfo().userAccount,
            pageSize: 100,
            pageNo: 1
        }
        service.showAllParentAlbums(params, (response) => {
            if (response.rs) {
                let resultList = response.resultMessage.resultList;
                this.model.set({resultList});
            } else {
                alert(response.rsdesp);
            }
        })

        // 刷新表格，同时刷新备选项
        this.getNotAssociateCollege();
    },

    // 未关联的一级板块的学院
    getNotAssociateCollege() {
        var params = {
            channelCode: 'CS_BACKGROUND'
        }
        service.notAssociateCollege(params, (response) => {
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
            let associateCollegeName = item.associateCollegeName;
            if (albumIsInner) {
                item.status = '隐藏';
            } else {
                item.status = '显示';
            }
            // 处理关联学院
            if (associateCollegeName) {
                item.associateCollegeName = associateCollegeName
            } else {
                item.associateCollegeName = '无'
            }

            item.index = index;
            // '学习是一种信仰'模块不显示显隐和删除按钮
            item.canHideAndDel = item.albumName === '学习是一种信仰' ? false : true
        })

        return {resultList}
    },

    render() {
        // 更新头部
        $('.notAssociateCollege').html(headTpl(this.model.toJSON()))
        // 刷新数据
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}