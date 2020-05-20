import {common} from '../../../../common/common';
let tpl = require('./tpl.html');

const datepickerCfg = {
    format: 'yyyy-mm-dd hh:ii:00',
    autoclose: true,
    todayBtn: true,
    minView: 'hour'
}

let Model = Backbone.Model.extend({
	defaults: {
		isShowRecConfig: false
	}
});

let RecConfigDialog = Backbone.View.extend({
	initialize: function(options) {
		this.model = new Model();
		const {itm} = options;
		this.model.set({
			...itm
		});
		this.render();
	},

	events: {
		'click #beginTimeRec': 'showBeginTimeTimePicker',
		'click #endTimeRec': 'showEndTimeTimePicker',
		'click #recConfigUpdate': 'recConfigUpdate',
		'click .uploadPicBtn': 'uploadPic'
	},

	uploadPic(e) {
		common.picUploaderNew((onSuccess) => {
			const { width='', height='', linkUrl } = onSuccess.resultMessage[0];
			this.$el.find('.uploadPicBtn').text("更新图片").prop('disabled', false);
			if (width * 220 != height * 750) {
				alert('上传图片尺寸需为750*220');
				return false;
			} else {
				this.model.set({
					uploaded: true,
					contentPic: linkUrl
				});	
				this.$el.find('#contentPic').val(linkUrl);
			}
		},	(onChange) => {
			const { size='' } = onChange;
			if( size > 500*1024 ) {
				alert("图片大小需在500K以内！");
				return false;
			}
			this.$el.find(".uploadPicBtn").text('上传中...').prop('disabled', true);
		});
	},

	toggleType(data) {
		let {type, suggestedStatus, postMasterId, questionId, skipName, skipTitle} = data;
		type == 3 ? this.$el.find(".form-group-pageTitle").removeClass('hide') : this.$el.find(".form-group-pageTitle").addClass('hide');
		type == 3 ? this.$el.find(".form-group-upload").removeClass('hide') : this.$el.find('.form-group-upload').addClass('hide');
		this.$el.find("#contentType").val(type);
	},

	recConfigUpdate(options) {
		const { isCallBack, type } = options;
		const { suggestedStatus } = this.model.toJSON();
		let isChecked = this.$el.find("#recConfigUpdate").is(":checked");
		// isCallBack && (isChecked = suggestedStatus);
		if(isCallBack) {
			isChecked = type == 3 ? suggestedStatus : true;
			this.$el.find("#recConfigUpdate").attr("checked", Boolean(+suggestedStatus));
		}
		if(isChecked) {
			this.$el.find("#beginTimeRec").removeAttr('disabled');
			this.$el.find("#endTimeRec").removeAttr('disabled');
			this.$el.find("#pageNumber").removeAttr('disabled');
			this.$el.find("#ranking").removeAttr('disabled');
		} else {
			this.$el.find("#beginTimeRec").prop('disabled', true);
			this.$el.find("#endTimeRec").prop('disabled', true);
			this.$el.find("#pageNumber").prop('disabled', true);
			this.$el.find("#ranking").prop('disabled', true);
		}
		//活动页面-推荐设置（默认取消禁用）
		this.$el.find("#recConfigUpdate").prop('disabled', false);
		// 活动页面-推荐设置（禁用）
		type == 3 && this.$el.find("#recConfigUpdate").prop('disabled', true);
	},

	initDatepicker() {
        this.$el.find('#beginTimeRec').datetimepicker(datepickerCfg);
        this.$el.find('#endTimeRec').datetimepicker(datepickerCfg);
    },

	showBeginTimeTimePicker: function(e) {
		$(e.currentTarget).datetimepicker('show');
	},

	showEndTimeTimePicker: function(e) {
		$(e.currentTarget).datetimepicker('show');
	},

	format(data) {
		let {type, postMasterId, questionId, skipName} = data;
		const IdText = type == 1 ? "帖子Id" : "问题Id";
		postMasterId = type == 1 ? postMasterId : questionId;
		// const positionText = type == 1 ? "帖子位置" : "问题位置";
		let contentText, positionText, isShowRecConfig;
		if(type == 1) {
			contentText = postMasterId;
			positionText = "帖子位置";
		} else if(type == 2) {
			contentText = questionId;
			positionText = "问题位置";
		} else if(type == 3) {
			contentText = skipName;
			positionText = "帖子位置";
			Object.assign(data, {isShowRecConfig: true});
		}
		return Object.assign(data, {IdText, postMasterId, positionText, contentText});
	},

	render: function() {
		let data = this.format(this.model.toJSON());
		this.$el.html(tpl(data));
		this.initDatepicker();
		const {suggestedStatus, type} = data;
		/***后端返回pageNumber,ranking为整型，
		****添加热帖未添加pageNumber和ranking时,
		****查询列表中返回的pageNumber和ranking为0
		****前端手动清除pageNumber,ranking输入框
		****/
		if(!suggestedStatus) {
			this.$el.find('#pageNumber').val('');
			this.$el.find('#ranking').val('');
		}

		this.recConfigUpdate({isCallBack: true, type});
		this.toggleType(data);
	}
});

export {RecConfigDialog};