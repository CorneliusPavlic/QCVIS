import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { Layout, Breadcrumb, Row, Col } from 'antd';
import { DeploymentUnitOutlined } from '@ant-design/icons';


import './App.css'

import DOM from './Components/DOM.jsx'
import ControlPanel from './Components/ControlPanel'
import Views from './Components/Views'

const { Header, Content } = Layout;


class App extends Component {

    constructor(props) {
        super(props);
        this.renderChildren = this.renderChildren.bind(this)
        this.state = {
            count: 10
        }
    }

    renderChildren(){
        const {count} = this.state;
        const {container1El, container2El} = this;
        ReactDOM.render(<ControlPanel count={count}/>, container1El);
        ReactDOM.render(<Views count={count}/>, container2El);
    }



    componentDidMount() {
        this.container1El = document.querySelector("#container-1");
        this.container2El = document.querySelector("#container-2");

        this.renderChildren()
    }



    componentDidUpdate() {
        console.log('will re-mount')
        this.renderChildren();
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
                            <div style={{ background: "#eff0e7", padding: "8px 0" }}>
                                <div id="container-1"></div>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={19} style={{height: '100%'}}>
                            <div style={{ background: "#eff0e7", padding: "8px 0", height: '100%' }}>
                                {/*<DOM/>*/}
                                <div id="container-2"></div>
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