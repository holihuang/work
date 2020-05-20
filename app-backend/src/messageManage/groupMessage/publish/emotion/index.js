import {EMOTION_EN_2_CH, EMOTION_CH_2_EN} from './emotions.js';
import tpl from './tpl.html';

const emotionList = [];
let i = 0;
for (let item in EMOTION_CH_2_EN) {
    let k = Math.floor(i / 8);
    emotionList[k] = emotionList[k] || [];

    emotionList[k].push({
        emotionUrl: `./images/emotion-small/${EMOTION_CH_2_EN[item]}.png`,
        emotionTip: item,
        emotion: EMOTION_CH_2_EN[item]
    })

    i++;
}

const Emotion = Backbone.View.extend({
    initialize(options) {
        const {onClick} = options;
        this.onClick = onClick;
        this.render();
    },

    events: {
        'click .emotion-item': 'handleClick'
    },

    handleClick(e) {
        const emotion = $(e.currentTarget).data('emotion');
        this.onClick(emotion);
    },

    render() {
        this.$el.html(tpl({emotionList}));
    }
})

export {Emotion}
