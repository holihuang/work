import {service} from '../../../common/service';
import {common} from '../../../common/common';
import {url} from '../../../common/url';

const tpl = require('./tpl.html');

const datepickerCfg = {
    format: 'yyyy-mm-dd hh:00:00',
    autoclose: true,
    todayBtn: true,
    minView: 'hour'
}

const Model = Backbone.Model.extend({
	defaults: {
		iconNameList: []
	}
});

const IconAdminUpdateDialog = Backbone.View.extend({
	initialize(options) {
		this.model = new Model();
		this.listenTo(this.model, 'change:iconNameList', this.renderIconName);
		this.model.set({...options});
		this.render();
		this.initiaIconNameList();
		this.toggleUploadArea();
	},
	
	events: {
		'click .iconAddUpload': 'iconAddUpload',
		'click .uploadUnclickedIcon': 'iconAddUpload',
		'click .uploadClickedIcon': 'iconAddUpload',
		'change #iconNameSlt': 'toggleUploadArea',
		'click .question-mark': 'showTipText'
	},

	showTipText() {
		alert('若更新了图标图片或展示的时间，则开始时间至少为当前时间的第二天');
	},

	toggleUploadArea() {

		const { widthheightsize, showtwoimg } = this.$el.find('#iconNameSlt option:selected').data();
		const index = this.$el.find('#iconNameSlt').val().trim();

		this.$el.find('.upload-size-text').removeClass('hide');
		this.$el.find('.upload').removeClass('disabled');
		if(!index) {
			this.$el.find('.upload-size-text').addClass('hide');
			this.$el.find('.upload').addClass('disabled');
		}

		this.$el.find('.upload-size-text').text(`(${widthheightsize})`);
		if(showtwoimg) {
			this.$el.find('.form-line-icon--single').addClass('hide');
			this.$el.find('.form-line-icon--double').removeClass('hide');
			this.$el.find('.uploadUnclickedIcon').text('更新未点击状态图标');
			this.$el.find('.uploadClickedIcon').text('更新已点击状态图标');
			this.$el.find('.form-img-group--first').removeClass('visi-hide');
	        this.$el.find('.form-img-group--second').removeClass('visi-hide');
		} else {
			this.$el.find('.form-line-icon--single').removeClass('hide');
			this.$el.find('.form-line-icon--double').addClass('hide');
			this.$el.find('.iconAddUpload').text('更新');
		}

	},

	iconAddUpload(e) {
		const uploadUrl = url.UPLOAD_PIC_REAL_SIZE;
		common.picUploaderNew((response) => {
	            if (response.rs) {
	                let {height, width, linkUrl} = response.resultMessage[0];
	                let { widthheightsize, showtwoimg } = this.$el.find('#iconNameSlt option:selected').data();

	                const uploadWidth = +widthheightsize.split('*')[0];
	                const uploadHeight = +widthheightsize.split('*')[1];
	                if(uploadWidth !== height && uploadHeight !== height) {
	                	alert(`图片尺寸要求为${uploadWidth}*${uploadHeight}`);
	                	$(e.currentTarget).text('更新');
	                	return;
	                } 

	                if(showtwoimg) {
	                	this.$el.find('.form-img-group--double').removeClass('hide');
	                	if($(e.currentTarget).hasClass('uploadUnclickedIcon')) {
	               			this.$el.find('.upload-icon-url--one').val(linkUrl);
	               			this.$el.find('.upload-icon-img--one').attr('src', linkUrl);
	               			this.$el.find('.form-img-group--first').removeClass('visi-hide');
	                	} else {
	                		this.$el.find('.upload-icon-url--two').val(linkUrl);
	                		this.$el.find('.upload-icon-img--two').attr('src', linkUrl);
	                		this.$el.find('.form-img-group--second').removeClass('visi-hide');
	               		}
	               		this.$el.find('.form-img-group').removeClass('hide');
	               		this.$el.find('.form-icon-image--single').addClass('hide');
	                } else {
	                	this.$el.find('.upload-icon-url').val(linkUrl);
	               		this.$el.find('.upload-icon-img').attr('src', linkUrl);
	               		this.$el.find('.form-img-group').addClass('hide');
	               		this.$el.find('.form-icon-image--single').removeClass('hide');
	                }

	                $(e.currentTarget).text('更新');
	                
	            } else {
	                alert(response.rsdesp);
	            }
	        }, (options) => {
	            let {size} = options;
	            
	            $(e.currentTarget).text('正在上传...');
	        }, uploadUrl)
	},

	initiaIconNameList() {
		const { userAccount } = window.userInfo;
		service.adminRetrieveAllButton({userAccount}, (response) => {
			if(response.rs) {
				let resultList = response.resultMessage;
				resultList = this.formatIconNameList(resultList);
				this.model.set({
					iconNameList: resultList
				});
			} else {
				alert(response.rsdesp);
			}
		})
	},

	formatIconNameList(list) {
		const { name } = this.model.toJSON();
		list.forEach((item, index) => {
			if(item.name == name) {
				item.isSelected = 'selected';
			} else {
				item.isSelected = '';
			}
		}) 
		return list;
	},

	initDatepicker() {
        this.$el.find('#startTime').datetimepicker(datepickerCfg);
        this.$el.find('#endTime').datetimepicker(datepickerCfg);
    },

	renderIconName() {
		const { iconNameList } = this.model.toJSON();
		if(iconNameList.length) {
			const iconNameTemp = iconNameList.reduce((res, item, index) => {
				const { name, buttonId, buttonKey, isSelected } = item;
				item.showTwoImg = 0;
				if(name.includes('首页-')) {
					item.widthHeightSize = '144*144';
				} else if(name.includes('底部bar-')) {
					if(name.includes('底部bar-提问') || name.includes('底部bar-发帖')) {
						item.widthHeightSize = '180*180';
					} else {
						item.widthHeightSize = '72*102';
						item.showTwoImg = 1;
					}
				} else if(name.includes('我的-')) {
					item.widthHeightSize = '126*126';
				}
				return res += `<option data-widthheightsize="${item.widthHeightSize}" data-showtwoimg="${item.showTwoImg}" ${isSelected} value="${index}" buttonId="${buttonId}" buttonKey="${buttonKey}">${name}</option>`; 
			}, `<option buttonId="" buttonKey="" value="">请选择图标名称</option>`);
			this.$el.find('#iconNameSlt').html(iconNameTemp);
			this.model.set({ iconNameList: [] });
		}
		this.toggleUploadArea();
	},

	format(data) {
		return data;
	},

	render() {
		const data = this.format(this.model.toJSON());
		this.$el.html(tpl(data));
		this.initDatepicker();
		return this;
	}

});

export { IconAdminUpdateDialog };