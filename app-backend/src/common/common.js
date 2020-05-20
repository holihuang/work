/*
 * @file 该文件包含一些通用的函数
 * @author hualuyao
 */
import {AjaxUpload} from './ajaxUpload/index';
import {url} from './url';
import { getJSON } from 'dataservice';

var toElement = (function(){
    var div = document.createElement('div');
    return function(html){
        div.innerHTML = html;
        var el = div.firstChild;
        return div.removeChild(el);
    };
})();
var reqList = [];

var common = {
    //获取当前时间YYYY-MM-DD hh:mm:ss
    getTime: function() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();

        var result = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

        return result;
    },

    /*
     * 以json对象的方式返回表单中的数据
     * @param {object}
     * @param.formId {string} 表单Id
     * @param.hasCheckbox {boolean} 是否包含多选框(直接对form表单序列化会checkbox获取值错误)
     * @param.checkboxName {string} 多选框名称
     */
    getFormData: function(param) {
        var dataArr = $('#' + param.formId).serialize().split("&");
        var dataObj = {};
        for (var i = 0, len = dataArr.length; i < len; i++) {
            var key = dataArr[i].split('=')[0];
            var value = dataArr[i].split('=')[1];
            //转义英文双引号
            //英文双引号为"%22"
            if (value) {
                value = value.replace(/%22/ig, "%5C%22"); // \"
                value = value.replace(/\+/g, ' ');  //serialize会将空格转义为+
                value = value.trim();  //移除前后空格
            }

            dataObj[key] = value;
        }

        if (param.hasCheckbox) {
            dataObj[param.checkboxName] = [];

            var checkboxValArr = $("input[name='" + param.checkboxName + "']:checked").serialize().split("&");
            for (var i = 0, len = checkboxValArr.length; i < len; i++) {
                dataObj[param.checkboxName].push(checkboxValArr[i].split("=")[1]);
            }
        }

        return dataObj;
    },

    /*
     * 获取cookie
     */
    getCookie: function(c_name) {
        if (document.cookie.length>0)
        {
            var c_start = document.cookie.indexOf(c_name + "=")
            if (c_start != -1)
            {
                c_start = c_start + c_name.length + 1;
                var c_end = document.cookie.indexOf(";",c_start);
                if (c_end == -1) c_end = document.cookie.length
                return unescape(document.cookie.substring(c_start,c_end))
            }
        }
        return "";
    },

    /*
     * 获取用户信息
     */
    getUserInfo: function() {
        var userInfo = {...window.userInfo};
        // if (userInfo.userRole) {
        //     userInfo.userRole = JSON.parse(userInfo.userRole);
        // }
        userInfo.imUserId = userInfo.imId;
        return userInfo;
    },


    /*
     * 上传图片
     * @params {object}
     * @params.idName {string} button id
     * @callback {function} 回调函数
     */
    picUploader: function(params, callback, onChange) {
        var idName = params.idName;
        var params = {
            action: '/community-manager-war/base/uploadPicture.action',
            name: 'picFile',
            responseType: 'json',
            onSubmit : function(file , ext){
                if (ext && /^(jpg|png|bmp|txt|doc|docx|xlsx)$/.test(ext.toLowerCase())){
                    this.setData({
                        'picName': file
                    });
                } else {
                    alert("请上传格式为 jpg|png|bmp 的图片！");
                    this.enable();
                    return false;
                }
            },
            onComplete : function(file,response){
                if (callback) {
                    callback(file, response);
                } else {
                    alert('请设置上传成功回调函数！');
                }
                this.enable();
            }
        }

        if (onChange) {
            params.onChange = onChange;
        }
        new AjaxUpload(idName, params);
    },

    /**
     * 上传文件
     * @options.onChange {?function} 获取到文件时的回调函数，可返回false阻止文件上传, 参数为文件file
     * @options.onSuccess {?function} 文件上传成功后的回调函数
     * @options.uploadUrl {string} 文件上传接口路径
     * @options.name {string} 字段名，默认为file
     */
    uploadPic: function(options = {}) {
        let {uploadUrl, onChange, onSuccess, onError, name = 'file'} = options;
        if (!uploadUrl) {
            alert('请填写文件上传接口路径！');
            return;
        }

        let el = $(`<input type="file" name="${name}" required/>`);
        el.css({
            display: 'none'
        });
        $('body').append(el);

        el.on('change', function(e) {
            let file = $(e.target)[0].files[0];
            if (typeof onChange === 'function') {
                let rs = onChange(file);

                if (rs === false) {
                    return;
                }
            }

            let data = new FormData();
            data.append(name, file, file.name);

            $.ajax({
                url: uploadUrl,
                type: 'post',
                data: data,
                dataType: 'json',
                processData: false,
                cache: false,
                contentType: false
            }).done(function(response) {
                el.remove();
                if(response.rs) {
                    if (typeof onSuccess === 'function') {
                        let {resultMessage} = response;
                        onSuccess(resultMessage);
                    }
                } else {
                    if(typeof onError === 'function') {
                        let {rsdesp} = response;
                        onError(rsdesp);
                    }
                }

            }).fail(e => alert(e));
        })

        el.click();
    },

    picUploaderNew: function(callback, onChange, reqUrl) {
        var str = '<form enctype="multipart/form-data" method="post" name="fileinfo">'
                +      '<input type="file" name="picFile" required/>'
                +      '<input type="text" name="picName" value="image.jpg">'
                + '</form>';
        var el = toElement(str);
        el.style.display = 'none';
        document.body.appendChild(el);
        var ipt = el.getElementsByTagName('input')[0];
        var form = document.forms.namedItem("fileinfo");

        $(ipt).on('change', function(e) {
            let files = $(e.target)[0].files;

            if (onChange) {
                let files = $(e.target)[0].files;
                let {name, size, type} = files[0];
                let rs = onChange({name, size, type, file: files[0]});
                if (rs === false) {
                    return;
                }
            }

            var oData = new FormData();
            oData.append('picFile', files[0], files[0].name);

            $.ajax({
                url: reqUrl || url.UPLOAD_PIC,
                type: 'post',
                data: oData,
                dataType: 'json',
                processData: false,
                cache: false,
                contentType: false
            }).done(function(response) {
                document.body.removeChild(el);
                callback && callback(response);
            })
        })

        ipt.click();
    },

    /**
     * 上传文件
     * @callback {function} 回调函数
     */
    fileUploader: function(callback, onChange, mimeTypeList = ['*']) {
        const mimeTypeStr = mimeTypeList.join(',');

        var str = '<form enctype="multipart/form-data" method="post" name="fileinfo">'
                +      '<input type="file" name="file" accept="' + mimeTypeStr + '" required/>'
                + '</form>';
        var el = toElement(str);
        el.style.display = 'none';
        document.body.appendChild(el);
        var ipt = el.getElementsByTagName('input')[0];
        var form = document.forms.namedItem("fileinfo");

        $(ipt).on('change', function(e) {
            const files = $(e.target)[0].files;

            var oData = new FormData();
            oData.append('file', files[0], files[0].name);

            if (onChange) {
                let files = $(e.target)[0].files;
                let {name, size, type} = files[0];
                let rs = onChange({name, size, type, file: files[0]});
                if (rs === false) {
                    return;
                }
            }

            $.ajax({
                url: url.UPLOAD_COMMON_FILE,
                type: 'post',
                data: oData,
                dataType: 'json',
                processData: false,
                cache: false,
                contentType: false
            }).done(function(response) {
                document.body.removeChild(el);
                callback && callback(response);
            })
        })

        ipt.click();
    },

    uploadVideo: function(callback, onChange) {
        var str = '<form enctype="multipart/form-data" method="post" name="fileinfo">'
                +      '<input type="file" name="file" accept="video/mp4" required/>'
                + '</form>';
        var el = toElement(str);
        el.style.display = 'none';
        document.body.appendChild(el);
        var ipt = el.getElementsByTagName('input')[0];
        var form = document.forms.namedItem("fileinfo");

        $(ipt).on('change', function(e) {
            const files = $(e.target)[0].files;

            var oData = new FormData();
            oData.append('file', files[0], files[0].name);

            if (onChange) {
                let files = $(e.target)[0].files;
                let {name, size, type} = files[0];
                let rs = onChange({name, size, type, file: files[0]});
                if (rs === false) {
                    return;
                }
            }

            $.ajax({
                url: url.UPLOAD_VIDEO_FILE,
                type: 'post',
                data: oData,
                dataType: 'json',
                processData: false,
                cache: false,
                contentType: false
            }).done(function(response) {
                document.body.removeChild(el);
                callback && callback(response);
            })
        })

        ipt.click();
    },

    //将richText中的表情图替换为相应的占位符
    formatRichText(richText) {
        //将表情img转换为[XX]形式
        var emotionArr = [];
        for (let k in EMOTION_EN_TO_CN) {
            emotionArr.push(k);
        }
        var str = emotionArr.join('|');
        var regStr = '<img src="[\\S\\s]*?\/images\/emotion\/(' + str + ').png"[\\S\\s]*?>';
        var reg = new RegExp(regStr, 'g');

        var rs;
        var textFormatted = richText;

        while(rs = reg.exec(richText)) {
            textFormatted = textFormatted.replace(rs[0], `[${EMOTION_EN_TO_CN[rs[1]]}]`);
        }

        return textFormatted;
    },

    //判断一个字符串是不是标准完整的url
    testUrl: function(str) {
		str = str || '';
        return str.match(/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g);
    },

    //按字符截取字符串
    getStrByCharNums: function(str, num) {
        var _num = 0;
        var rs = [];
        for (var i = 0, len = str.length; i < len; i++) {
            if (str.charCodeAt(i) > 255) {
    　　　　　 _num += 2;
    　　　　} else {
    　　　　　 _num++;
    　　　　}
            if (_num > num) {
                break;
            } else {
                rs.push(str[i]);
            }
        }

        return rs.join('');
    },

    //计算字符数
    getCharNums: function (str) {
        var rs = 0;
        for (var i = 0, len = str.length; i < len; i++) {
            if (str.charCodeAt(i) > 255) {
                rs += 2;
            } else {
                rs++;
            }
        }

        return rs;
    },

    loading: function(tip) {
        if (tip) {
            $('#loadingWithText').removeClass('hide').find('.tip').html(tip);
        } else {
            $('#loading').removeClass("hide");
        }
    },

    removeLoading: function() {
        $('#loading').addClass('hide');
        $('#loadingWithText').addClass('hide');
    },

    downloadFile(options) {
        var config = $.extend(true, { method: 'POST' }, options);
        var $div = $('<div class="hide">');
        var $form = $('<form target="down-file-iframe" method="' + config.method + '" />');
        $form.attr('action', config.url);
        for (var key in config.data) {
            $form.append('<input type="hidden" name="' + key + '" value=\'' + config.data[key] + '\' />');
        }

        $(document.body).append($div);
        $div.append($form);

        $form[0].submit();
        $div.remove();
    },

    parseJSON(str) {
        let rs;
        try {
            rs = JSON.parse(str);
        } catch (err) {
            //解析失败
            let failedIndex = +(err.message.match(/\d+/)[0]);
            let failedChar = str.charAt(failedIndex);
            let reg = new RegExp(failedChar, 'ig');
            str = str.replace(reg, ' ');
            rs = this.parseJSON(str);
        }

        return rs;
    },

    escapeHTML: function(str) {
        str = str || '';
        return str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
    },
}

export {common}
