import {common} from '../../../common/common';
import {service} from '../../../common/service';
import {Dialog} from '../../../components/dialog/index';

var tpl = require('./tpl.html');
var updateTpl = require('../dialogTpl/update.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Items = Backbone.View.extend({
    initialize: function(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        var {resultList, pageSize, pageNo} = options;
        this.model.set({resultList, pageSize, pageNo});
    },

    events: {
        'click .update': 'update', //更新
        'click .my-show': 'showBoard', //显示版面
        'click .my-hide': 'hideBoard'  //隐藏版面
    },

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
                var params = common.getFormData({formId: 'form'});

                var albumName = $('#albumName').val();
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

                service.updateChildAlbum(params, $.proxy(function(response) {
                    if (response.rs) {
                        alert("更新成功！");
                        that.refreshData();
                        this.closeDialog();
                    } else {
                        alert('更新失败！');
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

        service.updateChildAlbum(params, (response) => {
            if (response.rs) {
                alert('操作成功!');
                this.refreshData();
            } else {
                alert('操作失败，请稍后再试！');
            }
        })
    },

    //刷新列表
    refreshData() {
        var {pageSize, pageNo} = this.model.toJSON();

        var userAccount = common.getUserInfo().userAccount;

        var params = {
            pageSize,
            pageNo,
            userAccount
        };

        service.showAllChildAlbums(params, (response) => {
            if (response.rs) {
                var resultList = response.resultMessage.resultList; 
                this.model.set({resultList});
            } else {
                alert('请求数据失败，请稍后重试');
            }
        })
    },

    format(data) {
        var {resultList} = data;
        resultList.forEach((item, index) => {
            var albumIsInner = item.albumIsInner;
            if (albumIsInner) {
                item.status = '隐藏';
            } else {
                item.status = '显示';
            }

            item.index = index;
        })
        return {resultList};
    },

    render() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}