import {common} from '../../../../common/common';
import {url} from '../../../../common/url';
let tpl = require('./tpl.html');

let Model = Backbone.Model.extend({
	defaults: {

	}
});

let PatchAdd = Backbone.View.extend({
	initialize: function(options) {
		this.model = new Model();
		const {beginTime, endTime, postMasterId, pageNumber, ranking} = options;
		this.model.set({
			beginTime,
			endTime,
			postMasterId,
			pageNumber,
			ranking
		});
		this.render();
	},

	events: {
		'click #uploadUnPaidHotMasterPostFile': 'uploadUnPaidHotMasterPostFile',
		'click input[name="contextType"]': 'toggleTemplateUrl'
	},

	uploadUnPaidHotMasterPostFile: function(e) {
		const that = this;
		const fileDataNumber = this.$el.find('#fileDataNumber');
		const canImportNumber = this.$el.find('#canImportNumber');
		const uploadUnPaidHotMasterPostFile = this.$el.find('#uploadUnPaidHotMasterPostFile');
		common.uploadPic({
			uploadUrl: url.UPLOAD_UNPAYED_HOT_MASTER_POST_FILE,
			onChange: function() {
				$(e.currentTarget).html('正在上传...').prop('disabled', 'disabled');
			},
			onSuccess: function(resultMessage) {
				let {sucCount, sucFileCount, sucList} = resultMessage[0];
				fileDataNumber.text(sucFileCount);
				canImportNumber.text(sucCount);
				$(e.currentTarget).html('更新').prop('disabled', false);
				sucList && that.model.set({sucList});
			},
			onError: function(data) {
				alert(data);
				uploadUnPaidHotMasterPostFile.text('选择文件');
			}
		})
	},

	toggleTemplateUrl() {
		const type = +this.$el.find("input[name='contextType']:checked").val();
		if(type === 1) {
			this.$el.find("#getTemplet").attr('href', 'http://store.sunlands.com/original/20170626/unpaid_hot_post.xls');
			this.$el.find(".form-group-import label").text("可导入帖子数:");
		} else if(type === 2) {
			this.$el.find("#getTemplet").attr('href', 'http://store.sunlands.com/common/community/question_template.xls');
			this.$el.find(".form-group-import label").text("可导入问答数:");
		}
	},

	render: function() {
		let data = this.model.toJSON();
		this.$el.html(tpl(data));
	}
});

export {PatchAdd};