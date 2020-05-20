/**
 * @file 声音播放
 * @author hualuyao
 */

class AudioPlayer {
    /**
     * @params options {object} 
     * @params options.$el {jqueryElement} 要交互的dom节点,若为空,则默认初始化时就自动播放
     * @params options.src {string} 要播放的声音文件的src
     * @params options.autoplay {boolean} 是否自动播放, 默认为false
     * @params 
     */
    constructor(options = {}) {
        this.options = options;
        this.init();
    }

    init() {
        var options = this.options;
        var $el = options.$el;
        
        if ($el) {
            //有交互dom
        } else {
            //无交互dom，默认自动播放一段声音
            let src = options.src;
            let autoplay = true;
            if (src) {
                let audio = new Audio(src);
                audio.play();
            } else {
                alert('请传入声音文件的路径！');
                return;
            }
        }
    }
}

export {AudioPlayer}