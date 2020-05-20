
import React from 'react'

class Weekly extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentDidMount() {

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
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;姓名：**学员
                    </div>
                    <div style = {{marginTop:'20px'}}>
                        &ensp;&ensp;&ensp;&ensp;学科：学员专业名称
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        &ensp;&ensp;&ensp;&ensp;时间：
                        <input value={this.props.paramKeyValue3 } onChange={this.timeHanlder} style={{ width: '400px' }} type="text" placeholder="30字以内" />
                    </div>
                </div>
           </div>
        )
    }
}



export default Weekly

