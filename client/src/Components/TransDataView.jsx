import React, { useState, useEffect } from "react";
import { Spin, Button } from "antd";
import * as d3 from "d3";
import TransDataModal from "./TransDataModal";

const TransDataView = ({ backendName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const screenHeight = window.innerHeight;
  const screenWidth = window.innerWidth;
  const visualizationWidth = Math.floor(screenWidth * 0.75);
  const visualizationHeight = Math.floor(screenHeight * 0.75);

  const fetchData = async (config) => {
    setLoading(true);
    try {
      const response = await fetch("/api/view2_api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const result = await response.json();
      setLoading(false);
      setData(Object.values(result.data));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
    }
  };

  const renderVisualization = () => {
    const container = document.getElementById("visualization");

    if (!container) {
      console.error("Visualization container not found!");
      return;
    }

    const svg = d3.select(container).html("").append("svg").attr("width", "100%").attr("height", 800);

    // Compute dynamic ranges for axes and bubble sizes
    const minQubits = d3.min(data, (d) => d.qubits_quality);
    const maxQubits = d3.max(data, (d) => d.qubits_quality);
    const minGates = d3.min(data, (d) => d.gates_quality);
    const maxGates = d3.max(data, (d) => d.gates_quality);
    const minDepth = d3.min(data, (d) => d.depth);
    const maxDepth = d3.max(data, (d) => d.depth);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([minQubits, maxQubits])
      .range([50, visualizationWidth - 50]);

    const yScale = d3.scaleLinear()
      .domain([minGates, maxGates])
      .range([visualizationHeight - 50, 50]);

    const sizeScale = d3.scaleLinear()
      .domain([maxDepth, minDepth]) // Inverted: smaller depth = larger bubble
      .range([10, 50]); // Bubble size range


    const tooltip = d3.select("#tooltip");

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(10);

    svg.append("g")
      .attr("transform", `translate(0, ${visualizationHeight - 50})`)
      .call(xAxis)
      .append("text")
      .attr("x", visualizationWidth / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Qubits Quality");

    svg.append("g")
      .attr("transform", "translate(50, 0)")
      .call(yAxis)
      .append("text")
      .attr("x", -visualizationHeight / 2)
      .attr("y", -40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Gates Quality");

    const colorScale = d3.scaleLinear()
    .domain([d3.min(data, (d) => d.depth), d3.max(data, (d) => d.depth)])
    .range(["green", "red"]); // Green for shallow, Red for deep
      // Bubbles
    svg.selectAll(".bubble")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", (d) => xScale(d.qubits_quality))
      .attr("cy", (d) => yScale(d.gates_quality))
      .attr("r", (d) => sizeScale(d.depth))
      .attr("fill", (d) => colorScale(d.depth))
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .on("mouseover", (event, d) => {
        tooltip.style("display", "block")
          .html(`
            <strong>${d.id}</strong><br>
            Depth: ${d.depth}<br>
            Qubits Quality: ${d.qubits_quality.toFixed(2)}<br>
            Gates Quality: ${d.gates_quality.toFixed(2)}
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });
  };

  useEffect(() => {
    if (data.length > 0) {
      renderVisualization();
    }
  }, [data]);

  return (
    <div>
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 16 }}>
        Configure Transpilation
      </Button>
      <TransDataModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={fetchData}
        backendName={backendName}
      />
      {loading ? (
        <Spin tip="Loading..." size="large" />
      ) : (
        <div id="visualization" style={{ width: "100%", height: 800, border: "1px solid #ccc" }} />
      )}
      <div id="tooltip" style={{ position: "absolute", display: "none", background: "#fff", border: "1px solid #ccc", padding: "10px", borderRadius: "5px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", pointerEvents: "none" }}></div>
    </div>
  );
};

export default TransDataView;
