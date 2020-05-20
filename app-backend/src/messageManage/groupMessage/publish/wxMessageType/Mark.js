
import React from 'react'

class Mark extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentDidMount() {

    }

    placeHanler = e => {
        return this.props.setStateParamKeyValue(e.target.value, 1)
    }

    nameHanlder = e => {
        return this.props.setStateParamKeyValue(e.target.value, 2)
    }

    timeHanlder = e => {
        return this.props.setStateParamKeyValue(e.target.value, 3)
    }

    render() {
        return (
           <div>
                <div style = {{
                    display: this.props.visible ? 'block' : 'none'
                }}>
                    <div style={{ marginTop: '20px' }}>
                        &ensp;&ensp;&ensp;&ensp;活动基地：
                        <input value={this.props.paramKeyValue1 } onChange={this.placeHanler} style={{ width: '400px' }} type="text" placeholder="30字以内" />
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        &ensp;&ensp;&ensp;&ensp;活动名称：
                        <input value={this.props.paramKeyValue2 } onChange={this.nameHanlder} style={{ width: '400px' }} type="text" placeholder="30字以内" />
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        &ensp;&ensp;&ensp;&ensp;签到时间：
                        <input value={this.props.paramKeyValue3 } onChange={this.timeHanlder} style={{ width: '400px' }} type="text" placeholder="30字以内" />
                    </div>
                </div>
           </div>
        )
    }
}



export default Mark

