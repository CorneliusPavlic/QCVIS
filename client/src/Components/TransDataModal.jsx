import React, { useState } from "react";
import { Select, InputNumber, Button, Typography, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Box } from "@mui/system";

const { Option } = Select;

const TransDataModal = ({ onSave, backendName, backends }) => {
  const [selectedAlgo, setSelectedAlgo] = useState("bv");
  const [transTimes, setTransTimes] = useState(40);
  const [selectedBackend, setSelectedBackend] = useState(backendName);
  const [qpyFile, setQpyFile] = useState(null);

  // Handle QPY File Upload
  const handleFileUpload = (file) => {
    if (qpyFile) {
      message.error("Only one QPY file can be uploaded at a time.");
      return false;
    }
    
    setQpyFile(file);
    message.success("QPY File uploaded successfully!");
    return false;
  };

  // Remove QPY File
  const handleRemoveFile = () => {
    setQpyFile(null);
    message.info("QPY File removed.");
  };

  // Save Data
  const handleSave = () => {
    const formData = new FormData();
    formData.append("backend_name", selectedBackend);
    formData.append("trans_times", transTimes);

    if (selectedAlgo === "upload_qpy") {
      if (qpyFile) {
        formData.append("qpyFile", qpyFile);
        formData.append("view2_algo", "qpy");
      } else {
        message.error("Please upload a QPY file.");
        return;
      }
    } else {
      formData.append("view2_algo", selectedAlgo);
    }

    onSave(formData);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: { xs: "60%", sm: "70%", md: "75%", lg: "85%" },
        transform: "translate(-30%, -50%)",
        width: 320,
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
        style={{
          width: "100%",
          marginBottom: 16,
          height: 40,  // Fix height
          display: "flex",
          alignItems: "center", // Center text
        }}
        value={selectedBackend}
        onChange={setSelectedBackend}
      >
        {backends.map((backend) => (
          <Option key={backend} value={backend}>
            {backend}
          </Option>
        ))}
      </Select>

      <Typography.Text strong>Select Algorithm</Typography.Text>
      <Select
        style={{
          width: "100%",
          marginBottom: 16,
          height: 40,  // Fix height
          display: "flex",
          alignItems: "center",
        }}
        value={selectedAlgo}
        onChange={(value) => {
          setSelectedAlgo(value);
          setQpyFile(null);
        }}
      >
        <Option value="shor">Shor's Algorithm</Option>
        <Option value="two_qubit">Two-Qubit Algorithm</Option>
        <Option value="qft">QFT Algorithm</Option>
        <Option value="grover">Grover's Algorithm</Option>
        <Option value="bv">Bernstein-Vazirani Algorithm</Option>
        <Option value="upload_qpy">Upload QPY File</Option>
      </Select>

      {selectedAlgo === "upload_qpy" && (
        <>
          <Typography.Text strong>Upload a QPY File</Typography.Text>
          <Upload
            beforeUpload={handleFileUpload}
            showUploadList={true}
            accept=".qpy"
            fileList={qpyFile ? [qpyFile] : []}
            onRemove={handleRemoveFile}
          >
            {!qpyFile && (
              <Button
                icon={<UploadOutlined />}
                style={{
                  width: "100%",
                  height: 40,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",  // Center icon and text
                }}
              >
                Upload QPY File
              </Button>
            )}
          </Upload>

          {qpyFile && (
            <Typography.Text type="success" style={{ display: "block", marginBottom: 16 }}>
              {qpyFile.name} uploaded successfully
            </Typography.Text>
          )}
        </>
      )}

      <Typography.Text strong>Transpilation Times</Typography.Text>
      <InputNumber
        style={{
          width: "100%",
          marginBottom: 16,
          height: 40,
          display: "flex",
          alignItems: "center",
        }}
        value={transTimes}
        min={1}
        onChange={setTransTimes}
      />

      <Button
        type="primary"
        style={{
          width: "100%",
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",  // Center text
        }}
        onClick={handleSave}
      >
        Save
      </Button>
    </Box>
  );
};

export default TransDataModal;
