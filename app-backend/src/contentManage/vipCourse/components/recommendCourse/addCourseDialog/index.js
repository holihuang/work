import {ItemModel, courseList} from '../item/index';
import {AjaxUpload} from '../../../../../common/ajaxUpload/index';
import {service} from '../../../../../common/service';
import {common} from '../../../../../common/common';

var tpl = require('./tpl.html');

//model
var DialogModel = Backbone.Model.extend({
    initialize: function() {

    }
})

//view
var DialogView = Backbone.View.extend({

    initialize: function() {
        this.render();
    },

    events: {
        'click #addCourseSubmitBtn': 'addCourseSubmit'
    },

    addCourseSubmit: function() {

        var dataObj = common.getFormData({formId: 'form'});

        var courseId = this.model.get('courseId');
        dataObj['courseId'] = courseId;

        var packageLink = dataObj['packageLink'];
        //var reg = '^((https|http|ftp|rtsp|mms)?://)' + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?';
        if (packageLink.indexOf('http') == -1) {
            alert('请输入以http或者https开头的正确的url格式');
            return;
        }

        service.insertCoursePackage(dataObj, function(response) {
            if (response.rs) {
                for (var k in dataObj) {
                    dataObj[k] = decodeURIComponent(dataObj[k]);
                }
                var model = new ItemModel(dataObj);
                courseList.add(model);
                $('#closeModalBtn').trigger('click');
                alert('success');
            }
        })
    },
    render: function() {
        this.$el.html(tpl(this.model.toJSON()));
        return this;
    },
    initUploader: function() {
        var params = {
            idName: 'uploadIconBtn'
        };

        common.picUploader(params, function(file, response) {
            if (response.rs) {
                alert(file);
                $('#uploadIconBtn').val('更新');
                $('#uploadIconBtn').removeClass('disabled');
                $('#packageIcon').val(response.resultMessage[0].linkUrl);
                $('#fileName').html(file);
            } else {
                //上传失败
                alert(response.rsdesp);
                $('#uploadIconBtn').val('更新');
                $('#uploadIconBtn').removeClass('disabled');
            }
        })
    }
})

export {DialogModel, DialogView}