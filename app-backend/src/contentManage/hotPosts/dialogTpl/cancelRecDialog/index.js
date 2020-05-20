const tpl = require("./tpl.html");

const Model = Backbone.Model.extend({
	defaults: {

	}
});

const CancelRecDialog = Backbone.View.extend({
	initialize: function (options) {
		this.model = new Model();
		this.model.set({...options});
		this.render();
	},

	events: {

	},

	render() {
		const data = this.model.toJSON();
		this.$el.html(tpl(data));
	}
});

export { CancelRecDialog };