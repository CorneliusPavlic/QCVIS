import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { Layout, Breadcrumb, Row, Col } from 'antd';
import { Divider, Form, InputNumber, Button } from 'antd';
import { DeploymentUnitOutlined } from '@ant-design/icons';
import axios from 'axios'


import './App.css'

import View_1 from './Components/View_1'
import View_2 from "./Components/View_2";

const { Header, Content } = Layout;


class App extends Component {

    constructor(props) {
        super(props);
        this.renderView = this.renderView.bind(this)
        this.handle_radius = this.handle_radius.bind(this)
        this.handle_View2_button = this.handle_View2_button.bind(this)
        this.state = {
            radius: 50
        }
    }

    handle_View2_button(){
        let trans_times = document.getElementById('view2-button').value
        axios.post(`/api/view2_api/`, {'trans_times': trans_times})
            .then(function(response){
                console.log(response);
            })
            .catch(function(error){
                console.log(error);
            });
    }



    handle_radius(){
        this.setState({
            radius: this.state.radius - 10
        })

    }

    renderView() {

        ReactDOM.render(<View_1 radius={this.state.radius}/>, this.container_1);
        ReactDOM.render(<View_2 radius={this.state.radius}/>, this.container_2);

    }


    componentDidMount() {
        console.log('main mounted')

        this.container_1 = document.querySelector("#container_1");
        this.container_2 = document.querySelector("#container_2");

        this.renderView()
    }



    componentDidUpdate() {
        console.log('main will update')
        this.renderView()
    }



    render(){
    return(
        <Layout className="layout">
            <Header className = "header" style={{ height: '50px' }}>
                <span><DeploymentUnitOutlined style={{ fontSize: '20px', color: '#d8d8d8',  margin: '0 14px 0 0' }} /></span>
                <p className="header-title">QCVIS</p>
                <p className="paper-title">The title of the IEEE VIS'22 paper</p>
            </Header>
            <Content style={{ padding: '0 50px', backgroundColor:'#ffffff' }}>
                <Breadcrumb  separator=">" style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>Quantum Computer</Breadcrumb.Item>
                    <Breadcrumb.Item>Quantum Circuit Overview</Breadcrumb.Item>
                    <Breadcrumb.Item>Quantum Circuit</Breadcrumb.Item>
                    <Breadcrumb.Item>Run</Breadcrumb.Item>
                </Breadcrumb>
                <div className="view">
                    <Row gutter={10} style={{height: '100%'}}>
                        <Col className="gutter-row" span={5} style={{height: '100%'}}>
                            <div style={{ background: "#ffffff" }}>
                                <button onClick={this.handle_radius}>Render</button>
                                <Divider plain><span style={{fontSize: '0.8em'}}>Circuit Overview</span></Divider>
                                <Form initialValues={{
                                    'transpile-number':100
                                }}>
                                    <Form.Item label="Transpile">
                                        <Form.Item name="transpile-number" noStyle>
                                            <InputNumber id={'view2-button'} min={100} max={1000} step={100}/>
                                        </Form.Item>
                                        <span className="ant-form-text"> times</span>
                                        <Form.Item>
                                            <Button block style={{margin:'10px 0'}} onClick={this.handle_View2_button}>Launch Transpilation</Button>
                                        </Form.Item>
                                    </Form.Item>
                                </Form>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={19} style={{height: '100%'}}>
                            <div style={{ background: "#f9f9f9",  height: '100%' }}>
                                <div id="container_1"></div>
                                <div id="container_2"></div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>


    )
  }
}

export default App;