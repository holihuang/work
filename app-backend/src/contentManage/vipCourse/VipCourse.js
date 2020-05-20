import {AjaxUpload} from '../../common/ajaxUpload/index';
import {RecommendCourseModel, RecommendCourseView} from './components/recommendCourse/index';
import {service} from '../../common/service';
import {common} from '../../common/common';
import {Dialog} from '../../components/dialog/index';

var template = require('./VipCourse.html');
var vipCourseItemTemplate = require('./components/VipCourseItem.html');
var coursePackageTpl = require('./components/CoursePackage.html');

//coursePackage Model
var CoursePackage = Backbone.Model.extend({
    defaults: {},
    initialize: function() {

    }
})

var CoursePackageView = Backbone.View.extend({

    className: 'modal-dialog modal-lg',

    initialize: function() {
        this.render();
        this.listenTo(this.model, 'change', this.render);
    },

    initCanvas() {
        var imgPreview = document.getElementById('imgPreview');
        var context = imgPreview.getContext('2d');

        var position = [
            {x: 0, y: 0, w: 200, h: 200},
            {x: 200, y: 100, w: 100, h: 100},
            {x: 100, y: 200, w: 100, h: 100},
            {x: 200, y: 200, w: 100, h: 100},
            {x: 200, y: 0, w: 100, h: 100},
            {x: 0, y: 200, w: 100, h: 100}
        ];

        var resultMessage = this.model.get('resultMessage');

        if (resultMessage.length) {
            for (var i = 0; i < 6; i++) {
                (function(i) {
                    var imgUrl = resultMessage[i].imageSrc;
                    var img = new Image();
                    img.onload = function() {
                        context.drawImage(img, position[i].x, position[i].y, position[i].w, position[i].h);
                    }
                    img.src = imgUrl;
                })(i);
            }
        }
    },

    render: function() {
        this.$el.html(coursePackageTpl(this.model.toJSON()));
        console.log(this.model.toJSON());
        return this;
    },
    events: {
        'click #coursePackageSubmit': 'coursePackageSubmit'
    },
    initUploader: function() {
        for (var i = 0; i < 6; i++) {
            var that = this;
            var idName = 'pic' + (i + 1);

            var imgPreview = document.getElementById('imgPreview');
            var context = imgPreview.getContext('2d');

            var position = [
                {x: 0, y: 0, w: 200, h: 200},
                {x: 200, y: 100, w: 100, h: 100},
                {x: 100, y: 200, w: 100, h: 100},
                {x: 200, y: 200, w: 100, h: 100},
                {x: 200, y: 0, w: 100, h: 100},
                {x: 0, y: 200, w: 100, h: 100}
            ];

            (function(i) {
                common.picUploader({idName: idName}, function(file, response) {
                    if (response.rs) {
                        $('#picUrl' + (i+1)).val(response.resultMessage[0].linkUrl);
                        $('#picName' + (i+1)).html(file);
                        $('#pic' + (i+1)).val('更新');
                        $('#pic' + (i+1)).removeClass('disabled');
                        var imgUrl = response.resultMessage[0].linkUrl;
                        var img = new Image();
                        img.onload = function() {
                            context.drawImage(img, position[i].x, position[i].y, position[i].w, position[i].h);
                        }
                        img.src = imgUrl;
                    } else {
                        alert('上传图片失败！');
                        $('#pic' + (i+1)).val('更新');
                        $('#pic' + (i+1)).removeClass('disabled');
                    }
                })
            })(i);
        }

    },
    coursePackageSubmit: function() {
        var params = [];
        var courseId = this.model.get('courseId');

        for (var i = 0; i < 6; i++) {
            var obj = {};
            obj.courseId = courseId;
            obj.moduleId = $('#moduleId' + (i+1)).val();
            obj.brandVIPId = $('#brandVIPId' + (i+1)).val();
            obj.moduleName = $('#moduleName' + (i+1)).val();
            obj.moduleQuality = $('#moduleQuality' + (i+1)).val();
            obj.postMasterId = $('#postMasterId' + (i+1)).val();
            obj.imageSrc = $('#picUrl' + (i+1)).val();
            obj.position = $('#position' + (i+1)).val();

            params.push(obj);
        }

        var reqType = $('#reqType').val();
        if (reqType == 1) {
            //新增
            service.insertBrandVIP(params, function(response) {
                if (response.rs) {
                    alert('设置成功!');
                    $('#reqType').val(3)  //如果插入成功，则不可再次点击
                    $('#coursePackageSubmit').attr('disabled', 'disabled');
                    $('#closeModalBtn').trigger('click');
                } else {
                    alert('设置失败！' + response.resultMessage);
                }
            })
        } else {
            //更新
            service.updateBrandVIP(params, function(response) {
                if (response.rs) {
                    alert('设置成功!');
                    $('#closeModalBtn').trigger('click');
                } else {
                    alert('设置失败！' + response.resultMessage);
                }
            })
        }
    }
})

//item model
var VipCourseItem = Backbone.Model.extend({
    defaults: {

    },
    initialize: function(){}
});

//view
var VipCourseItemView = Backbone.View.extend({
    tagName: 'tr',

    events: {
        'click .showPic': 'showPic',
        'click .recommend': 'recommend',
        'click .previewPic': 'previewPic'
    },

    showPic: function() {
        var courseId = (this.model.get('courseId'));
        service.getBrandVipModuleByCourseId({courseId: courseId}, function(response) {
            if (response.rs) {
                var data = response.resultMessage;
                //请求数据
                response['courseId'] = courseId;
                var coursePackage = new CoursePackage(response);
                var coursePackageView = new CoursePackageView({model: coursePackage});
                $('#myModal').children().length && $('#myModal').children().remove();
                $('#myModal').append(coursePackageView.render().el);
                coursePackageView.initCanvas();
                $('#myModal').modal('toggle');
                coursePackageView.initUploader();
            }
        })
    },

    recommend: function() {
        var courseId = this.model.get('courseId');
        var recommendCourse = new RecommendCourseModel({courseId: courseId});
        var recommendCourseView = new RecommendCourseView({model: recommendCourse});
        /*$('#myModal').children().length && $('#myModal').children().remove();
        $('#myModal').append(recommendCourseView.render().el);
        $('#myModal').modal('toggle');
        recommendCourseView.initUploader();*/
        $('#recommendCourse').html(recommendCourseView.render().el);
    },

    previewPic: function() {
        var url = this.model.get('courseIcon');

        var d = new Dialog({
            title: '预览素材',
            type: 2,
            content: `<img src="${url}">`
        });
    },

    getCourseId: function() {
        return this.model.get('courseId');
    },

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
        this.$el.html(vipCourseItemTemplate(this.model.toJSON()));
        return this;
    }
})

//collection
var VipCourseList = Backbone.Collection.extend({
    url: 'community-sv-war/course/getAllCourseVIP',
    model: VipCourseItem
});

var VipCourse = Backbone.View.extend({
    initialize: function() {
        this.render();
        var vipCourseList = new VipCourseList();
        var that = this;

        var params = {};

        service.getAllCourseVIP(params, function(response) {
            if (response.rs) {
                that.listenTo(vipCourseList, 'add', that.addVipCourseItem);
                var data = response.resultMessage;
                for (var i = 0, len = data.length; i < len; i++) {
                    var item = new VipCourseItem(data[i]);
                    vipCourseList.add(item);
                }
            }
        })
    },

    addVipCourseItem: function(courseItem) {
        var vipCourseItem = new VipCourseItemView({model: courseItem});
        this.$('tbody').append(vipCourseItem.render().el);
    },

    render: function() {
        this.$el.html(template());
    }
})

export {VipCourse};
