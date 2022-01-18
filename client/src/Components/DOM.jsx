import React, {Component} from 'react';
import axios from 'axios'

class DOM extends Component {
    constructor(props){
        super(props);
        this.state = {
            item : 'react component'
        }
    }

    componentDidMount(){

    }

    render(){

        return(
            <div>
                <svg id="svg_view">

                </svg>
            </div>
        )
    }
}

export default DOM;
