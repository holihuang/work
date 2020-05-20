import {service} from '../../common/service';
import {common} from '../../common/common';

var tpl = require('./tpl.html');

var Model = Backbone.Model.extend({
    defaults: {
        dId: 0
    }
});

var DialogConfirm = Backbone.View.extend({
    el: '#dialogContainer',

    /**
     * @params options {object}
     * @params options.title {string} 标题
     * @params options.type {int} 1/按格式的key-value对，2/自定义内容
     * @params options.content 当type为1时，为[{},{}]，当type为2时，为html字符串
     * @params options.ok {function} 确认回调函数
     * @params options.hasCustomEvents {?boolean} 是否有自定义事件
     * @params options.dom {?string} 触发事件的dom节点选择器
     * @params options.eventsFunc {?function}  自定义事件
     * @params options.cancel {function} 取消回调函数
     * content [
     *      {
     *          label: {
     *              for: '',  //for name
     *              text: ''  //内容
     *          },
     *          valueObj: {
     *              type: 'input/button/span...',
     *              value: '', //值
     *              placeholder: '',
     *              name: ''
     *              id: '',
     *              inputType: 'date/text/...'
     *          }
     *      },
     *      {
     *          label: {
     *              for: '',  //for name
     *              text: ''  //内容
     *          },
     *          valueObj: {
     *              type: 'input/button/span...',
     *              value: '', //值
     *              placeholder: '',
     *              name: ''
     *              id: '',
     *              inputType: 'date/text/...'
     *          }
     *      }
     * ]
     */
    initialize: function(options) {
        this.options = options || {};
        this.render();
        this.setBodyStyle();
        this.initEvents();
        this.setCustomEvents();  //设置自定义事件
    },

    events: {
        'click .btn-submit': 'handleSubmit',
        'click .close-dialog-btn': 'closeDialog',
        'click .btn-cancel': 'closeDialog'
    },

    setCustomEvents() {
        var {hasCustomEvents, dom, eventsFunc} = this.options;
        if (hasCustomEvents) {
            //如果有自定义事件
            if (dom && eventsFunc) {
                this.$el.find(dom).on('click', (e) => {
                    if (typeof eventsFunc === 'function') {
                        eventsFunc.call(this, e);
                    }
                })
            }
            return;
        }
    },

    initEvents() {
        var {hasUploadPicBtn, uploadArr, hasCustomEvents, events, eventsFunc} = this.options;
        if (hasUploadPicBtn) {
            //有上传图片按钮
            for (let i = 0, len = uploadArr.length; i < len; i++) {
                common.picUploader({
                    idName: uploadArr[i].uploadPicBtnId
                }, function(file, response) {
                    if (response.rs) {
                        $('#' + uploadArr[i].imgUrlHolder).val(response.resultMessage[0].linkUrl);
                        $('#' + uploadArr[i].fileNameHolder).html(file);
                        $('#' + uploadArr[i].uploadPicBtnId).html('更新').removeClass('disabled');
                        uploadArr[i].imgHolder && $('#' + uploadArr[i].imgHolder).attr('src', response.resultMessage[0].linkUrl);
                    } else {
                        alert('上传图片失败!');
                        $('#' + uploadArr[i].uploadPicBtnId).html('更新').removeClass('disabled');
                    }
                })
            }
        }
    },

    setBodyStyle() {
        $('body').addClass('dialog-show');
    },

    handleSubmit: function() {
        var {ok} = this.options;
        if (typeof ok === 'function') {
            ok.call(this);
        } else {
            this.closeDialog();
        }
    },

    closeDialog() {
        this.undelegateEvents();
        this.$el.empty();
        $('body').removeClass('dialog-show');
    },

    parseContent(content) {
        var str = '';
        str += '<form class="form" id="form">';
        for (var i = 0, len = content.length; i < len; i++) {
            str += '<div class="form-group">';
            let label = content[i].label;
            let valueObj = content[i].valueObj;
            let tip = content[i].tip;
            str += this.createLabel(label);
            str += this.createValueHolder(valueObj);
            str += this.createTip(tip);
            str += '</div>';
        }
        str += '</form>';
        return str;
    },

    createLabel(label) {
        if (label) {
            return `<label for="${label.forName}" class="form-label">${label.text}</label>`;
        }

        return '';
    },

    createValueHolder(valueObj) {
        if (valueObj) {
            var {type, name, value, inputType, id} = valueObj;
            var str;
            switch (type) {
                case 'input':
                    value = value || '';
                    if (inputType === 'date') {
                        str = `<input type="text" value="${value}" name="${name}" class="form-input date" id="${id}">`;
                    } else {
                        str = `<input type="${inputType}" value="${value}" name="${name}" class="form-input" id="${id}">`;
                    }
                    break;
                case 'button':
                    str = `<span class="btn btn-default w90" id="${id}">${value}</span>`;
                    str += `<input type="hidden" name="${name}">`;
                    break;
                case 'span':
                    str = `<span class="tip">${value}</span>`;
                    break;
                default:
                    break;
            }

            return str;
        }
        return '';
    },

    createTip(tip) {
        if (tip) {
            return `<span class="tip">${tip}</span>`;
        }

        return '';
    },

    format(data) {
        var {type, title, content} = data;
        if (type === 1) {
            data.content = this.parseContent(content);
        } else if (type === 2) {
            data.content = content;
        } else if (type === 3) {
            var div = document.createElement('div');
            div.appendChild(content);
            data.content = div.innerHTML;
        }

        return data
    },

    render: function() {
        var data = this.format(this.options);
        this.$el.html(tpl(data));
        let {type, content} = data;
        if (type == 4) {
            this.$el.find('.dialog-body-inner').html('');
            this.$el.find('.dialog-body-inner').append(content);
        }
    }
})

export {DialogConfirm}
