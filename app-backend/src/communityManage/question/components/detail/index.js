import {service} from '../../../../common/service';
import {common} from '../../../../common/common';
import {ImgPreview} from '../../../../components/imgPreview/index';
import {EmotionBox, EMOTION1} from '../../../../common/emotionUtil';
import tpl from './tpl.html';

const Model = Backbone.Model.extend({
    defaults: {
        isAnswer: 0, //是否被回答过
        questionId: -1, //问题id
        content: '', //问题内容
        answerId: 0, //回答id
        imgsList: [],
    }
});

const Detail = Backbone.View.extend({
    initialize(options) {
        const {questionId, answerId, onBack} = options;
        this.onBack = onBack;
        this.model = new Model();
        this.model.set({questionId, answerId});
        this.listenTo(this.model, 'change:content', this.render);
        this.listenTo(this.model, 'change:answerDetail', this.render);
        this.listenTo(this.model, 'change:imgsList', this.renderImgsList);
        this.getQuestionById();
        if (answerId) {
            this.getAnswer();
        }
    },

    events: {
        'click #replyBtn': 'reply',
        'click #uploadPicBtn': 'uploadPic',
        'click .remove-img-btn': 'removeImg',
        'click .img': 'previewImg',
        'click #showEmotionBoxBtn': 'showEmotionBox',
        'click .img-emotion': 'insertEmotion',
        'click #backToPrevBtn': 'back',
        'focus #answerContent': 'hideEmotionBox',
    },

    back() {
        this.destroy();
        if (typeof this.onBack === 'function') {
            this.onBack();
        }
    },

    getQuestionById() {
        const {questionId} = this.model.toJSON();
        service.adminGetQuestionById({
            questionId,
            userAccount: common.getUserInfo().userAccount
        }, (response) => {
            const {isAnswer, answerId, ...others} = response.resultMessage; 
            this.model.set({
                ...others
            });

            if (isAnswer && !this.model.get('answerId')) {
                this.model.set({
                    answerId
                });
                
                this.getAnswer();
            }
        })
    },

    getAnswer() {
        const {questionId, answerId} = this.model.toJSON();
        service.adminGetAnswerById({
            questionId,
            answerId,
            userAccount: common.getUserInfo().userAccount
        }, (response) => {
            if (response.rs) {
                this.model.set({
                    answerDetail: response.resultMessage
                });
            } else {
                alert(response.rsdesp);
            }
        })
    },

    reply() {
        const {questionId} = this.model.toJSON();
        const answerContent = this.$el.find('#answerContent').val().trim();
        const mediaLinks = this.model.get('imgsList');
        
        if (!answerContent) {
            alert('请填写回答内容~');
            return;
        }

        service.adminReplyQuestion({
            questionId,
            answerContent,
            mediaLinks,
            userAccount: common.getUserInfo().userAccount,
        }, (response) => {
            if (response.rs) {
                alert('回答已经成功提交，可通过“问题回答”页查看已经问题的回答');
                //to do
                this.onBack();
            } else {
                alert(response.rsdesp);
            }
        })
    },

    uploadPic() {
        common.picUploaderNew((response) => {
            const {width: swidth, height: sheight, linkUrl} = response.resultMessage[0];
            const {imgsList} = this.model.toJSON();

            this.model.set({
                imgsList: [].concat(imgsList, [{
                    linkUrl,
                    swidth,
                    sheight
                }])
            })
        })
    },

    showEmotionBox() {
        if (!this.emotionBox) {
            this.emotionBox = new EmotionBox({
                el: this.$el.find('#emotionBox')[0]
            });
        }

        this.$el.find('#emotionBox').show();
    },

    hideEmotionBox() {
        this.$el.find('#emotionBox').hide();
    },

    insertEmotion(e) {
        const emotion = EMOTION1[$(e.currentTarget).parent().attr('emotion')];
        const value = this.$el.find('#answerContent').val();
        this.$el.find('#answerContent').val(`${value}[${emotion}]`);

        this.$el.find('#emotionBox').hide();
    },

    removeImg(e) {
        const index = +$(e.currentTarget).attr('index');
        const {imgsList} = this.model.toJSON();

        let imgsListCopy = [].concat(imgsList);
        imgsListCopy.splice(index, 1);
        this.model.set({
            imgsList: imgsListCopy
        });
    },

    previewImg(e) {
        const imgUrl = $(e.currentTarget).attr('src');
        new ImgPreview({
            imgUrl
        });
    },

    renderImgsList() {
        const {imgsList = []} = this.model.toJSON();
        let rs = '';
        imgsList.forEach((item, index) => {
            const {linkUrl} = item;
            rs += `
                <div class="w80 h80 mr20 psr fl">
                    <i class="psa icon-close-dialog remove-img-btn" style="margin-left: 70px; margin-top: -5px" index="${index}"></i>
                    <img src="${linkUrl}" class="w_100 h_100 pointer img">
                </div>
            `
        });

        this.$el.find('#imgsListContainer').html(rs);

        if (imgsList.length === 9) {
            //上传9张后不可点击
            this.$el.find('#uploadPicBtn').addClass('disabled');
        } else {
            this.$el.find('#uploadPicBtn').removeClass('disabled');
        }
    },

    destroy() {
        this.$el.empty();
        this.undelegateEvents();
    },

    format(data) {
        data.isBindApp = !!common.getUserInfo().userId;
        data.appNickname = common.getUserInfo().appNickname;
        return data;
    },

    render() {
        const data = this.format(this.model.toJSON());
        this.$el.html(tpl(data));
    }
});

export {Detail}
