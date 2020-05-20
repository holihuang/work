/**
*** @file 图文转换插件 格式: <img src="xxxxx">
**/

//转换图片为'{XX}'文本格式
const convertPicToText = function(richText, picUrl) {
	const regStr = `<img src="${picUrl}">`;
	const reg = new RegExp(regStr, 'g');
	let rs;
	let convertedText = richText;
	while(rs = reg.exec(richText)) {
		convertedText = richText.replace(rs[0], `{${picUrl}}`);
	}
	return convertedText;
}

export { convertPicToText }

