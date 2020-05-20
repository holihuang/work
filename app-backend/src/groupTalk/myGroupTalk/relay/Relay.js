
import React from 'react'
import {common} from '../../../common/common'
import { render } from 'react-dom'
import { Modal, Upload, Input, Checkbox, Icon, Button } from 'antd'
import util from '../../../common/util'

const Search = Input.Search
const ButtonGroup = Button.Group
const PAGE_SIZE = 20
// import 'antd/lib/modal/style/css'
// import 'antd/lib/upload/style/css'

class Main extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			title : "群聊消息转发",
			visible : true,
			pageNo : 1, // 当前页
			pageCount: 0, // 总页数
			searchText: '',
			groupList : [], // 展示项目
			checkList : [], // 选中项
		}
	}

	componentDidMount() {
		this.sendCommand(1)
	}

	// 发送请求
	sendCommand = (pageNo, condition) => {
		// 数据格式如下
		// {
		// 	"command":"GET_TRANS_GROUP_MSG_LIST",
		// 	"data":{
		// 		"userAccount":"fuxue@sunlands.com",
		// 		"pageNo":1,
		// 		"pageSize":20,
		// 		"imUserId":1917997,
		// 		"groupId":7856,
		// 		"condition":"搜索关键字"
		// 	}
		// }
		const { groupId } = this.props
		const { userAccount } = common.getUserInfo()
		const imUserId = common.getUserInfo().imIdForGroup;
		const param = {
			command : 'GET_TRANS_GROUP_MSG_LIST',
			data : {
				userAccount,
				imUserId,
				groupId,
				pageNo,
				pageSize : PAGE_SIZE,
			}
		}
		if (condition) {
			param.data.condition = condition
		}
		this.props.send(param)
	}

	// 获取板块名字
	getAlbumName = () => {
		console.log(this.props)
	}

	// 关闭
	handleCancel = () => {
		this.setState({
			visible: false,
		})
		if (this.props.closeRelay && typeof this.props.closeRelay == 'function') {
			this.props.closeRelay()
		}
	}

	// 点击确定转发
	handleOk = () => {
		// {
		// 	"command":"MULTI_SEND",
		// 	"data":{
		// 		"chatContent":"国庆节快乐",
		// 		"hasAite":0,
		// 		"toGroupIdList":[],
		// 		"messageType":1,
		// 		"imUserId":1917997,
		// 		"uniqueKey":"19179971538138989567",
		// 		"senderPortrait":"http://store.sunlands.com/small/20170425/1493101457698.jpg",
		// 		"fromUserNickName":"fx",
		// 		"fromUserMemberDegree":true
		// 	}
		// }
		// btnType: "2"
		// closeRelay: ƒ closeRelay()
		// groupId: 8078
		// groupName: "周22-1900-莫23"
		// imUserId: "1918082"
		// left: 1764
		// messageId: "846199"
		// messageType: "1"
		// msgWrap: div.item-left.item-right-click
		// send: ƒ ()
		// sendtime: "2018-10-19 11:30:39"
		// top: 711

		
		const {
			chatContent,
			messageType,
			imUserId,
			senderPortrait,
			fromUserNickName,
			fromUserMemberDegree,
		} = this.props || {}
		
		let { checkList } = this.state
		let toGroupIdList = []
		checkList.map((item,index) => {
			toGroupIdList.push(item.groupId)
		})
		const uniqueKey = '' + imUserId + Date.now();
		if (toGroupIdList.length) {
			const param = {
				command : 'MULTI_SEND',
				data : {
					chatContent,
					hasAite: 0,
					toGroupIdList,
					messageType,
					imUserId,
					uniqueKey,
					senderPortrait,
					fromUserNickName,
					fromUserMemberDegree
				}
			}
			this.props.send(param)
			this.props.closeRelay() // 关闭转发框
		} else {
			alert('请选择转发的群聊')
		}

		// 打点
        util.slog('group_click_forward_ok', {
            messageId: this.props.messageId,
            fromGroupId: this.props.groupId,
            toGroupId: toGroupIdList.join('_'),
        })
	}

	// 备选项改变
	getTransGroupMsgList = (data) => {

		const { rs, pageNo, resultMessage } = data || {}
		const { pageCount, resultList } = resultMessage
		const { checkList } = this.state
		if (rs) {
			checkList.map((item) => {
				const groupId = item.groupId
				resultList.map((citem,index) => {
					if (citem.groupId == groupId) {
						resultList[index].checked = true
					}
				})
			})
			this.setState({
				pageNo,
				pageCount,
				groupList: resultList,
			})
		} else {
			alert('请求失败，请稍后再试')
		}


	}

	// 渲染选中项
	renderCheckedList = () => {
  		const { checkList } = this.state
		return checkList.map((item,index) => {
			if (item.checked) {
				return (<div className="relay-item">
						<img src={item.groupUrl} alt="头像"
						onError={(e) => {e.target.onerror = null;e.target.src="images/default-group-img.png"}}
						/>
						<span className="relay-item-name" title={item.groupName}>{item.groupName}</span>
						<span onClick={this.unCheckItem(index)} style={{float: 'right',marginRight: '15px'}}><Icon type="close-circle" theme="filled" /></span>
            		</div>)	
			} else {
				return null
			}
        })
	}

	// 取消选中
	unCheckItem = (index) => (e) => {
		const { checkList, groupList } = this.state
		const groupId = checkList[index].groupId
		checkList.splice(index,1)
		groupList.map((item,index) => {
			if (item.groupId == groupId) {
				item.checked = false
			}
		})
		this.setState({
			groupList,
			checkList,
		})
	}

	// 点击选择
	changeItem = (index) => (e) => {

		const { checkList, groupList } = this.state
		const checked = e.target.checked
		const groupId = groupList[index].groupId

		let trueNum = 0
		checkList.map(item => {
			if (item.checked) {
				trueNum = trueNum + 1
			}
		})

		if (checked && trueNum >=10 ) {
			alert('最多只能选择10个群')
			return
		}
		groupList[index].checked = checked
		if (checked) {
			const item = groupList[index]
			checkList.push(item)
		} else {
			let idxTemp = 0
			checkList.map((item,index) => {
				if (item.groupId == groupId) {
					idxTemp = index
				}
			})
			checkList.splice(idxTemp,1)
		}
		this.setState({
			checkList,
			groupList,
		})
	}
	
	// 渲染备选项
	renderGroupList = () => {
		const { groupList } = this.state
		if (groupList && groupList.length) {
			return groupList.map((item,index) => {
            	return (<div className="relay-item">
						<img src={item.groupUrl} alt="头像"
						onError={(e) => {e.target.onerror = null;e.target.src="images/default-group-img.png"}}
						/>
						<span className="relay-item-name" title={item.groupName}>{item.groupName}</span>
						<Checkbox style={{float:'right',marginRight:'15px'}} onChange={this.changeItem(index)} checked={item.checked}></Checkbox>
            		</div>)
        	})	
		} else {
			return (<div style={{padding: '5px'}}>暂无结果...</div>)
		}
		
	}
	
	
	// 搜索
	onSearch = (value) => {
		
		this.setState({
			searchText: value,
			pageNo: 1,
			groupList: [],
		},() =>{
			if (value) {
				this.sendCommand(1,value)
			} else {
				this.sendCommand(1)
			}	
		})
		
	}

	// 下一页
	nextPage = () => {
		const {
			pageNo,
			pageCount,
			searchText,
		} = this.state

		if (pageNo < pageCount) {
			const curPageNo = pageNo + 1
			if (searchText) {
				this.sendCommand(curPageNo, searchText)
			} else {
				this.sendCommand(curPageNo)
			}
		} else {
			alert('已经是最后一页了~')
		}
	}

	// 上一页
	prevPage = () => {
		const {
			pageNo,
			searchText,
		} = this.state

		if (pageNo > 1) {
			const curPageNo = pageNo - 1
			if (searchText) {
				this.sendCommand(curPageNo, searchText)
			} else {
				this.sendCommand(curPageNo)
			}
		} else {
			alert('已经是第一页~')
		}
	}
 

	render() {
		const {
			title,
			visible,
			checkList,
			pageNo, // 当前页
			pageCount, // 总页数
		} = this.state
		const width = 600
		const checkedNum = checkList.length
		return (
			<Modal 
				title={title} 
				visible={visible}
				width={width}
				okText={'确定转发'}
				onOk={this.handleOk}
				onCancel={this.handleCancel}
		>	
			<div className="relay-modal">
				<div className="relay-box">
				 	<Search
				      	placeholder="搜索群聊"
				      	onSearch={this.onSearch}
				      	style={{ width: 255 }}
				    />
					<div className="relay-group-box" style={{'borderRight': '1px solid #ddd'}}>
						{this.renderGroupList()}
					</div>
					<span style={{marginTop:'10px',fontWeight:'bold',display:'inline-block'}}>
						{pageNo}/{pageCount}
					</span>
					<div style={{position: 'absolute',right: '0',bottom: '-15px',right: '15px'}}>
						<ButtonGroup size={'small'}>
					      	<Button onClick={this.prevPage}><Icon type="left" /></Button>
					      	<Button onClick={this.nextPage}><Icon type="right" /></Button>
					    </ButtonGroup>
					</div>
				</div>

				<div className="relay-box">
					<p>已选择了{checkedNum}个群聊~</p>
					<div className="relay-group-box" style={{width: '100%',height: '100%',marginLeft: '10px'}}>
						{this.renderCheckedList()}
					</div>
				</div>
			</div>
		  
		</Modal>
		)
	}
}

export default Main






