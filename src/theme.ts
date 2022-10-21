import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    components: {
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '1rem',
                },
            },
        },
    },
});

export default theme;
