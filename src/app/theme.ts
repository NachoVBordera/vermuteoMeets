import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#000000',
        },
        secondary: {
            main: '#2E2E2E',
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '2rem', fontWeight: 700 }, // Mobile scaling
        h4: { fontSize: '1.5rem', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    minHeight: '48px',
                    borderRadius: 0,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                },
            },
            defaultProps: {
                disableElevation: true,
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    boxShadow: 'none',
                    border: '1px solid #000000',
                },
            },
        },
        MuiContainer: {
            styleOverrides: {
                root: {
                    paddingLeft: '16px',
                    paddingRight: '16px',
                }
            }
        }
    },
});
