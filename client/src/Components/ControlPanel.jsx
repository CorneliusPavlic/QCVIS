import React, {Component} from 'react';
import ReactDOM from 'react-dom'
import * as d3 from 'd3'

class ControlPanel extends Component {
    constructor(props){
        super(props);
        this.state = {
            count : this.props.count,
            init: 'state_init'
        }
        this.init = 'init'

        console.log('constructor')

    }

    componentDidMount(){
        this.init = 'init_mount'
        console.log(this.init)

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.init = 'init_up'
        console.log(this.init)

    }


    render(){

        let count = this.props.count
        let click = this.props.click
        console.log('init_render')
        return (
            <div onClick={click}>Child_1 {count}</div>
        );
    }
}

export default ControlPanel;
