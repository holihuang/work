var Model = Backbone.Model.extend({
    defaults: {

    }
});

var Items = Backbone.View.extend({
    initialize: function(options) {
        //参数为当前页数和页码，更新和删除配置
        var {pageSize, pageNo, updateCfg, delCfg} = options;
        this.model = new Model();
        this.model.set({pageSize, pageNo, reqCfg, listCfg, updateCfg, delCfg});
        this.listenTo(this.model, 'change:resultList', this.render);
        this.getData();
    },
    
    createTpl() {
        let {resultList = [], list} = this.model.toJSON();
        let tpl = `{{#resultList}}<tr>`;
        resultList.forEach((item, index) => {
            listCfg.forEach((listItem) => {
                tpl += `<td>${item[listItem]}</td>`;
            })
        })
        
        //操作项
        tpl += `<td>更新</td>`;

        tpl += `</tr>{{/#resultList}}`;

        return tpl;
    },

    getData() {

    },

    format() {

    },

    render() {

    }
})

export {Items}