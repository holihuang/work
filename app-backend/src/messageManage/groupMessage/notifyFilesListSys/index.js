import {Table} from '../../../components/table/index';
import {service} from '../../../common/service';
import {common} from '../../../common/common';
import {global} from '../../../common/global';
import {Pager} from '../../../components/pager/index';
import {ImportDialog} from './importDialog/index'
import tpl from './tpl.html';

const PAGE_SIZE = 25;

let Model = Backbone.Model.extend({
    defaults: {
        resultList: [],
        pageCount: 0
    }
});

let NotifyFilesList = Backbone.View.extend({
    initialize(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change:resultList', this.renderTable);
        this.listenTo(this.model, 'change:pageCount', this.renderPager);
        this.render();
        this.listNotifyFile();
    },

    events: {
        'click #importFileBtn': 'importFile',
        'click .delete': 'delete',
    },

    importFile() {
        new ImportDialog({
            callback: () => {},
            refreshList: this.listNotifyFile.bind(this)
        })
        // const isTeacherRole = global.permissions.IS_TEACHER_ROLE;
        // const importFileAction = isTeacherRole ? 'uploadGroupMessageFile' : 'uploadNotifyFile';
        // service[importFileAction](() => {
        //     common.loading('正在导入，请稍后...');
        // }, (response) => {
        //     common.removeLoading();
        //     if (response.rs) {
        //         setTimeout("alert('导入成功！')", 500);
        //         //导入成功后，刷新列表
        //         let {pageSize, pageNo} = this.model.toJSON();
        //         this.listNotifyFile({
        //             pageSize,
        //             pageNo
        //         })
        //     } else {
        //         setTimeout(`alert("${response.rsdesp}")`, 500);
        //     }
        // }, {
        //     creater: common.getUserInfo().userAccount
        // })
    },

    delete(e) {
        let index = +$(e.currentTarget).attr('index');
        let {resultList} = this.model.toJSON();
        let {fileId} = resultList[index];
        const isTeacherRole = global.permissions.IS_TEACHER_ROLE;
        const deleteFileAction = isTeacherRole ? 'deleteGroupMessageFile' : 'deleteNotifyFile';

        if (confirm('确定要删除吗？')) {
            service[deleteFileAction]({
                fileId
            }, (response) => {
                if (response.rs) {
                    alert('删除成功！');
                    //删除成功后刷新列表
                    let {pageSize, pageNo} = this.model.toJSON();
                    this.listNotifyFile({
                        pageSize,
                        pageNo
                    });
                } else {
                    alert(response.rsdesp);
                }
            })
        }
    },

    //获取导入消息对象列表
    listNotifyFile(options = {}) {
        let {pageSize = PAGE_SIZE, pageNo = 1} = options;

        service.listNotifyFile({
            pageSize,
            pageNo
        }, (response) => {
            if (response.rs) {
                let {countPerPage: pageSize, pageCount, pageIndex: pageNo, resultList} = response.resultMessage;
                this.model.set({
                    pageSize,
                    pageCount,
                    pageNo,
                    resultList
                });
            } else {
                alert(response.rsdesp);
            }
        })
    },

    renderTable() {
        let {resultList, pageSize, pageNo} = this.model.toJSON();
        resultList = resultList.map(item => {
            // 历史数据 是没有内容的，兼容一下。
            const sender = {
                0: '免费用户',
                1: '付费用户',
            }[item.sendUserType] || ''
            return {
                ...item,
                sender,
            }
        })

        this.table = new Table({
            columns: [
                {
                    field: '序号',
                    content: (item, index) => {
                        return pageSize * (pageNo - 1) + (index + 1);
                    }
                }, {
                    field: '文件名称',
                    content: (item) => {
                        return item.fileName.length > 20 ? item.fileName.substr(0, 20) + '...' : item.fileName;
                    }
                }, {
                    field: '导入成功人数',
                    content: 'succCount'
                }, {
                    field: '导入失败人数',
                    content: 'failCount'
                }, {
                    field: '发送对象',
                    content: 'sender'
                }, {
                    field: '操作人',
                    content: 'operator'
                }, {
                    field: '操作时间',
                    content: 'operatorTime'
                }, {
                    field: '操作',
                    escapeHtml: false,
                    content: (item, index) => {
                        let aText = item.fileUrl
                                    ? `<a class="orange" href="${item.fileUrl}">下载导入结果</a>`
                                    : `<a class="orange disabled" href="javascript:void(0)">无结果可下载</a>`;
                        let aSendStyle = 'color: #3D4190'

                        let aSendHref = `#groupMessage/publish/${item.fileId}/${item.sendUserType}`

                        if (item.isSendButtonAvailable === 0) {
                            aSendStyle = 'color: gray; cursor: default'
                            aSendHref = 'javascript:;'
                        }
                        let publishBtnText = item.succCount
                                    ? `<a class="orange" style="${aSendStyle}"
    href="${aSendHref}">发布通知</a>`
                                    : `<span class="gray1" href="javascript:void(0)" title="导入成功人数为0，不能发布通知">发布通知</span>`
                        return `
                            ${aText}
                            ${publishBtnText}
                            <span class="orange delete" index="${index}">删除</span>
                        `
                    }
                }
            ],
            dataList: resultList
        })

        this.$el.find('#tableContainer').html(this.table.$el);
    },

    renderPager() {
        let {pageCount, pageSize, pageNo} = this.model.toJSON();
        this.pager && this.pager.undelegateEvents();
        this.pager = new Pager({
            el: this.$el.find('#pagerContainer')[0],
            pageCount,
            pageSize,
            pageNo,
            onChange: this.listNotifyFile.bind(this)
        });
    },

    format(data) {
        data.canUploadNotifyFile = global.permissions.UPLOAD_NOTIFY_FILE;
        return data;
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
})

export {NotifyFilesList}
