import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Layout, Typography } from 'antd';
import { DeploymentUnitOutlined } from '@ant-design/icons';

import './App.css';
import QuantumCircuit from './Components/newView'; // Replace with correct import path for QuantumCircuit
import TransDataView from './Components/TransDataView';

const { Header, Content } = Layout;
const { Text } = Typography;

const App = () => {
    const [view, setView] = useState('QuantumCircuit'); // 'QuantumCircuit' or 'TransDataView'
    const [selectedComputer, setSelectedComputer] = useState('ibm_brisbane');
    const [view1Attr, setView1Attr] = useState('error_rate');
    const container1Ref = useRef(null);

    const renderView = (viewName) => {
        ReactDOM.unmountComponentAtNode(container1Ref.current);
        if (viewName === 'QuantumCircuit') {
            ReactDOM.render(
                <QuantumCircuit
                    select_computer={setSelectedComputer}
                    backend={selectedComputer}
                    view1_attr={view1Attr}
                    clear_state={() => {}}
                    time_range={30}
                    interval={7}
                />,
                container1Ref.current
            );
        } else if (viewName === 'TransDataView') {
            ReactDOM.render(
                <TransDataView backendName={selectedComputer} />,
                container1Ref.current
            );
        }
    };

    useEffect(() => {
        console.log('App mounted');
        container1Ref.current = document.querySelector('#container_1');
        renderView(view);
    }, [view]);

    return (
        <Layout className="layout">
            <Header className="header" style={{ height: '10%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <DeploymentUnitOutlined style={{ fontSize: '1.6em', color: '#d8d8d8', marginRight: '10px'}} />
                    <Text className="header-title" style={{ color: '#ffffff', fontSize: '2em', fontWeight: 'bold' }}>QUIET</Text>
                </div>
                <Text className="paper-title" style={{ color: '#ffffff', fontSize: '2em', marginLeft: '20px', flexGrow: 1 }}>
                    A Quality-Aware Visualization System for Noise Mitigation in Quantum Computing
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <Text
                        style={{
                            fontSize: '2em',
                            color: view === 'QuantumCircuit' ? '#40a9ff' : '#ffffff',
                            cursor: 'pointer',
                            textDecoration: view === 'QuantumCircuit' ? 'underline' : 'none',
                        }}
                        onClick={() => setView('QuantumCircuit')}
                    >
                        Quantum Circuit
                    </Text>
                    <Text
                        style={{
                            fontSize: '2em',
                            color: view === 'TransDataView' ? '#40a9ff' : '#ffffff',
                            cursor: 'pointer',
                            textDecoration: view === 'TransDataView' ? 'underline' : 'none',
                        }}
                        onClick={() => setView('TransDataView')}
                    >
                        Trans Data View
                    </Text>
                </div>
            </Header>
            <Content style={{ padding: '0 5px', backgroundColor: '#ffffff', marginTop: '10px' }}>
                <div className="view">
                    <div style={{ background: '#fcfcfc', height: '100%' }}>
                        <div id="container_1"></div>
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default App;
