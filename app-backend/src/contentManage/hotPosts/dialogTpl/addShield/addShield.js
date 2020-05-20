/*
**  @options {Boolean} isShowTopicName
**  true: 话题详情页
**  false: 首页
*/
import {service} from '../../../../common/service';
import {Select} from '../../../../components/select/index';
let tpl = require('./addShield.html');

let Model = Backbone.Model.extend({
	defaults: {
		isShowTopicNameFlag: false,    //标志：查询(依据posterMasterId)列表结果没有数据
		topicNameList: []
	}
});

let AddShield = Backbone.View.extend({
	initialize: function(options) {
		this.model = new Model();
		this.options = options;
		let {isShowTopicName} = options;
		this.listenTo(this.model, 'change:isShowTopicName', this.render);
		this.listenTo(this.model, 'change:isShowTopicNameFlag', this.render);
		this.model.set({
			isShowTopicName
		});
		this.render();
		this.listenTo(this.model, 'change:topicNameList', this.render);
	},

	events: {
		'blur #postMasterId': 'isDetailTopicNameList',
		'click input[name="contextType"]': 'toggleRadio'
	},

	toggleRadio(e) {
		const checkedRadioVal = +$(e.currentTarget).val();
		if(checkedRadioVal == 1) {
			this.$el.find(".form-group-postMasterId-text").text("帖子ID");
			this.$el.find("#postMasterId").attr('placeholder', '请填写帖子ID');
		} else if(checkedRadioVal == 5) {
			this.$el.find(".form-group-postMasterId-text").text("问题ID");
			this.$el.find("#postMasterId").attr('placeholder', '请填写问题ID');
		}
	},

	isDetailTopicNameList: function() {
		const {isShowTopicName} = this.model.toJSON();
		if(isShowTopicName) {
			this.initAddShieldTopicNameList();
		}
	},

	initAddShieldTopicNameList: function() {
		const postMasterId = this.$el.find("#postMasterId").val();
		let {isShowTopicNameFlag} = this.model.toJSON();
		const isPage = 0;
		const params = {postMasterId, isPage};
		if(postMasterId.length) {
			service.getTopicNameList(params, (response) => {
				if(response.rs) {
					if(response.hasOwnProperty('resultMessage')) {
						if(response.resultMessage && response.resultMessage.resultList) {
							const topicNameList = response.resultMessage.resultList;
							this.model.set({
								postMasterId,
								topicNameList
							});
						}
					} else {
						isShowTopicNameFlag = true;
						this.model.set({
							postMasterId,
							isShowTopicNameFlag
						});
					}
					
				} else {
			    	alert("获取话题名称下拉列表选项失败，请刷新重试！");
			    };
			})
		}
	},

	renderAddShieldSelect: function(topicNameList, id) {
		let list = this.convertToValTxtObj(topicNameList);
		this.addShieldSelect = new Select({
			el: this.$el.find(id),
			itemList: list,
			name: 'addShieldTopicName',
			selectedItemsText: "全部"
		});
	},

	convertToValTxtObj: function(list) {
	    let arr = [];
	    list.forEach((item, index) => {
	      arr.push({
	        value: item.topicId,
	        text: item.topicTitle
	      })
	    })
	    return arr;
	},

	render: function() {
		let data = this.model.toJSON();
		this.$el.html(tpl(data));
		const {topicNameList, postMasterId} = this.model.toJSON();
		topicNameList && this.renderAddShieldSelect(topicNameList, '#shieldDialogTopicName');
		postMasterId && this.$el.find("#postMasterId").val(postMasterId);
	}
});

export {AddShield};