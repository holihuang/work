import {Table} from '../../../components/table/index';
import {ImgPreview} from '../../../components/imgPreview/index';
import {service} from '../../../common/service';
import cfg from '../cfg'
import {CfgOptDialog} from '../cfgOptDialog/index';
import {global} from '../../../common/global';

const Model = Backbone.Model.extend({
    defaults: {
        resultList: [],
        infoType: 1,
    }
});

const ContentItems = Backbone.View.extend({
    initialize(options) {
        const {resultList, infoType, refresh} = options;
        this.refresh = refresh;
        this.model = new Model();
        this.model.set({resultList, infoType});
        this.render()
    },

    events: {
        'click .edit': 'edit',
        'click .delete': 'deleteOpt',
        'click .img': 'previewImg',
        'click .review': 'review',
        'click .off': 'off',
        'click .check': 'check',
    },

    deleteOpt(e) {
        const index = +$(e.currentTarget).attr('index');
        const {resultList} = this.model.toJSON();
        const {name} = resultList[index];

        const tip = `确定要删除"${name}"吗？删除后将无法恢复！`;

        if (confirm(tip)) {
            service.adminDeleteOptById({
                infoIdList: [resultList[index].infoId]
            }, (response) => {
                if (response.rs) {
                    alert('删除成功！');
                    this.refresh();
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    previewImg(e) {
        const imgUrl = $(e.currentTarget).attr('src');
        new ImgPreview({
            imgUrl
        });
    },

    edit(e) {
        const index = +$(e.currentTarget).attr('index');
        const {resultList, infoType} = this.model.toJSON();
        const {infoId} = resultList[index];
        new CfgOptDialog({
            infoId,
            infoType,
            type: 2,
            callback: () => {
                this.refresh();
            }
        });
    },

    review(e) {
        const index = +$(e.currentTarget).attr('index');
        const {resultList, infoType} = this.model.toJSON();
        const {infoId} = resultList[index];
        new CfgOptDialog({
            infoId,
            infoType,
            type: 3,
            callback: () => {
                this.refresh();
            }
        });
    },

    off(e) {
        const index = +$(e.currentTarget).attr('index');
        const {resultList, infoType} = this.model.toJSON();
        const {infoId, name, endTime} = resultList[index];

        const tip = `"${name}"的预定下线时间是${endTime},尚未到达下线时间，确定立即下线吗？`;
        if (confirm(tip)) {
            service.adminUpdateStateById({
                infoId,
                state: 4, //表示立即下线
            }, (response) => {
                if (response.rs) {
                    alert('下线成功！');
                    this.refresh(); //刷新列表
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    //查看
    check(e) {
        const index = +$(e.currentTarget).attr('index')
        const { resultList, infoType } = this.model.toJSON()
        const {infoId} = resultList[index]
        new CfgOptDialog({
            infoId,
            infoType,
            type: 4,
        });
    },

    destroy() {
        this.$el.empty();
        this.undelegateEvents();
    },

    render() {
        const {resultList, infoType} = this.model.toJSON();
        //const typeText = infoType == 1 ? 'banner' : (
        //        infoType == 2 ? '开屏' : '弹窗'
        //    );

        const typeText = cfg['tablePicTitle'][infoType]

        this.table = new Table({
            columns: [
                {
                    field: 'ID',
                    content: 'infoId'
                }, {
                    field: '标题',
                    content: 'name'
                }, {
                    field: `${typeText}图`,
                    escapeHtml: false,
                    content: item => `<img src="${item.infoImage}" class="img">`
                }, {
                    field: '展示周期',
                    content: item => `${item.startTime} To${item.endTime}`
                }, {
                    field: '状态',
                    content: item => {
                        //checkState: 0-失败；1-待审核；2-通过；4-已强制下线
                        //state: 0-未展示；1-展示中；2-正常结束
                        const {checkState, state} = item;
                        switch(checkState) {
                            case 0:
                                return '审核失败';
                            case 1:
                                return '待审核';
                            case 2:
                                switch(state) {
                                    case 0:
                                        return '等待上线';
                                    case 1:
                                        return '上线展示';
                                    case 2:
                                        return '已下线';
                                }
                            case 4:
                                return '已下线';
                        }
                    },
                },
                // {
                //     field: '发布部门',
                //     content: item => {
                //         switch(+item.depart) {
                //             case 0:
                //                 return '平台运营';
                //         }
                //     }
                // },
                {
                    field: '受众类型',
                    content: item => {
                        switch(item.userType) {
                            case 0:
                                return '非付费用户';
                            case 1:
                                return '服务期内付费用户';
                            case 2:
                                return '全部用户';
                            case 3:
                                return '超服务期付费用户';
                        }
                    }
                },
                // {
                //     field: '创建人',
                //     content: 'creater'
                // },
                {
                    field: '最后提交人',
                    content: item => {
                        const newCreater = item.creater.replace(/@sunlands.com/i, "");
                        return newCreater;
                    }
                },
                 {
                    field: '操作',
                    escapeHtml: false,
                    content: (item, index) => {
                        const {checkState, state} = item;
                        switch(checkState) {
                            case 0: //审核失败
                                return `
                                    <span class="edit orange" index="${index}">编辑</span>
                                    <span class="delete orange" index="${index}">删除</span>
                                    <span class="orange check" index="${index}">查看</span>
                                `
                            case 1: //待审核
                                const checkStr = global.permissions['OPT_CHECK'] ? `<span class="review orange" index="${index}">审核</span>` : ''

                                return `
                                    ${checkStr}
                                    <span class="orange check" index="${index}">查看</span>
                                `
                            case 2:
                                switch(state) {
                                    case 0:  //待展示
                                        return `
                                            <span class="edit orange" index="${index}">编辑</span>
                                            <span class="orange check" index="${index}">查看</span>
                                        `
                                    case 1: //展示中
                                        const offlineStr = global.permissions['OPT_OFF_LINE'] ? `<span class="orange off" index="${index}">立即下线</span>` : '';
                                        return `
                                            ${offlineStr}
                                            <span class="orange check" index="${index}">查看</span>
                                        `
                                    case 2:
                                        return `
                                            <span class="orange check" index="${index}">查看</span>
                                        `
                                }
                            case 4:
                                return `
                                    <span class="orange check" index="${index}">查看</span>
                                `
                        }
                    }
                }
            ],
            dataList: resultList
        })

        this.$el.html(this.table.$el);
    }
})

export {ContentItems}
