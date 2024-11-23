import React, { useState } from "react";
import { Modal, Select, InputNumber, Button, Typography } from "antd";

const { Option } = Select;

const TransDataModal = ({ visible, onClose, onSave, backendName }) => {
  const [selectedAlgo, setSelectedAlgo] = useState("bv");
  const [transTimes, setTransTimes] = useState(40);

  const handleSave = () => {
    onSave({
      view2_algo: selectedAlgo,
      trans_times: transTimes,
      backend_name: backendName,
    });
    onClose();
  };

  return (
    <Modal
      title="Configure Transpilation"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
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
    </Modal>
  );
};

export default TransDataModal;
