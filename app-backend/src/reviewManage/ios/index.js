import tpl from './tpl.html';
import {service} from '../../common/service';
import {common} from '../../common/common';

let Model = Backbone.Model.extend({
    defaults: {
        configValue: '',
        appKey: [],
        appkeySelected: '',
        configRemark: '', //备注
    }
});

let IOSReview = Backbone.View.extend({
    initialize(options) {
        this.model = new Model();
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'change:appkeySelected', this.getConfigAppVersion);
        this.render();
        this.getAppKeys().then(_ => {
            this.getConfigAppVersion();
        })
    },

    events: {
        'change #appKey': 'handleAppKeyChange',
        'click #okBtn': 'submit'
    },

    handleAppKeyChange() {
        this.model.set({
            appkeySelected: this.$el.find('#appKey').val()
        })
    },

    getAppKeys() {
        return new Promise((resolve, reject) => {
            service.getAppKeys({
                userAccount: common.getUserInfo().userAccount
            }, (response) => {
                if (response.rs) {
                    const {appKey} = response.resultMessage;
                    this.model.set({
                        appKey,
                        appkeySelected: appKey[0]
                    });
                    resolve();
                } else {
                    alert(response.rsdesp);
                }
            })
        })
    },

    getConfigAppVersion() {
        const {appkeySelected} = this.model.toJSON();

        service.getConfigAppVersion({
            userAccount: common.getUserInfo().userAccount,
            appKey: appkeySelected
        }, (response) => {
            if (response.rs) {
                let {configValue, configRemark} = response.resultMessage;
                this.model.set({
                    configValue,
                    configRemark
                });
            } else {
                alert(response.rsdesp);
            }
        })
    },

    submit() {
        let revision = this.$el.find('#revisionIpt').val().trim();
        if (!revision) {
            alert('请输入版本号！');
            return false;
        }

        service.setConfigAppVersion({
            userAccount: common.getUserInfo().userAccount,
            appVersion: revision,
            appKey: this.model.get('appkeySelected')
        }, (response) => {
            if (response.rs) {
                alert('配置成功！');
                this.getConfigAppVersion();
            } else {
                alert(response.rsdesp);
            }
        })
    },

    format(data) {
        const {appkeySelected, appKey} = data;

        const appKeyObjArr = appKey.map(item => {
            return {
                appKey: item,
                selected: item === appkeySelected ? 'selected' : ''
            }
        })

        return {
            ...data,
            appKeyObjArr
        }
    },

    render() {
        let data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

export {IOSReview}
