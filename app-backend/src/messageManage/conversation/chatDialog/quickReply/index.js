import {Dialog} from '../../../../components/dialog/index';
import {ChooseQuickReply} from './chooseQuickReply/index';
import {EditQuickReply} from './editQuickReply/index';

class QuickReply {
    constructor(options) {
        let {bsParams, onClick} = options;
        this.bsParams = bsParams;
        this.onClick = onClick;
        this.show();
    }

    handleClickItem(options) {
        let {type, quickReplyContent} = options;
        let rs = this.onClick({
            messageType: type,
            chatContent: quickReplyContent,
            ...this.bsParams
        });

        if (rs) {
            this.d.closeDialog();
        }
    }

    show() {
        this.chooseQuickReply && this.chooseQuickReply.undelegateEvents();
        this.chooseQuickReply = new ChooseQuickReply({
            callback: this.toggleToEditPanel.bind(this),
            onClick: this.handleClickItem.bind(this)
        });
        this.d && this.d.closeDialog();
        this.d = new Dialog({
            title: '选择快捷回复',
            content: this.chooseQuickReply.$el,
            type: 4,
            showFooter: false
        })
    }

    toggleToEditPanel() {
        this.editQuickReply && this.editQuickReply.undelegateEvents();
        this.editQuickReply = new EditQuickReply({
            callback: _ => {
                this.editDialog.closeDialog();
                this.show();
            }
        });
        this.editDialog = new Dialog({
            title: '设置快捷回复用语',
            content: this.editQuickReply.$el,
            type: 4,
            showFooter: false
        });
    }
}

export {QuickReply}
