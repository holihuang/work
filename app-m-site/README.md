# react-redux-antdmobile-generator

## 安装package

```
npm install
```

## 运行

```
npm start
```

## 编译

```
npm run dist
```

会把源代码编译到`/dist`目录下

## 说明
为了去掉大家在react项目使用$的习惯，痛定思痛，决定在生成器不再提供jquery

## 文档结构

react移动端的文档结构和react生成器的文档结构一样，可参考[http://172.16.117.224/fe/react-redux-antd-generator/blob/master/README.md](http://172.16.117.224/fe/react-redux-antd-generator/blob/master/README.md)

## 和react-redux-antd-generator的区别

### 1.flexible

UI通常选择iPhone6作为基准设计尺寸，交付给前端的设计尺寸是按750px * 1334px为准(高度会随着内容多少而改变)。前端开发人员通过一套适配规则自动适配到其他的尺寸。flexible是手淘团队推出的一个移动端适配方案，主要原理是：加载页面的时候通过js获取屏幕的大小以及设备像素比，不同手机型号的这些参数都不一样，设置不同的font-size和initial-scale。

事实上他做了这几样事情：

> 动态改写<meta>标签
> 给<html>元素添加data-dpr属性，并且动态改写data-dpr的值
> 给<html>元素添加font-size属性，并且动态改写font-size的值

具体参考：[使用Flexible实现手淘H5页面的终端适配](https://github.com/amfe/article/issues/17)

### 2.postcss px2rem
px2rem会把我们less文件中写的px单位转换成rem单位；
less中的像素单位按照750px宽的设计稿来；比如一个按钮在设计稿中的宽高是240px * 90px，我们在样式中的宽高就写width: 240px;height: 90px; px2rem会自动转换成rem单位。
如果不想转换，可以使用PX单位。

例如：

```
border: 1PX solid #000; //不会转换
border: 1px solid #000; //会转换
```

安装：`npm install postcss-pxtorem --save`

在webpack(cfg/base.js)中配置如下：

```
const pxtorem = require('postcss-pxtorem');
postcss: [
    pxtorem({
		rootValue: 75,
		propWhiteList: [],
		selectorBlackList: [/^html$/, /^\.ant-/,  /^\.github-/, /^\.gh-/],
	})
]

//loader配置

loaders: [
	{
		test: /\.css$/,
		loader: ExtractTextPlugin.extract("style-loader", "css-loader!postcss",  { publicPath: './'})
	},
	{
			test: /\.less$/,
			include: path.join(srcPath, 'styles/less'),
			loader: ExtractTextPlugin.extract("style-loader", "css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!less-loader!postcss",  { publicPath: './'})
	},
	{
			test: /\.less$/,
			exclude: path.join(srcPath, 'styles/less'),
			loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader!postcss",  { publicPath: './'})
	},
	{
		test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/,
		loader: 'url-loader?limit=8192'
	},
	{
		test: /\.(mp4|ogg|svg)$/,
		loader: 'file-loader'
	}
]
```

### 3.classnames

使用classnames来管理多类名。

```
import {gray3, f30} from '../../styles/less/common.less';
import classNames from 'classnames';

const cardHeaderClass = classNames(gray3, f30);

return (<span className={cardHeaderClass}>{reserveInfo.title}</span>)
```

更多用法参考：[https://www.npmjs.com/package/classnames](https://www.npmjs.com/package/classnames)

### 4. dataService

dataService的ajax请求用fetch去请求，舍弃jQuery的ajax了。用法与以前保持一致。

详见：[http://172.16.103.105:7002/package/@sunl-fe/dataservice](http://172.16.103.105:7002/package/@sunl-fe/dataservice)

感谢小斌斌提供的dataService库！！！

### 5. 其他

剩下的reducer saga 不说了，根据咱们套路来开发。