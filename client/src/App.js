import React, {Component} from 'react'
import { Layout, Breadcrumb, Row, Col } from 'antd';
import { DeploymentUnitOutlined } from '@ant-design/icons';


import './App.css'

import DOM from './Components/DOM.jsx'

const { Header, Content } = Layout;

const style = { background: "#0092ff", padding: "8px 0" };

class App extends Component {

  render(){
    return(
        <Layout className="layout">
            <Header className = "header" style={{ height: '60px' }}>
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
                <Row gutter={10}>
                    <Col className="gutter-row" span={5}>
                        <div style={style}>

                        </div>
                    </Col>
                    <Col className="gutter-row" span={19}>
                        <div style={style}>
                            <DOM/>
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>


    )
  }
}

export default App;