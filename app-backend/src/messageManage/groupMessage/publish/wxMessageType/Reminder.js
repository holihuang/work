
import React from 'react'

class Reminder extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentDidMount() {

    }

    dateHanler = e => {
        return this.props.setStateParamKeyValue(e.target.value, 1)
    }

    timeHanlder = e => {
        return this.props.setStateParamKeyValue(e.target.value, 2)
    }

    render() {
        return (
           <div>
                <div style = {{
                    display: this.props.visible ? 'block' : 'none'
                }}>
                    <div style={{ marginTop: '20px' }}>
                        &ensp;&ensp;&ensp;&ensp;发送日期：
                        <input value={this.props.paramKeyValue1 } onChange={this.dateHanler} style={{ width: '400px' }} type="text" placeholder="30字以内" />
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        &ensp;&ensp;&ensp;&ensp;发送时间：
                        <input value={this.props.paramKeyValue2 } onChange={this.timeHanlder} style={{ width: '400px' }} type="text" placeholder="30字以内" />
                    </div>
                </div>
           </div>
        )
    }
}



export default Reminder

