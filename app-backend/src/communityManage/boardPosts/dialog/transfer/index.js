import {Dialog} from '../../../../components/dialog/index';
import {service} from '../../../../common/service';
import {common} from '../../../../common/common';

const PAGE_SIZE = 800;

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var View = Backbone.View.extend({
    initialize: function(options = {}) {
        this.options = options;
        this.model = new Model();
        const { parentAlbumList, allChildAlbumList, postsLists } = options;
        if(postsLists.length == 1) {
            this.model.set({
                postMasterId: postsLists[0].postMasterId,
                oldAlbumParentId: postsLists[0].albumParentId,
                oldAlbumChildId: postsLists[0].albumChildId,
                oldAlbumParentName: postsLists[0].albumParentName,
                oldAlbumChildName: postsLists[0].albumChildName,
                parentAlbumList,
                allChildAlbumList
            });
        } else {
            this.model.set({
                parentAlbumList,
                allChildAlbumList,
                postsLists
            });
        }
        
        this.render();
    },

    events: {
        'change #newAlbumParentId': 'handleParentIdChange'
    },

    handleParentIdChange: function() {
        var {allChildAlbumList} = this.model.toJSON();
        var newAlbumParentId = $('#newAlbumParentId').val();
        var childAlbumList = allChildAlbumList.filter(item => item.albumParentId == newAlbumParentId);
        var rs = '<select id="newAlbumChildId" name="newAlbumChildId"><option value="0" selected>请选择二级版面</option>'
        childAlbumList.forEach((item) => {
            rs += `
                <option value="${item.albumId}">${item.albumName}</option>
            `
        })
        rs += '</select>'
        this.$el.find('#newAlbumChildIdContainer').html(rs);
    },

    format(data) {
        var {postMasterId, oldAlbumParentId, oldAlbumParentName, oldAlbumChildName, oldAlbumChildId, parentAlbumList, allChildAlbumList} = data;
        var childAlbumList = allChildAlbumList.filter(item => item.albumParentId == oldAlbumParentId);
        parentAlbumList.forEach(item => {
            item.selected = item.albumId == oldAlbumParentId ? 'selected' : '';
        });
        childAlbumList.forEach(item => {
            item.selected = item.albumId == oldAlbumChildId ? 'selected' : '';
        });
        return {postMasterId, parentAlbumList, childAlbumList, oldAlbumParentId, oldAlbumChildId, oldAlbumParentName, oldAlbumChildName};
    },

    getData() {
        const newAlbumParentId = this.$el.find('select[name=newAlbumParentId]').val();
        const newAlbumChildId = this.$el.find('select[name=newAlbumChildId]').val();
        const newAlbumParentName = this.$el.find(`option[value="${newAlbumParentId}"]`).text();
        let newAlbumChildName;
        if (+newAlbumChildId) {
            newAlbumChildName = this.$el.find(`option[value="${newAlbumChildId}"]`).text();
        }
        let data = { newAlbumParentId, newAlbumChildId, newAlbumParentName, newAlbumChildName };
        const { postsLists = [] } = this.model.toJSON();

        let transferPostMasters = [];
        let operateFlag;
        postsLists.forEach( (value, index) => {
            let obj = {}
            obj.oldAlbumChildId = value.albumChildId;
            obj.oldAlbumChildName = value.albumChildName;
            obj.oldAlbumParentId = value.albumParentId;
            obj.oldAlbumParentName = value.albumParentName;
            obj.postMasterId = value.postMasterId;
            if(value.operateFlag) {
                operateFlag = 1;
            }

            transferPostMasters.push(obj);
        })
        if(operateFlag) { //批量操作
            data = Object.assign({operateFlag}, {transferPostMasters, ...data});
        } else { //单条操作
            let {oldAlbumChildId, oldAlbumChildName, oldAlbumParentId, oldAlbumParentName, postMasterId} = this.model.toJSON();
            data = Object.assign({},{oldAlbumChildId, oldAlbumChildName, oldAlbumParentId, oldAlbumParentName, postMasterId, ...data});
        }
        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

var TransferDialog = function(options = {}) {
    let {postsLists, onSuccess} = options; 
    this.onSuccess = onSuccess;
    postsLists.forEach((value, index) => {
        this.getAlbumInfo().then((data) => {
            let {parentAlbumList, allChildAlbumList} = data;
            this.view = new View({
                parentAlbumList,
                allChildAlbumList,
                postsLists
            })
            this.show();
        })
    })
}
TransferDialog.prototype.getAlbumInfo = function(resolve, reject) {
    var userAccount = common.getUserInfo().userAccount;

    var params = {
        pageSize: PAGE_SIZE,
        pageNo: 1,
        userAccount
    };

    var that = this;

    return new Promise(function(resolve, reject) {
        service.showAllParentAlbums(params, (response) => {
            if (response.rs) {
                that.parentAlbumList = response.resultMessage.resultList.filter(item => !item.albumIsInner);
                service.showAllChildAlbums(params, function(response) {
                    if (response.rs) {
                        resolve({
                            parentAlbumList: that.parentAlbumList,
                            allChildAlbumList: response.resultMessage.resultList.filter(item => !item.albumIsInner) 
                        });
                    } else {
                        alert('获取版面信息失败，请刷新重试！');
                    }
                })
            } else {
                alert('获取版面信息失败，请刷新重试！');
            }
        })
    })
}
TransferDialog.prototype.show = function() {
    let that = this;
    let d = new Dialog({
        title: '请选择帖子迁移位置',
        type: 4,
        content: that.view.el,
        ok: function() {
            let data = that.view.getData();   
            service.transferPostMaster({
                email: common.getUserInfo().userAccount,
                ...data
            }, (response) => {
                if (response.rs) {
                    alert('迁移成功!');
                    if (typeof that.onSuccess === 'function') {
                        that.onSuccess();
                    }
                    this.closeDialog();
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    })
}

export {TransferDialog}