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
        axios.get(`/api/add_one`)
            .then(res => {
                const persons = res.data;
                console.log(persons)
            })
    }

    render(){

        return(
            <div>
                <h1>I'm a child component from {this.state.item}</h1>
            </div>
        )
    }
}

export default DOM;
