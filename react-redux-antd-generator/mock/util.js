const fs = require('fs');
const path = require('path');
/**
 * 该方法用于将之前的json file转换成json object
 * @param {*} filePath 
 */
const parseJsonFile = function(filePath) {
    const content = fs.readFileSync(path.resolve(__dirname, filePath), {'encoding':'utf-8'});
    return JSON.parse(content);
}
module.exports = {parseJsonFile};