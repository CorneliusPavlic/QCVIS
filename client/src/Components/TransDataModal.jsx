import React, { useState } from "react";
import { Select, InputNumber, Button, Typography } from "antd";
import { Box } from "@mui/system";

const { Option } = Select;

const TransDataModal = ({ onSave, backendName, backends }) => {
  const [selectedAlgo, setSelectedAlgo] = useState("bv");
  const [transTimes, setTransTimes] = useState(40);
  const [selectedBackend, setSelectedBackend] = useState(backendName); // State for selected backend

  const handleSave = () => {
    onSave({
      view2_algo: selectedAlgo,
      trans_times: transTimes,
      backend_name: selectedBackend, // Include selected backend in save
    });
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: {
          xs: "60%", // Smaller screens
          sm: "70%", // Small to medium screens
          md: "75%", // Medium screens
          lg: "85%", // Larger screens
        },
        transform: "translate(-10%, -50%)",
        width: 300,
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <Typography.Text strong>Select Backend</Typography.Text>
      <Select
        style={{ width: "100%", marginBottom: 16 }}
        value={selectedBackend}
        onChange={setSelectedBackend} // Update state on change
      >
        {backends.map((backend) => (
          <Option key={backend} value={backend}>
            {backend}
          </Option>
        ))}
      </Select>

      <Typography.Text strong>Select Algorithm</Typography.Text>
      <Select
        style={{ width: "100%", marginBottom: 16 }}
        value={selectedAlgo}
        onChange={setSelectedAlgo}
      >
        <Option value="shor">Shor's Algorithm</Option>
        <Option value="two_qubit">Two-Qubit Algorithm</Option>
        <Option value="qft">QFT Algorithm</Option>
        <Option value="grover">Grover's Algorithm</Option>
        <Option value="bv">Bernstein-Vazirani Algorithm</Option>
      </Select>

      <Typography.Text strong>Transpilation Times</Typography.Text>
      <InputNumber
        style={{ width: "100%", marginBottom: 16 }}
        value={transTimes}
        min={1}
        onChange={setTransTimes}
      />

      <Button type="primary" style={{ width: "100%" }} onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
};

export default TransDataModal;
