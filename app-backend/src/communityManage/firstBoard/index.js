import {service} from '../../common/service';
import {common} from '../../common/common';
import {Dialog} from '../../components/dialog/index';
import {Items} from './items/index';

var template = require('./tpl.html');
var addTpl = require('./dialogTpl/add.html');
var headTpl = require('./headTpl.html');


var Model = Backbone.Model.extend({
    defaults: {

    }
});

var FirstBoard = Backbone.View.extend({

    initialize: function() {
        this.model = new Model();
        this.render();
        this.listenTo(this.model, 'change:resultList', this.renderTableData);
        this.listenTo(this.model, 'change:notAssociateCollege', this.renderHeader);
        this.getTableData();
        this.getNotAssociateCollege();
    },

    events: {
        'click #addFirstBoardBtn': 'addFirstBoard'  //新建一级版块
    },

    //获取一级版块数据
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

    //渲染表格数据
    renderTableData() {
        var { resultList, notAssociateCollege } = this.model.toJSON();
        this.items && this.items.undelegateEvents();
        this.items = new Items({el: this.$el.find('tbody')[0], resultList, notAssociateCollege});

        //页面滚动到顶部
        $('body').scrollTop(0);
    },
    //渲染表格数据
    renderHeader() {
        this.$el.find('.notAssociateCollege').html(headTpl(this.model.toJSON()))
    },

    //新增一级版块
    addFirstBoard: function() {
        var that = this;

        var d = new Dialog({
            title: '新建一级版块',
            content: addTpl(this.model.toJSON()),
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

                //校验机学院简介字数
                var agencyDesp = $('#agencyDesp').val();
                if (!agencyDesp) {
                    alert('请输入学院简介');
                    return;
                }
                if (agencyDesp.length > 200) {
                    alert('学院简介不能超过200字！');
                    return;
                }

                params.createTime = common.getTime();
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
                service.createNewParentAlbum(params, $.proxy(function(response) {
                    if (response.rs) {
                        alert("添加成功！");
                        //刷新列表
                        that.getTableData();
                        this.closeDialog();
                    } else {
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
  
    render: function() {
        this.$el.html(template(this.model.toJSON()));
    }
})

export {FirstBoard};