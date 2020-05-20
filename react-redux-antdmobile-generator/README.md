# react-redux-antdmobile-generator

## 更新日志

#### 2017.10.19  

1. webpack1更新到webpack3
webpack3较webpack2变化不大，基本上兼容webpack2，主要增加了两个特性：

+ 作用域的提升(Scope Hoisting)

```
    module.exports = {
        plugins: [
            new webpack.optimize.ModuleConcatenationPlugin()
        ]
    }
```
官方给的说法是该功能也会让代码打包的体积变得更小，加快运行的速度，但是试了一下发现并没有感觉特别明显，index.js由282k变成280k，运行速度也感觉不出变快，可能在大型的复杂的系统会有明显的效果吧

+ 魔法注释（Magic Comments）

webpack2中引入了Code Splitting-Async的新方法import()，webpack将传入import方法的模块打包到一个单独的代码块（chunk），但是不能为生成的chunk指定trunkName，因此在webpack3中提出了Magic Comment用于解决该问题，用法如下：

```
    import(/* webpackChunkName: "my-chunk-name" */ 'module');
```

2. antd-mobile更新到最新版本v1.7.0

Picker的用法较之前的版本有点差异，主要是data和cascade这两个属性，具体看antd-mobile的文档，其它用法不变

## 安装package

```
yarn install
```
## 编译dll

```
npm run dll
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

详见：[http://172.16.121.241:7002/package/@sunl-fe/dataservice](http://172.16.103.105:7002/package/@sunl-fe/dataservice)

感谢小斌斌提供的dataService库！！！

### 5. 其他

剩下的reducer saga 不说了，根据咱们套路来开发。

### 6. autoprefixer

使用autoprefixer自动补全css，自由使用css3吧！