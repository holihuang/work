/**
 * @file 图片放大预览
 * @author hualuyao
 */

var ImgPreview = function(options) {
    let {imgUrl} = options;
    this.imgUrl = imgUrl;
    this.init();
    this.bindEvents();
}

ImgPreview.prototype.init = function() {
    let div = document.createElement('div');
    $(div).addClass('full-fix');
    let closeDivBtn = document.createElement('i');
    $(closeDivBtn).addClass('icon-close-full-fix');
    div.appendChild(closeDivBtn);
    document.body.appendChild(div);
    let img = document.createElement('img');
    $(img).attr('src', this.imgUrl);
    div.appendChild(img);
}
ImgPreview.prototype.bindEvents = function() {
    $('.icon-close-full-fix').on('click', function() {
        $('.full-fix').remove();
    })
}

export {ImgPreview}