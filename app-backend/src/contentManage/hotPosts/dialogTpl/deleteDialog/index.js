/**
** @params: isSingleClick{Boolean}..单选删除||多选删除（必填项）
** @params: typeOfRecommend{Number}..推荐内容类型(必填项)
**
**/
let tpl = require('./tpl.html');

let Model = Backbone.Model.extend({
	defaults: {
		isMulti: false,
		isPost: true
	}
});

let DeleteDialog = Backbone.View.extend({
	initialize: function(options) {
		this.model = new Model();
		this.options = options;
		let {checkedNumber, postSubject, postSubjectArr, typeOfRecommend, content, skipTitle, isSingleClick} = options;
		this.model.set({
			checkedNumber,
			postSubject,
			postSubjectArr,
			typeOfRecommend,
			content,
			skipTitle,
			isSingleClick
		});
		this.render();
	},

	events: {

	},

	format: function(data) {
		let {checkedNumber, postSubject, postSubjectArr, isMulti, typeOfRecommend, content, skipTitle, isPost, isSingleClick} = data;
		
		if(isSingleClick) {
			if(typeOfRecommend == 1) {
				return {checkedNumber, postSubject, isPost};
			} else if(typeOfRecommend == 2) {
				isPost = false;
				return {checkedNumber, content, isPost};
			} else if(typeOfRecommend == 3) { 
				return {checkedNumber, skipTitle, isActivePage: true};
			}
		} else {
			if(typeOfRecommend == 2) {
				isPost = false;
			}
			isMulti = true;
			return {checkedNumber, isMulti, isPost};
		}
		
	},

	render: function() {
		let data = this.format(this.model.toJSON());
		this.$el.html(tpl(data));
	}
});

export {DeleteDialog};