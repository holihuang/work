const tpl = require('./tpl.html');

const Model = Backbone.Model.extend({
	defaults: {

	}
});

const Config = Backbone.View.extend({
	initialize(options) {
		this.model = new Model();
		this.options = options;
		let {topicClassifyList=[], item} = options;
		const { classifyIds } = item;
		topicClassifyList = this.formatTopicClassifyList(topicClassifyList);
		// this.listenTo(this.model, 'change:classifyIds', this.render);
		this.model.set({
			topicClassifyList,
			classifyIds
		})
		this.render();
	},

	events: {
		'click .classify-list-li': 'toggleClass'
	},

	toggleClass(e) {
		if($(e.currentTarget).hasClass('checked')) {
			$(e.currentTarget).removeClass('checked');
		} else {
			$(e.currentTarget).addClass('checked');
		}
	},

	formatTopicClassifyList(list) {
		const arr = [];
		list.forEach((item, index) => {
			arr.push({
				value: item.classifyId,
				text: item.classifyName
			})
		});
		return arr;
	},

	reDisplayConfig(classifyIds) {
		if(classifyIds.indexOf(",") === -1) {
			//回显一项
			const index = +classifyIds - 1;
			this.$el.find(`.classify-list li:eq(${index})`).addClass('checked');
		} else {
			// 回显多项
			const classifyIdsArr = classifyIds.split(',');
			for(let i = 0; i < classifyIdsArr.length; i++) {
				let index = +classifyIdsArr[i] - 1;
				this.$el.find(`.classify-list li:eq(${index})`).addClass('checked');
			}
		}
	},

	render() {
		const data = this.model.toJSON();
		this.$el.html(tpl(data));
		const { classifyIds } = data;
		classifyIds && this.reDisplayConfig(classifyIds);
	} 
});

export { Config };