import React, {Component} from 'react';

class Views extends Component {
    constructor(props){
        super(props);
        this.state = {
            count: this.props.count
        }
    }


    render(){
        const {count} = this.state

        return (
            <div>Child_2 {count}</div>
        );
    }
}

export default Views;
