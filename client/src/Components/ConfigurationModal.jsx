import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Grid,
} from '@mui/material';
import { SketchPicker } from 'react-color';

const ConfigurationModal = ({
    open,
    onClose,
    attributes,
    ranges,
    colorPalette,
    gateColoring, // Gate coloring configuration
    selectedBackend,
    backends,
    onSave,
    onReset,
    data, // Data for automatic range calculation
}) => {
    const [localAttributes, setLocalAttributes] = useState(attributes);
    const [localRanges, setLocalRanges] = useState(ranges);
    const [localBackend, setLocalBackend] = useState(selectedBackend);
    const [colorScheme, setColorScheme] = useState(colorPalette);
    const [localGateColoring, setLocalGateColoring] = useState(gateColoring);
    const [isAutomatic, setIsAutomatic] = useState(true); // Toggle for automatic/manual range
    const [selectedMetric, setSelectedMetric] = useState('gate_error'); // Default to gate_error

    useEffect(() => {
        setLocalAttributes(attributes);
        setLocalRanges(ranges);
        setLocalBackend(selectedBackend);
        setColorScheme(colorPalette);
        setLocalGateColoring(gateColoring);
        setIsAutomatic(true); // Default to automatic mode
        setSelectedMetric('gate_error'); // Default to gate_error
    }, [attributes, ranges, selectedBackend, colorPalette, gateColoring]);

    // Calculate automatic ranges based on data
    const calculateAutomaticRanges = (metric) => {
        if (!data || !data.gates) return { min: 0, max: 1 }; // Fallback default
        const values = data.gates.map((gate) =>
            gate.parameters.find((param) => param.name === metric)?.value || 0
        );
        return {
            min: Math.min(...values),
            max: Math.max(...values),
        };
    };

    // Update ranges when toggling automatic/manual mode
    const handleAutomaticToggle = (checked) => {
        setIsAutomatic(checked);
        if (checked) {
            const autoRanges = calculateAutomaticRanges(selectedMetric);
            setLocalGateColoring((prev) => ({
                ...prev,
                [selectedMetric]: autoRanges,
            }));
        }
    };

    // Update ranges dynamically when switching metrics
    const handleMetricChange = (metric) => {
        setSelectedMetric(metric);
        if (isAutomatic) {
            const autoRanges = calculateAutomaticRanges(metric);
            setLocalGateColoring((prev) => ({
                ...prev,
                [metric]: autoRanges,
            }));
        }
    };

    const handleSave = () => {
        onSave({
            attributes: localAttributes,
            ranges: localRanges,
            backend: localBackend,
            colorPalette: colorScheme,
            gateColoring: localGateColoring,
        });
        onClose();
    };

    const handleReset = () => {
        onReset();
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    maxHeight: '80vh',
                    overflowY: 'auto',
                }}
            >
                <Typography variant="h6" mb={2}>
                    Configuration Settings
                </Typography>

                {/* Backend Selection */}
                <Typography variant="subtitle1">Backend</Typography>
                <Select
                    fullWidth
                    value={localBackend || ''}
                    onChange={(e) => setLocalBackend(e.target.value)}
                >
                    {backends.map((backend, index) => (
                        <MenuItem key={index} value={backend}>
                            {backend}
                        </MenuItem>
                    ))}
                </Select>

                {/* Metric Toggle */}
                <Typography variant="subtitle1" mt={2}>
                    Gate Metric
                </Typography>
                <Select
                    fullWidth
                    value={selectedMetric}
                    onChange={(e) => handleMetricChange(e.target.value)}
                >
                    <MenuItem value="gate_error">Gate Error</MenuItem>
                    <MenuItem value="gate_length">Gate Length</MenuItem>
                </Select>

                {/* Automatic Range Toggle */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={isAutomatic}
                            onChange={(e) => handleAutomaticToggle(e.target.checked)}
                        />
                    }
                    label="Automatic Ranges"
                />

                {/* Manual Range Inputs (Hidden if Automatic Mode is On) */}
                {!isAutomatic && (
                    <Grid container spacing={2} mt={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Min Value"
                                type="number"
                                fullWidth
                                value={localGateColoring[selectedMetric]?.min || ''}
                                onChange={(e) =>
                                    setLocalGateColoring((prev) => ({
                                        ...prev,
                                        [selectedMetric]: {
                                            ...prev[selectedMetric],
                                            min: Number(e.target.value),
                                        },
                                    }))
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Max Value"
                                type="number"
                                fullWidth
                                value={localGateColoring[selectedMetric]?.max || ''}
                                onChange={(e) =>
                                    setLocalGateColoring((prev) => ({
                                        ...prev,
                                        [selectedMetric]: {
                                            ...prev[selectedMetric],
                                            max: Number(e.target.value),
                                        },
                                    }))
                                }
                            />
                        </Grid>
                    </Grid>
                )}

                {/* Color Palette Picker */}
                <Typography variant="subtitle1" mt={2}>
                    Color Palette
                </Typography>
                <SketchPicker
                    color={colorScheme}
                    onChangeComplete={(color) =>
                        setColorScheme({ ...color, hex: color.hex })
                    }
                />

                {/* Save and Reset Buttons */}
                <Box mt={3} display="flex" justifyContent="space-between">
                    <Button variant="outlined" onClick={handleReset}>
                        Reset to Default
                    </Button>
                    <Button variant="contained" onClick={handleSave}>
                        Save
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ConfigurationModal;
