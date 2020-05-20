import {service} from '../../../../../common/service';
import {common} from '../../../../../common/common';

var tpl = require('./tpl.html');
var Model = Backbone.Model.extend({
	defaults: {
		ifShowEditBlock: false,
		quickReplies: null,
		editType: '',  //添加还是修改
		quickReplyContent: '',
		itemChoseRank: ''  //选中的用户的rank
	}
});
var EditQuickReply = Backbone.View.extend({
	initialize: function(options) {
		let {callback} = options;
		this.callback = callback;
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.getQuickReplies();
	},

	events: {
		'click #add': 'showEditBlock',
		'click #modify': 'showEditBlock',
		'click #saveBtn': 'save',
		'click #cancelEdit':'cancelEdit',
		'click #delete':'deleteQuickReply',
		'click #moveUp': 'moveUp',
		'click #moveDown': 'moveDown',
		'click .quick-reply-item': 'chooseReplyItem',
		'click #addQuickReplyImg': 'addQuickReplyImg',
		'click #btnOk': 'onOk'
	},

    getQuickReplies() {
        service.getCommonPhraseList({
            teacherAccount: common.getUserInfo().userAccount
        }, (response) => {
            let quickReplies = response.resultMessage;
            this.model.set({
				quickReplies, 
				//重置其他状态
				ifShowEditBlock: false, 
				editType: '', 
				quickReplyContent: ''
			});
        })
    },

	chooseReplyItem(e) {
		this.$el.find('#commonPhraseEditList').find('.active').removeClass('active');
		$(e.currentTarget).addClass('active');
		
		let rank = $(e.currentTarget).data('rank');
		this.model.set({itemChoseRank: rank});
	},

	scrollToCurrentItm: function(tempPhrase,tempPhraseIndex) {
		if(tempPhraseIndex>5) {
			this.$('#commonPhraseEditList').scrollTop(tempPhraseIndex*35)
		}
	},

	showEditBlock: function(e) {
		let editType = $(e.currentTarget).attr('type');
		let quickReplyContent = '';

		if (editType === 'edit') {
			let $activeItem = this.$el.find('#commonPhraseEditList').find('.active');
			if ($activeItem.length) { //文本消息支持修改
				if ($activeItem.attr('type') == 2) {
					alert('图片不支持修改哦~');
					return;
				}
				quickReplyContent = $activeItem.html().trim();
			} else {
				alert('请选择要修改的快捷回复用语');
				return;
			}
		}

		this.model.set({
			ifShowEditBlock: true,
			editType,
			quickReplyContent
		})
	},

	cancelEdit: function() {
		this.model.set({
			ifShowEditBlock: false,
			editType: '',
			quickReplyContent: ''
		})
	},

	save() {
		//判断当前是添加还是编辑
		let {editType} = this.model.toJSON();
		if (editType === 'add') {
			this.addQuickReply();
		} else if (editType === 'edit') {
			this.editQuickReply();
		}
	},

	//完成编辑，回到列表窗
	onOk() {
		this.callback();
	},

	/**
	 * type为1表示普通文本，2表示图片
	 */
	addQuickReply: function() {
		let quickReply, type;
		if (this.$el.find('.quick-reply-img').length) {
			//说明是图片类快捷回复
			quickReply = this.$el.find('.quick-reply-img').attr('src');
			if (quickReply.indexOf('http') === -1) {
				alert('图片正在上传，请耐心等待！');
				return;
			}
			type = 2;
		} else {
			//是文本类快捷回复
			quickReply = this.$el.find('#inputCommonPhrase').val().trim();
			
			if (!quickReply) {
				alert('请填写快捷回复用语！');
				return;
			}

			if (quickReply.length > 200) {
				alert('快捷用语不可超过200个字符！');
				return;
			}

			type = 1;
		}

		service.addCommonPhrase({
			teacherAccount: common.getUserInfo().userAccount,
			quickReplyContent: quickReply,
			type
		}, (response) => {
			if (response.rs) {
				alert('添加成功！');
				this.getQuickReplies();
			}
		})
	},

	addQuickReplyImg: function() {
		if (this.$el.find("#inputCommonPhrase").val()) {
			alert('快捷回复用语不支持图文混合的内容。');
			return false;
		}

		common.picUploaderNew((response) => {
			if (response.rs) {
				this.$el.find('.img-container').remove();
                let url = response.resultMessage[0].linkUrl;
                this.$el.find('.quick-reply-img').attr('src', url);
            } else {
                alert('上传图片失败:' + response.rsdesp);
            }
		}, (options) => {
			let {type, size, file} = options;
			if (!(type && /(jpg|png|bmp|jpeg)/.test(type.toLowerCase()))) {
				alert("请上传格式为 jpg|png|bmp 的图片！");
                return false;
			}

			var maxSize = 1024 * 1024 * 5;  //最大为5M
            if (size > maxSize) {
                alert('上传图片不得大于5M');
                return false;
            };

			var reader = new FileReader();
            reader.addEventListener('load', () => {
                this.$el.find('.img-quick-reply-holder').html(`
					<img src="${reader.result}" class="quick-reply-img">
					<div class="img-container"></div>
				`).addClass('cover');
            })
            
            if (file) {
                reader.readAsDataURL(file);
            }

			return true;
		})
	},

	editQuickReply() {
		let quickReply = this.$el.find('#inputCommonPhrase').val().trim();
		if (!quickReply) {
			alert('请填写快捷回复用语！');
			return;
		}

		if (quickReply.length > 200) {
			alert('快捷用语不可超过200个字符！');
			return;
		}

		let {itemChoseRank} = this.model.toJSON();

		service.editCommonPhrase({
			teacherAccount: common.getUserInfo().userAccount,
			quickReplyContent: quickReply,
			rank: itemChoseRank,
			type: 1  //文本消息可修改
		}, (response) => {
			if (response.rs) {
				alert('修改成功！');
				this.getQuickReplies();
			} else {
				alert(response.rsdesp);
			}
		})
	},

	deleteQuickReply: function() {
		let $activeItem = this.$el.find('#commonPhraseEditList').find('.active');

		if ($activeItem.length) {
			let rank = $activeItem.data('rank');
			service.deleteCommonPhrase({
				rank,
				teacherAccount: common.getUserInfo().userAccount
			}, (response) => {
				if (response.rs) {
					alert('删除成功！');
					this.getQuickReplies();
				} else {
					alert(response.rsdesp);
				}
			})
		} else {
			alert('请选择要删除的快捷回复用语！');
			return;
		}
	},

	move: function(moveStep) {
		let {itemChoseRank} = this.model.toJSON();

		if (!itemChoseRank) {
			alert('请选择快捷回复用语！');
			return;
		}

		service.moveCommonPhrasePosition({
			teacherAccount: common.getUserInfo().userAccount,
			rank: itemChoseRank,
			moveStep
		}, (response) => {
			if (response.rs) {
				this.model.set({itemChoseRank: itemChoseRank + moveStep});
				this.getQuickReplies();
			}
		})
	},

	moveUp: function() {
		this.move(-1);
	},

	moveDown: function() {
		this.move(1);
	},

	format(data) {
		let {quickReplies = [], itemChoseRank, editType} = data;
		quickReplies.forEach(item => {
			item.active = item.rank == itemChoseRank ? 'active' : '';
			item.richQuickReplyContent = item.type === 2 ? `
									 	<img src="${item.quickReplyContent}" class="img-quick-reply-item">
									 ` : item.quickReplyContent;
            item.isImg = true;
		})

		if (editType === 'add') {
			data.saveBtnName = '添加';
		} else if (editType === 'edit') {
			data.saveBtnName = '保存';
		}
		return data;
	},

	render: function() {
		let data = this.format(this.model.toJSON());
		this.$el.html(tpl(data));
	}
});

export {EditQuickReply}