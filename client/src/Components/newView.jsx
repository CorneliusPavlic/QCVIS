import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ConfigurationModal from './ConfigurationModal';


const QuantumCircuit = (props) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const screenHeight = windowSize.height;
    const screenWidth = windowSize.width;
    const graphWidth = Math.floor(windowSize.width);
    const graphHeight = Math.floor(windowSize.height * 0.8);

    useEffect(() => {
        // Listener for window resize
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        
        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    //a list of all attributes found in the data and whether they should be visible by default, 
    //Invert determines if a higher values is good or bad. for example a high T1 is good but a high readout error is bad.
    // add to this list if IBM adds more attributes to the data. in theory you could query this from the data, but the issue is knowing whether to invert or to set as default.  
    const [attributes, setAttributes] = useState({
        T1: {visible: true, invert: false},
        T2: {visible: true, invert: false},
        readout_error: {visible: true, invert: true},
        frequency: {visible: false, invert: false},
        anharmonicity: {visible: false, invert: true},
        prob_meas0_prep1: {visible: false, invert: true},
        prob_meas1_prep0: {visible: false, invert: true},
        readout_length: {visible: false, invert: true},
    });

    

    // default ranges to prefill the manual range input fields. These are updated when manual mode is triggered. If set to automatic these are set to updated values automatically
    const [ranges, setRanges] = useState({
        T1: { min: 50, max: 200 },
        T2: { min: 50, max: 200 },
        frequency: { min: 4.5, max: 5.5 },
        anharmonicity: { min: 0.0, max: -0.4 },
        readout_error: { min: 0.08, max: 0.0 },
        prob_meas0_prep1: { min: 0.1, max: 0.0 },
        prob_meas1_prep0: { min: 0.1, max: 0.0 },
        readout_length: { min: 1200, max: 1000 },
    });

    const attributeAbbreviations = {
        T1: "T1",
        T2: "T2",
        frequency: "FQ",
        anharmonicity: "AH",
        readout_error: "RE",
        prob_meas0_prep1: "M0",
        prob_meas1_prep0: "M1",
        readout_length: "RL"
      };

    // default color pallette. 
    const [colorPalette, setColorPalette] = useState({ start: 'red', end: 'green' });

    // essentially the same as ranges. 
    const [gateColoring, setGateColoring] = useState({
        gate_error: { min: 0.1, max: 0 },
        gate_length: { min: 50, max: 200 },
    });
    const svgRef = useRef();
    const popupRef = useRef();
    const tooltipRef = useRef();
    //default gate display for coloring
    const [colorMetric, setColorMetric] = useState('gate_error');
    //attributes to be displayed.
    const [selectedAttributes, setSelectedAttributes] = useState(["T1", "T2", "readout_error"]);
    const [backends, setBackends] = useState([]);
    const [selectedBackend, setSelectedBackend] = useState();
    const [data, setData] = useState(null);

    // saves new attributes from the Modal
    const handleSaveConfig = (config) => {
        setAttributes(config.attributes);
        setRanges(config.ranges);
        setSelectedBackend(config.backend);
        handleAttributeChange(config.attributes);
        setColorPalette(config.colorPalette);
    };

    // resets attributes to default values
    const handleResetConfig = () => {
        setAttributes({
            T1: {visible: true, invert: false},
            T2: {visible: true, invert: false},
            readout_error: {visible: true, invert: true},
            frequency: {visible: false, invert: false},
            anharmonicity: {visible: false, invert: true},
            prob_meas0_prep1: {visible: false, invert: true},
            prob_meas1_prep0: {visible: false, invert: true},
            readout_length: {visible: false, invert: true},
        });
        setRanges({
            T1: { min: 50, max: 200 },
            T2: { min: 50, max: 200 },
            frequency: { min: 4.5, max: 5.5 },
            anharmonicity: { min: 0.0, max: -0.4 },
            readout_error: { min: 0.08, max: 0.0 },
            prob_meas0_prep1: { min: 0.1, max: 0.0 },
            prob_meas1_prep0: { min: 0.1, max: 0.0 },
            readout_length: { min: 1200, max: 1000 },
        });
        setColorPalette({ start: 'red', end: 'green' });
        setSelectedAttributes(["T1", "T2", "readout_error"])
    };

    const calculateAutomaticAttributeRanges = () => {
        return Object.keys(attributes).reduce((acc, attr) => {
            const invert = attributes[attr].invert;
            
            // Extract the values for the given attribute from each qubit
            const values = data?.qubits.map((qubit) => {
                // For each qubit, find the dictionary with the matching attribute name
                const attributeData = qubit.filter(item => item.name === attr); 
                return attributeData.length > 0 ? attributeData[0].value : 0; // Use the value from the first match or 0 if not found
            }) || [0];
    
            const range = {
                min: Number(Math.min(...values).toFixed(5)),
                max: Number(Math.max(...values).toFixed(5)),
            };
    
            acc[attr] = invert ? { min: range.max, max: range.min } : range;
            return acc;
        }, {});
    };

    // returns a color scale for a given attribute
    const getAttributeScale = (attribute) => {
        if (!ranges[attribute]) {
            console.error(`No range defined for attribute: ${attribute}`);
            return null; // Handle attributes that are not in the ranges
        }
        return d3.scaleLinear()
            .domain([ranges[attribute].min, ranges[attribute].max])
            .range([colorPalette.start, colorPalette.end]);
    };
    
    // function for dragging nodes programatically 
    function startDrag(node, simulation) {
        if (!simulation.active) simulation.alphaTarget(0.3).restart();
        node.fx = node.x;
        node.fy = node.y;
    }

    // function for ending drag programatically
    function endDrag(node, simulation) {
        if (!simulation.active) simulation.alphaTarget(0);
        node.fx = null;
        node.fy = null;
    }

    // Fetch available backends when the component mounts
    useEffect(() => {
        fetch('/api/pending_jobs')
            .then(response => response.json())
            .then(data => {
                const backendNames = Object.keys(data);
                setBackends(backendNames);
            })
            .catch(error => console.error("Error fetching backends:", error));
        setSelectedBackend(props.backend)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch data based on selected backend
    useEffect(() => {
        if (selectedBackend) {
            props.select_computer(selectedBackend);
            const startTime = performance.now(); // Start timing
    
            fetch(`/api/get_json_backend/${selectedBackend}`)
                .then(response => response.json())
                .then(data => {
                    const endTime = performance.now(); // End timing
                    console.log(`API call took ${(endTime - startTime).toFixed(2)} ms`);
                    setData(data);
                })
                .catch(error => console.error("Error fetching backend data:", error));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBackend]);
    


    // Process data for D3 visualization whenever data, colorMetric, or selectedAttributes changes
    useEffect(() => {
        if (data) {
            processData(data);
        }
    }, [data, colorMetric, selectedAttributes]);

    // const handleBackendChange = (event) => {
    //     setSelectedBackend(event.target.value);
    // };

    const handleAttributeChange = (updatedAttributes) => {
        // Filter only the attributes that are true and update the state
        const trueAttributes = Object.keys(updatedAttributes).filter(
            (key) => updatedAttributes[key].visible === true
        );
        setSelectedAttributes(trueAttributes);
    };
    
    //creates nodes and edges based on IBM data.
    const processData = (data) => {
        const nodes = data.qubits.map((attributes, i) => ({
            id: i,
            attributes: attributes
        }));
        const edges = data.gates
            .filter(gate => gate.qubits && gate.qubits.length === 2)
            .map(gate => ({
                source: gate.qubits[0],
                target: gate.qubits[1],
                gate_error: gate.parameters.find(param => param.name === 'gate_error').value,
                gate_length: gate.parameters.find(param => param.name === 'gate_length').value
            }));
        setRanges(calculateAutomaticAttributeRanges());
        setTimeout(visualizeGraph(nodes, edges), 100);
    };


    // Visualize the graph using D3
    const visualizeGraph = (nodes, edges) => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous elements
    
        const colorScale = d3.scaleLinear()
            .domain([gateColoring[colorMetric].min, gateColoring[colorMetric].max])
            .range([colorPalette.start, colorPalette.end]);
    
        const tooltip = d3.select(tooltipRef.current);
    
        // Create a parent group for zooming
        const zoomGroup = svg.append("g").attr("class", "zoom-group");
    
        // Set up zoom behavior
        const zoom = d3.zoom().on("zoom", (e) => {
            zoomGroup.attr("transform", e.transform); // Apply transform to the parent group
        });
    
        svg.call(zoom);
    
        // Add links to the parent group
        const link = zoomGroup.selectAll(".link")
            .data(edges)
            .enter()
            .append("line")
            .attr("class", "link")
            .style("stroke-width", 6)
            .style("stroke", (d) => colorScale(d[colorMetric]))
            .on("mouseover", function (event, d) {
                tooltip.style("display", "block")
                    .html(
                        `<strong>Gate Error:</strong> ${Number((d.gate_error * 100).toFixed(5))}%<br>
                         <strong>Gate Length:</strong> ${Number(d.gate_length.toFixed(3))}`
                    );
            })
            .on("mousemove", function (event) {
                tooltip.style("top", `${event.pageY - 30}px`)
                    .style("left", `${event.pageX - 50}px`);
            })
            .on("mouseout", function () {
                tooltip.style("display", "none");
            });
    
        // Add nodes to the parent group
        const node = zoomGroup.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .on("click", (event, d) => showPopup(event, d, nodes, edges))
            .call(d3.drag()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
            );
    
        // Add concentric rings for each node
        node.each(function (d) {
            const baseRadius = 5;
            const radiusOffset = 10;
    
            selectedAttributes.forEach((attribute, i) => {
                const attributeObj = d.attributes.find(attr => attr.name === attribute);
                const value = attributeObj ? attributeObj.value : 0;
                const colorValue = getAttributeScale(attribute)(value);
                d3.select(this).append("circle")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", baseRadius + i * radiusOffset)
                    .attr("fill", colorValue)
                    .attr("fill-opacity", 0)
                    .attr("stroke", colorValue)
                    .attr("stroke-width", radiusOffset);
            });
        });
    
        // Add text labels
        zoomGroup.selectAll(".text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("pointer-events", "none")
            .text(d => d.id);
    
        // Simulation
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges).id(d => d.id).distance(0))
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(graphWidth / 2, graphHeight / 2));
    
        // Middle node setup
        const middleNode = nodes[Math.floor(nodes.length / 2)];
        middleNode.fx = graphWidth / 2;
        middleNode.fy = graphHeight / 2;

        // Holds the middle node to get everything to settle into position
        setTimeout(() => {
                startDrag(middleNode, simulation);
                setTimeout(() => endDrag(middleNode, simulation), 30000);
            }, 0);
        simulation.on("tick", () => {
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
    
            node.attr("transform", d => `translate(${d.x},${d.y})`);
            zoomGroup.selectAll(".text")
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });
    };
    

    // displays popup with qubit information
    const showPopup = (event, d, nodes, edges) => {
        event.stopPropagation(); // Prevent event bubbling
        const popup = d3.select(popupRef.current);
        
        // Title and attributes
        let content = `<h3>Qubit ${d.id}</h3>`;
        content += d.attributes.map(attr => `<p>${attr.name}: ${attr.value.toFixed(5)} ${attr.unit}</p>`).join("");
        
        // Display connections
        const connections = edges.filter(edge => !(edge.source.id === d.id) !== !(edge.target.id === d.id));
        const uniqueConnections = new Set();
        content += "<h4>Connections:</h4>";
        content += connections
          .filter(connection => {
            const connectedQubit = connection.source.id === d.id ? connection.target.id : connection.source.id;
            if (uniqueConnections.has(connectedQubit)) {
              return false; // Skip duplicate
            }
            uniqueConnections.add(connectedQubit); // Mark as seen
            return true; // Include unique connection
          })
          .map(connection => {
            const connectedQubit = connection.source.id === d.id ? connection.target : connection.source;
            return `<p><a href="#" class="connected-qubit" data-qubit="${connectedQubit.id}">Qubit ${connectedQubit.id}</a> - 
            Gate Error: ${Number((d.gate_error * 100).toFixed(5))}%, Gate Length: ${Number(connection.gate_length.toFixed(3))}</p>`;
          })
          .join("");
        
        
        popup.html(content);
        
        // Add event listeners for connected qubit links
        popup.selectAll(".connected-qubit").on("click", function(event) {
            event.preventDefault();
            const qubitId = +d3.select(this).attr("data-qubit");
            const connectedQubitData = nodes.find(node => node.id === qubitId);
            popup.style("display", "none"); // Close current popup
            showPopup(event, connectedQubitData, nodes, edges); // Open popup for selected qubit
        });
        
        // Node visualization with concentric rings for selected attributes
        const size = (150 / selectedAttributes.length) / 2;
        const svgSize = 200;
        const centerX = svgSize / 2 + 25;
        const baseRadius = size;
        const radiusOffset = size;
        const centerY = svgSize / 2 + (selectedAttributes.length * radiusOffset * 1.5)/2;
        
        // Append SVG for the node visualization
        const nodeSvg = popup.append("div")
        .attr("class", "node-visualization")
        .append("svg")
        .attr("width", svgSize + 50)
        .attr("height", svgSize + selectedAttributes.length * radiusOffset * 1.5);
        
        // Draw concentric rings for each selected attribute
        selectedAttributes.forEach((attribute, i) => {
            const attributeObj = d.attributes.find(attr => attr.name === attribute);
            const value = (attributeObj ? attributeObj.value : 0);
            const colorValue = getAttributeScale(attribute)(value);
            const ringRadius = baseRadius + i * radiusOffset;
            
            nodeSvg.append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY )
            .attr("r", ringRadius)
            .attr("fill", colorValue)
            .attr("fill-opacity", 0)
            .attr("stroke", colorValue)
            .attr("stroke-width", size);
        });
        
        // Draw lines and labels for each attribute
        selectedAttributes.forEach((attribute, i) => {
            const ringRadius = baseRadius + i * radiusOffset;
            const labelX = centerX + ringRadius;
            const labelY = centerY + size;
            
            // Draw a line from ring to label
            nodeSvg.append("line")
            .attr("x1", centerX + ringRadius)
            .attr("y1", centerY)
            .attr("x2", centerX + ringRadius)
            .attr("y2", labelY + (ringRadius * 1.5) * (i % 2 === 0 ? 1 : -1) - (i % 2 === 0 ? 15 : 0))
            .attr("stroke", "black")
            .attr("stroke-dasharray", "2,2")
            .attr("stroke-width", 3);
            
            // Add the label text
            nodeSvg.append("text")
            .attr("x", labelX)
            .attr("y", labelY + (ringRadius * 1.5) * (i % 2 === 0 ? 1 : -1))
            .attr("text-anchor", "middle")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "18px")
            .attr("fill", "#333")
            .text(attributeAbbreviations[attribute]);
    
            popup.style("display", "block");
            // Get the popup's dimensions
            const popupHeight = popup.node().offsetHeight;
            const popupWidth = popup.node().offsetWidth;
    

    
            // Default position
            let top = event.clientY + 10;
            let left = event.clientX + 10;
            // Adjust position if the popup would overflow the screen
            if (top + popupHeight > screenHeight * 0.85) {
                top = event.clientY - (top + popupHeight - screenHeight * 0.9); // Move up if it would overflow
            }
            if (left > graphWidth * 0.8) {
                left = graphWidth - screenWidth * 0.5
            }
    
            // Apply the adjusted position
            popup.style("top", `${top}px`).style("left", `${left}px`);
            
            
            
            
        });
        
        // Close popup when clicking outside
        const outsideClickHandler = (e) => {
            if (!popupRef.current.contains(e.target)) {
                popup.style("display", "none");
                document.removeEventListener("click", outsideClickHandler);
            }
        };
        document.addEventListener("click", outsideClickHandler);
    };
    
    

    return (
        <div>
            <div>
            {/* Label positioned absolutely within the container */}
            <div
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#333',
                    zIndex: 10,
                }}
            >
                </div>
            <ConfigurationModal
                className="config-panel"
                attributes={attributes}
                ranges={ranges}
                colorPalette={colorPalette}
                selectedBackend={selectedBackend}
                setSelectedBackend={setSelectedBackend}
                backends={backends}
                gateColoring={gateColoring}
                onSave={handleSaveConfig}
                onReset={handleResetConfig}
                data={data}
            />
            {/* Rest of the QuantumCircuit visualization */}
        </div>
            <svg ref={svgRef} width={graphWidth} height={graphHeight}></svg>
            <div ref={tooltipRef} className="tooltip" style={{ display: 'none' }}></div>
            <div ref={popupRef} className="popup" style={{ display: 'none' }}></div>
        </div>
    );
};

export default QuantumCircuit;
