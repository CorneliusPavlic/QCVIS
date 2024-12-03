import React from 'react';
import ReactDOM from 'react-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import App from './App';

const theme = createTheme({
    palette: {
        primary: {
            main: '#292C99', // Customize the primary color
            dark: '#201442'
        },
        secondary: {
            main: '#A9D3EF', // Customize the secondary color
            dark: '#557ED8'
        },
        background: {
            default: '#A9D3EF', // Background color
            paper: '#FFFFFF', // Paper color
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h1: {
            fontSize: '2.5rem',
        },
        body1: {
            fontSize: '1rem',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px', // Customize button border-radius
                    textTransform: 'none', // Disable uppercase text
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
                },
                outlined: {
                    borderColor: '#ccc',
                    '&:hover': {
                        borderColor: '#007BFF',
                    },
                    '&.Mui-focused': {
                        borderColor: '#0056b3',
                    },
                },
            },
        },
    },
});

const Root = () => (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
    </ThemeProvider>
);

ReactDOM.render(<Root />, document.getElementById('app'));
