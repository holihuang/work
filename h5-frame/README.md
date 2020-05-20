# h5-frame：h5模板工具

#### h5-frame是一款基于react开发的h5组件工具，提供以下功能：

	1. 只需基本的配置可生成基本的h5框架页面，含多页面（类似轻量app ui）
	2. 工具集成了常用的跨平台环境信息，app/微信分享工具及app版本diff工具等
	3. 更多期待...

#### 安装

	yarn add @sunl-fe/h5-frame

#### 使用

	import { H5Frame, platform, appUtils } from '@sunl-fe/h5-frame'

	const props = {
		// 单页
		page: {
			filter: {
				tabs: [
					{ title: 'First Tab', key: 'a' },
					{ title: 'Second Tab', key: 'b' },
					{ title: 'Third Tab', key: 'c' },
				],
			},
			body: {
				component: Component, // 业务ui组件
				bodyProps: {},        // 业务ui组件props
			},
		},
		// 多页
		pageList: [{
			filter: {
				tabs: [
					{ title: 'First Tab', key: 'a' },
					{ title: 'Second Tab', key: 'b' },
					{ title: 'Third Tab', key: 'c' },
				],
				onChange: e => {
					console.log(e)
				}
			},
			body: {
				component: Component,
				bodyProps: {},
			}
		}, {
			useDefaultFilter: false,  // 是否使用默认的filter组件
			filter: {
				component: Component,
				filterProps: {},
			},
			body: {
				component: B,
				bodyProps: {},
			}
		}, {
			filter: {
				tabs: [
					{ title: 'First Tab', key: 'a' },
					{ title: 'Second Tab', key: 'b' },
					{ title: 'Third Tab', key: 'c' },
				],
				onChange: e => {
					console.log(e)
				}
			},
			body: {
				component: Component,
				bodyProps: {},
			}
		}]
		// 底部导航栏
		tabBarList: [
			{ key: 'a', title: 'tab1', icon: img, selectedIcon: imgActive },
			{ key: 'b', title: 'tab2', icon: img, selectedIcon: imgActive },
			{ key: 'c', title: 'tab3', icon: img, selectedIcon: imgActive }
		],
	}

	<H5Frame {...props} />

#### Api

Item：page || pageList[index]

	api名称				说明								类型				默认值				
	useDefaultFilter	是否使用默认filter				  boolean			true

Item.filter

useDefaultFilter = true

	filter 同antd-mobile Tabs组件props

useDefaultFilter = false

	api名称				说明								类型				默认值		必填
	component			ui组件筛选器				   		ReactNode			无		true
	filterProps			ui组件筛选器props			    	object				无		true

Item.body

	api名称				说明								类型				默认值		必填
	component			ui组件							ReactNode			无		true
	bodyProps			ui组件props						object				无		true


Item[filter|body].platform

	api名称				说明							类型					默认值		必填
	env					环境变量(key)				     string				web			
	envName				环境变量(text)	   				 string				web		
	detailInfo			环境具体信息						object				{ sys: '' }

Item[filter|body].platform.detailInfo

	环境						内容
	web						{ sys: '' }  // sys: web工作台系统名称
	app						{ deviceInfo, userInfo, } // 见jsBridge中deviceInfo, userInfo
	skynet(天网精灵客户端)		{}
	wx						{}

Item[filter|body].appUtils

	api名称				说明								类型				入参
	versionAbove		app版本比较方法(>=targetVersion)	  func			string(eg: '3.4.2') // targetVersion
	appShare			app分享方法						   func			[hooks, params], // jsBridge actionShare第二三个参数
	wxShare				微信分享方法						  func			[cfg, data],  // cfg签名返回的内容, data卡片填充项
	goToNative			跳转到native页面					func			{ page, hooks, data, actionType } // page: native页面名, hooks: 回调(见，jsBridge hooks 可自定义)，data：参数 actionType默认gotoNative（gotoNative | doAction）

注意：wxShare需要自己手动引微信jsSdk

#### 优势：

1. h5开发者只需专注业务
2. 减少跨部门沟通成本（三家app， 尤其是员工app）

#### 潜在的问题：

props中的platform由于app的调用时机问题，使用也区分时机（frame的didMout中重新获得），为避免其他问题，业务组件didMount拿不到platform信息，页面加载完成可以拿到platform信息

解决方案：可以从@sunl-fe/h5-frame包中，单独引入platform, appUtils（didMount之后使用）

#### 日志

1.0.3及以下版本

import H5Frame from '@sunl-fe/h5-frame'

1.0.4及以上版本

import { H5Frame, platform, appUtils } from '@sunl-fe/h5-frame'

1.0.10

初始化指定tab页面（默认左侧第一个tab页面）

1.0.11

两种引入H5Frame方式
import H5Frame from '@sunl-fe/h5-frame'

import { H5Frame, platform, appUtils } from '@sunl-fe/h5-frame'

1.0.12

新增goToNative util api，h5跳转到native页面

方式： 

1. gotoNative，详见jsBridge gotoNative(page, data),无回调
2. doAction，详见jsBridge doAction(page, JSON.stringify{succeedCallback, failedCallback, canceledCallback, others}, JSON.stringify(data))

注： succeedCallback： jsBridge肯定有，failedCallback：jsBridge不保障， canceledCallback： jsBridge不保障，others：自定义回调

1.0.13 - 1.0.17

忽略该版本区间

1.0.18

h5-frame包添加css样式文件

1.0.20

修复page.css剩余高度样式问题