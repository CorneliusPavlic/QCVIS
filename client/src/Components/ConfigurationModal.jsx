import React, { useState, useEffect } from 'react';
import {
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
import { styled } from '@mui/material/styles';

const StyledSelect = styled(Select)(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.divider,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.dark,
    },
}));


const ConfigurationModal = ({
    attributes,
    ranges,
    colorPalette,
    gateColoring,
    selectedBackend,
    setSelectedBackend,
    backends,
    onSave,
    onReset,
    data,
}) => {
    const [localAttributes, setLocalAttributes] = useState(attributes);
    const [localRanges, setLocalRanges] = useState(ranges);
    const [localBackend, setLocalBackend] = useState(selectedBackend);
    const [colorScheme, setColorScheme] = useState(colorPalette);
    const [localGateColoring, setLocalGateColoring] = useState(gateColoring);
    const [isAutomatic, setIsAutomatic] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState('gate_error');

    useEffect(() => {
        setLocalAttributes(attributes);
        setLocalRanges(ranges);
        setLocalBackend(selectedBackend);
        setColorScheme(colorPalette);
        setLocalGateColoring(gateColoring);
        setIsAutomatic(true);
        setSelectedMetric('gate_error');
    }, [attributes, ranges, selectedBackend, colorPalette, gateColoring]);

    // Calculate automatic ranges based on data
    const calculateAutomaticRanges = (metric, invert = false) => {
        if (!data || !data.gates) return { min: 0, max: 1 }; // Fallback default
    
        const values = data.gates.map(
            (gate) =>
                gate.parameters.find((param) => param.name === metric)?.value || 0
        );
        const range = {
            min: Math.min(...values),
            max: Math.max(...values),
        };
    
        // Swap min and max if invert is true
        return invert ? { min: range.max, max: range.min } : range;
    };

    const calculateAutomaticAttributeRanges = () => {
        return Object.keys(attributes).reduce((acc, attr) => {
            console.log(attr);
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
    
    
    
const handleAutomaticToggle = (checked) => {
    setIsAutomatic(checked);

    if (checked) {
        const autoGateRanges = calculateAutomaticRanges(
            selectedMetric,
            attributes[selectedMetric]?.invert
        );

        const autoAttributeRanges = calculateAutomaticAttributeRanges();
        setLocalGateColoring((prev) => ({
            ...prev,
            [selectedMetric]: autoGateRanges,
        }));

        setLocalRanges(autoAttributeRanges);
    }
};

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
    };

    const handleReset = () => {
        onReset();
    };

    return (
            <Box
            sx={{
                position: 'absolute',
                top: '30%',
                left: {
                    xs: '60%', // Smaller screens
                    sm: '70%', // Small to medium screens
                    md: '75%', // Medium screens
                    lg: '85%', // Larger screens
                },
                transform: 'scale(0.67) translate(-70%, -50%)',
                width: "35vw",
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                maxHeight: '120vh',
                overflowY: 'auto',
            }}            
            >
                <Typography variant="h6" mb={2}>
                    Configuration Settings
                </Typography>

                {/* Backend Selection */}
                <Typography variant="subtitle1">Backend</Typography>
                <StyledSelect
                    fullWidth
                    value={localBackend || ''}
                    onChange={(e) => {
                        setLocalBackend(e.target.value);
                        handleSave();
                        setSelectedBackend(e.target.value);}}
                >
                    {backends.map((backend, index) => (
                        <MenuItem key={index} value={backend}>
                            {backend}
                        </MenuItem>
                    ))}
                </StyledSelect>

                {/* Attribute Toggles */}
                <Typography variant="subtitle1" mt={2}>
                    Attributes
                </Typography>
                {Object.keys(localAttributes).map((attribute) => (
                    <FormControlLabel
                        key={attribute}
                        control={
                            <Switch
                                checked={localAttributes[attribute].visible}
                                onChange={(e) =>
                                    setLocalAttributes({
                                        ...localAttributes,
                                        [attribute]: {
                                            ...localAttributes[attribute],
                                            visible: e.target.checked,
                                        },
                                    })
                                }
                            />
                        }
                        label={attribute}
                    />
                ))}

                {/* Attribute Ranges (Hidden if Automatic Mode is On) */}
                {!isAutomatic && (
                    <>
                        <Typography variant="subtitle1" mt={2}>
                            Attribute Ranges
                        </Typography>
                        {Object.keys(localRanges).map((attribute) => (
                            <Grid container spacing={2} key={attribute} mt={1}>
                                <Grid item xs={6}>
                                    <TextField
                                        label={`${attribute} Min`}
                                        type="number"
                                        fullWidth
                                        value={localRanges[attribute]?.min ?? ''}
                                        onChange={(e) =>
                                            setLocalRanges((prev) => ({
                                                ...prev,
                                                [attribute]: {
                                                    ...prev[attribute],
                                                    min: Number(e.target.value),
                                                },
                                            }))
                                        }
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label={`${attribute} Max`}
                                        type="number"
                                        fullWidth
                                        value={localRanges[attribute]?.max ?? ''}
                                        onChange={(e) =>
                                            setLocalRanges((prev) => ({
                                                ...prev,
                                                [attribute]: {
                                                    ...prev[attribute],
                                                    max: Number(e.target.value),
                                                },
                                            }))
                                        }
                                    />
                                </Grid>
                            </Grid>
                        ))}
                    </>
                )}

                {/* Metric Toggle */}
                <Typography variant="subtitle1" mt={2}>
                    Gate Metric
                </Typography>
                <StyledSelect
                    fullWidth
                    value={selectedMetric}
                    onChange={(e) => handleMetricChange(e.target.value)}
                >
                    <MenuItem value="gate_error">Gate Error</MenuItem>
                    <MenuItem value="gate_length">Gate Length</MenuItem>
                </StyledSelect>

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

                {/* Manual Range Inputs for Attributes */}
                {!isAutomatic && (
                    <>
                        <Typography variant="subtitle1" mt={2}>
                            Gate Ranges
                        </Typography>
                        <Grid container spacing={2} mt={2}>
                            <Grid item xs={6}>
                                <TextField
                                    label={`${selectedMetric} Min`}
                                    type="number"
                                    fullWidth
                                    value={localGateColoring[selectedMetric]?.min ?? ''}
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
                                    label={`${selectedMetric} Max`}
                                    type="number"
                                    fullWidth
                                    value={localGateColoring[selectedMetric]?.max ?? ''}
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

                    </>
                )}


            {/* Color Palette Picker */}
            <Typography variant="subtitle1" mt={2}>
                Color Palette
            </Typography>
            <Grid container spacing={2}>
                {[
                    { start: 'red', end: 'green' },
                    { start: 'blue', end: 'orange' },
                    { start: 'purple', end: 'yellow' },
                    { start: 'black', end: 'white' },
                    { start: 'cyan', end: 'magenta' },
                    { start: 'teal', end: 'gold' },
                    { start: 'pink', end: 'lime' },
                    { start: 'brown', end: 'skyblue' },
                ].map((palette, index) => (
                    <Grid item xs={6} key={index}>
                        <Button
                            fullWidth
                            variant={colorScheme.start === palette.start && colorScheme.end === palette.end ? 'contained' : 'outlined'}
                            style={{
                                backgroundImage: `linear-gradient(to right, ${palette.start}, ${palette.end})`,
                                color: palette.start === 'black' ? 'white' : 'black', // Adjust text color for visibility
                            }}
                            onClick={() => setColorScheme(palette)}
                        >
                            {`${palette.start} → ${palette.end}`}
                        </Button>
                    </Grid>
                ))}
            </Grid>

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
    );
};

export default ConfigurationModal;
