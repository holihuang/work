
const dialogContentTpl = require('./dialogContent.html')
//汉字校验
const chineseCharactersReg = new RegExp("[\\u4E00-\\u9FFF]+");

let Model = Backbone.Model.extend({
    defaults: {

    }
});

let DialogContent = Backbone.View.extend({
    initialize(options) {
        this.model = new Model();
        this.options = options
        this.render()
    },
    events: {
        'click .addMemberDialogOkBtn': 'closeAllDialog',
    },

    closeAllDialog() {
        const {callBack} = this.options
        if(callBack && typeof callBack === 'function'){
            callBack()
        }
    },

    render() {
        this.$el.html(dialogContentTpl(this.options));
    }
})

export {DialogContent}
