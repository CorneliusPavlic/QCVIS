import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ConfigurationModal from './ConfigurationModal';

const QuantumCircuit = (props) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [attributes, setAttributes] = useState({
        T1: true,
        T2: true,
        readout_error: true,
        frequency: false,
        anharmonicity: false,
        prob_meas0_prep1: false,
        prob_meas1_prep0: false,
        readout_length: false,
    });
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
    const [colorPalette, setColorPalette] = useState({ start: 'red', end: 'green' });
    const [gateColoring, setGateColoring] = useState({
        gate_error: { min: 0, max: 0.1 },
        gate_length: { min: 50, max: 200 },
    });
    const svgRef = useRef();
    const popupRef = useRef();
    const tooltipRef = useRef();
    const [colorMetric, setColorMetric] = useState('gate_error');
    const [selectedAttributes, setSelectedAttributes] = useState(["T1", "T2", "readout_error"]);
    const [backends, setBackends] = useState([]);
    const [selectedBackend, setSelectedBackend] = useState(null);
    const [data, setData] = useState(null);

    const handleSaveConfig = (config) => {
        setAttributes(config.attributes);
        setRanges(config.ranges);
        setSelectedBackend(config.backend);
        handleAttributeChange(config.attributes);
        setColorPalette(config.colorPalette);
    };

    const handleResetConfig = () => {
        setAttributes({
            T1: true,
            T2: true,
            frequency: false,
            anharmonicity: false,
        });
        setRanges({
            T1: { min: 50, max: 200 },
            T2: { min: 50, max: 200 },
            frequency: { min: 4.5, max: 5.5 },
        });
        setColorPalette({ start: 'red', end: 'green' });
    };

    const attributeScales = {
        T1: d3.scaleLinear().domain([50, 200]).range(["red", "green"]),
        T2: d3.scaleLinear().domain([50, 200]).range(["red", "green"]),
        frequency: d3.scaleLinear().domain([4.5, 5.5]).range(["red", "green"]),
        anharmonicity: d3.scaleLinear().domain([0.0, -0.4]).range(["red", "green"]),
        readout_error: d3.scaleLinear().domain([0.08, 0.0]).range(["red", "green"]),
        prob_meas0_prep1: d3.scaleLinear().domain([0.1, 0.0]).range(["red", "green"]),
        prob_meas1_prep0: d3.scaleLinear().domain([0.1, 0.0]).range(["red", "green"]),
        readout_length: d3.scaleLinear().domain([1200, 1000]).range(["red", "green"]),
    };
    
    function startDrag(node, simulation) {
        if (!simulation.active) simulation.alphaTarget(0.3).restart();
        node.fx = node.x;
        node.fy = node.y;
    }

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
    }, []);

    // Fetch data based on selected backend
    useEffect(() => {
        if (selectedBackend) {
            props.select_computer(selectedBackend)
            fetch(`/api/get_json_backend/${selectedBackend}`)
                .then(response => response.json())
                .then(data => setData(data))
                .catch(error => console.error("Error fetching backend data:", error));
        }
    }, [selectedBackend]);

    // Process data for D3 visualization whenever data, colorMetric, or selectedAttributes changes
    useEffect(() => {
        if (data) {
            processData(data);
        }
    }, [data, colorMetric, selectedAttributes]);

    const handleBackendChange = (event) => {
        setSelectedBackend(event.target.value);
    };

    const handleAttributeChange = (updatedAttributes) => {
        // Filter only the attributes that are true and update the state
        const trueAttributes = Object.keys(updatedAttributes).filter(
            (key) => updatedAttributes[key] === true
        );
        setSelectedAttributes(trueAttributes);
    };
    

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

        visualizeGraph(nodes, edges);
    };

    const visualizeGraph = (nodes, edges) => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous elements

        const colorScale = d3.scaleLinear()
            .domain([gateColoring[colorMetric].min, gateColoring[colorMetric].max]) // Use selected metric range
            .range([colorPalette.start, colorPalette.end]);


        const width = 1000;
        const height = 600;

        const tooltip = d3.select(tooltipRef.current);

        let currentZoom = 1, minZoom = 0.1, maxZoom = 5;
        let currentX = 0, currentY = 0;
        let basePositionX = 0; 
        let basePositionY = 0;
        let alternatePositionX = 0;
        let alternatePositionY = 0;
        // Zoom function that adjusts the viewBox instead of scaling elements
        const zoom = d3.zoom()
        .scaleExtent([minZoom, maxZoom]) // Set minimum and maximum zoom levels
        .on("zoom", (event) => {
            const transform = event.transform;
            
            // // Define limits for panning
            // const maxPanX = width ; // Example: allow panning to half the width
            // const minPanX = -width * 2;
            // const maxPanY = height; // Example: allow panning to half the height
            // const minPanY = -height * 2;
            if (transform.k === currentZoom) {
                currentX = currentX - transform.x + basePositionX;
                currentY = currentY - transform.y + basePositionY;
                console.log(currentX, transform.x)
                svg.attr("viewBox", `${(currentX)} ${(currentY)} ${width * currentZoom} ${height * currentZoom}`);
            }
            else {
                svg.attr("viewBox", `${currentX} ${currentY} ${width * transform.k} ${height * transform.k}`);
                basePositionX = transform.x;
                basePositionY = transform.y;
            }
            // Apply clamped values to the viewBox

            currentZoom = transform.k;
        });
    

        // Wrap the SVG content in a group to apply the zoom transformation
        //const svgGroup = svg.append("g");

        // Enable zooming on the SVG
        svg.call(zoom);


        const link = svg.selectAll(".link")
            .data(edges)
            .enter()
            .append("line")
            .attr("class", "link")
            .style("stroke-width", 6)
            .style('stroke', (d) => colorScale(d[colorMetric])) // Apply selected metric
            .on("mouseover", function(event, d) {
                tooltip.style("display", "block")
                    .html(`<strong>Gate Error:</strong> ${Number((Math.round(d.gate_error * 100000) / 100000 * 100).toFixed(5))}%<br><strong>Gate Length:</strong> ${d.gate_length}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 30) + "px")
                    .style("left", (event.pageX - 50) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("display", "none");
            });

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges).id(d => d.id).distance(50))
            .force("charge", d3.forceManyBody().strength(-40))
            .force("center", d3.forceCenter(width / 2, height / 2));

                    // Middle node setup
                    const middleNode = nodes[Math.floor(nodes.length / 2)];
                    middleNode.fx = width / 2;
                    middleNode.fy = height / 2;
        
        setTimeout(() => {
                startDrag(middleNode, simulation);
                setTimeout(() => endDrag(middleNode, simulation), 30000);
            }, 0);
        
        const node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
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

        node.each(function(d) {
            const baseRadius = 5;
            const radiusOffset = 5;

            selectedAttributes.forEach((attribute, i) => {
                const attributeObj = d.attributes.find(attr => attr.name === attribute);
                const value = attributeObj ? attributeObj.value : 0;
                const colorValue =  attributeScales[attribute](value)
                d3.select(this).append("circle")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", baseRadius + i * radiusOffset)
                    .attr("fill", colorValue)
                    .attr("fill-opacity", 0)
                    .attr("stroke", colorValue)
                    .attr("stroke-width", 5);
            });
        });

        svg.selectAll(".text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("pointer-events", "none")
            .text(d => d.id);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
            svg.selectAll(".text")
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });
    };

    const showPopup = (event, d, nodes, edges) => {
        event.stopPropagation(); // Prevent event bubbling
        const popup = d3.select(popupRef.current);
        
        // Title and attributes
        let content = `<h3>Qubit ${d.id}</h3>`;
        content += d.attributes.map(attr => `<p>${attr.name}: ${attr.value} ${attr.unit}</p>`).join("");
        
        // Display connections
        const connections = edges.filter(edge => !(edge.source.id === d.id) !== !(edge.target.id === d.id));
        content += "<h4>Connections:</h4>";
        content += connections.map(connection => {
            const connectedQubit = connection.source.id === d.id ? connection.target : connection.source;
            return `<p><a href="#" class="connected-qubit" data-qubit="${connectedQubit.id}">Qubit ${connectedQubit.id}</a> - 
            Gate Error: ${Number((Math.round(connection.gate_error * 100000) / 100000 * 100).toFixed(5))}%, Gate Length: ${Math.round(connection.gate_length * 1000) / 1000}</p>`;
        }).join("");
        
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
        const size = (100 / selectedAttributes.length) / 2;
        const svgSize = 200;
        const centerX = svgSize / 2;
        const centerY = svgSize / 2;
        const baseRadius = size;
        const radiusOffset = size;
        
        // Append SVG for the node visualization
        const nodeSvg = popup.append("div")
        .attr("class", "node-visualization")
        .append("svg")
        .attr("width", svgSize + 50)
        .attr("height", svgSize + selectedAttributes.length * radiusOffset * 1.5);
        
        // Draw concentric rings for each selected attribute
        selectedAttributes.forEach((attribute, i) => {
            const attributeObj = d.attributes.find(attr => attr.name === attribute);
            const value = attributeObj ? attributeObj.value : 0;
            const colorValue = attributeScales[attribute](value) // Adjust domain based on attribute scale as needed
            const ringRadius = baseRadius + i * radiusOffset;
            
            nodeSvg.append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
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
            .attr("y2", labelY + ringRadius * 2.5 - 10)
            .attr("stroke", "black")
            .attr("stroke-dasharray", "2,2")
            .attr("stroke-width", 3);
            
            // Add the label text
            nodeSvg.append("text")
            .attr("x", labelX)
            .attr("y", labelY + ringRadius * 2.5 + 10)
            .attr("text-anchor", "middle")
            .attr("font-family", "Arial, sans-serif")
            .attr("font-size", "18px")
            .attr("fill", "#333")
            .text(attribute);
    
            popup.style("display", "block");
            // Get the popup's dimensions
            const popupHeight = popup.node().offsetHeight;
            const popupWidth = popup.node().offsetWidth;
    
            // Calculate available space
            const screenHeight = window.innerHeight;
            const screenWidth = window.innerWidth;
    
            // Default position
            let top = event.clientY + 10;
            let left = event.clientX + 10;
            // Adjust position if the popup would overflow the screen
            if (top + popupHeight > screenHeight) {
                top = event.clientY - (top + popupHeight - screenHeight + 50); // Move up if it would overflow
            }
            if (left > 600){
                left = 700
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
            <IconButton onClick={() => setModalOpen(true)} aria-label="settings">
                <SettingsIcon />
            </IconButton>
            <ConfigurationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                attributes={attributes}
                ranges={ranges}
                colorPalette={colorPalette}
                selectedBackend={selectedBackend}
                backends={backends}
                gateColoring={gateColoring}
                onSave={handleSaveConfig}
                onReset={handleResetConfig}
            />
            {/* Rest of the QuantumCircuit visualization */}
        </div>
            <label htmlFor="colorMetric">Color by:</label>
            <select id="colorMetric" value={colorMetric} onChange={(e) => setColorMetric(e.target.value)}>
                <option value="gate_error">Gate Error</option>
                <option value="gate_length">Gate Length</option>
            </select>


            <svg ref={svgRef} width="1000" height="600"></svg>
            <div ref={tooltipRef} className="tooltip" style={{ display: 'none' }}></div>
            <div ref={popupRef} className="popup" style={{ display: 'none' }}></div>
        </div>
    );
};

export default QuantumCircuit;
