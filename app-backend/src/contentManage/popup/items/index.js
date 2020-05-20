import {Dialog} from '../../../components/dialog/index';
import {service} from '../../../common/service';
import {common} from '../../../common/common';
import {PopupDialog} from '../dialog/index';

var tpl = require('./tpl.html');
var recordTpl = require('../dialogTpl/record.html');

var provinceMap =  {
    1: '上海市',
    2: '云南市',
    3: '内蒙古自治区',
    4: '北京市',
    5: '台湾省',
    6: '吉林省',
    7: '四川省',
    8: '天津市',
    9: '宁夏回族自治区',
    10: '安徽省',
    11: '山东省',
    12: '山西省',
    13: '广东省',
    14: '广西壮族自治区',
    15: '新疆维吾尔自治区',
    16: '江苏省',
    17: '江西省',
    18: '河北省',
    19: '河南省',
    20: '浙江省',
    21: '海南省',
    22: '湖北省',
    23: '湖南省',
    24: '澳门特别行政区',
    25: '甘肃省',
    26: '福建省',
    27: '西藏自治区',
    28: '贵州省',
    29: '辽宁省',
    30: '重庆市',
    31: '陕西省',
    32: '青海省',
    33: '香港特别行政区',
    34: '黑龙江省'
}

var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Items = Backbone.View.extend({
    initialize: function(options) {
        var {resultList} = options;
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.model.set({resultList});
    },

    events: {
        'click img': 'previewImg',
        'click .update': 'update',  //更新素材
        'click .delete': 'deleteItem',  //删除素材
        'click .checklog': 'checklog',  //查看操作日志
        'click .check-user': 'checkUser'  //查看受众对象
    },

    previewImg(e) {
        var src = $(e.currentTarget).attr('src');
        new Dialog({
            title: '素材预览',
            type: 2,
            content: `<img src="${src}">`
        });
    },

    checkUser(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        let item = resultList[index];
        let {college = '', provinceId} = item;
        let provinces = '';
        if (provinceId) {
            let provinceIdArr = provinceId.split(';');
            let provincesArr = provinceIdArr.map((item, index) => {
                return provinceMap[+item];
            })

            provinces = provincesArr.join(';');
        }

        new Dialog({
            title: '受众对象',
            type: 2,
            content: `
                <form class="form">
                    <div class="form-group">
                        <label class="form-label">学院</label>
                        <div class="form-itm-box">${college}</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">地区</label>
                        <div class="form-itm-box">${provinces}</div>
                    </div>
                </form>
            `
        });
    },

    update(e) {
        var that = this;
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();

        let item = resultList[index];
        
        new PopupDialog({
            reqUrl: 'updatePcSocialAd',
            onSuccess: this.getTableListData.bind(this),
            item
        })
    },

    deleteItem(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var adId = resultList[index].adId;

        if (confirm('确定要删除该素材吗？')) {
            service.deletePcSocialAd({
                adId: adId,
                adType: 2    //为2表示app首页弹窗广告
            }, (response) => {
                if (response.rs) {
                    alert('删除成功！');
                    this.getTableListData();
                } else {
                    alert('删除失败' + response.rsdesp);
                }
            })
        }
    },

    checklog(e) {
        var index = $(e.currentTarget).attr('index');
        var {resultList} = this.model.toJSON();
        var adId = resultList[index].adId;

        service.getOperationLog({
            operatorFunc: 'appTips',
            recordId: adId
        }, (response) => {
            if (response.rs) {
                var resultList = response.resultMessage;
                resultList.forEach((item, index) => {
                    item.index = index + 1;
                    item.operatorAccount = item.operatorAccount.replace(/@sunlands.com/, '');
                    switch(item.operatorDesc) {
                        case 'insert':
                            item.operatorDesc = '创建';
                            break;
                        case 'update':
                            item.operatorDesc = '更新';
                            break;
                        case 'delete':
                            item.operatorDesc = '删除';
                            break;
                        default:
                            break;
                    }
                })
                new Dialog({
                    title: '操作日志',
                    type: 2,
                    content: recordTpl({resultList})
                });
            } else {
                alert('查询失败:' + response.rsdesp);
            }
        })
    },

    getTableListData(pageNo = 1) {
        service.getPcSocialAd({
            adType: 2,  //2表示pc弹窗广告
            queryType: 'ALL',
            deleteFlag: 0
        }, (response) => {
            if (response.rs) {
                let resultList = response.resultMessage;

                this.model.set({resultList});
            }
        })
    },

    format(data) {
        var {resultList} = data;
        resultList.forEach((item, index) => {
            item.index = index;
            item.xuhao = index + 1;
            switch (item.status) {
                case 0:
                    item.statusText = '展示结束';
                    item.showEditPanel = false;
                    break;
                case 1:
                    item.statusText = '展示中';
                    item.showEditPanel = true;
                    break;
                case 2:
                    item.statusText = '待展示';
                    item.showEditPanel = true;
                    break;
                default:
                    break;
            }
            switch(item.userType) {
                case '':
                    item.userTypeText = '全部用户';
                    break;
                case 1:
                    item.userTypeText = '付费用户';
                    break;
                case 0:
                    item.userTypeText = '免费用户';
                    break;
                default:
                    item.userTypeText = '全部用户';
                    break;
            }
        })
        return data;
    },

    render: function() {
        var data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {Items}