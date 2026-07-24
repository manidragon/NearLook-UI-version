import { createTheme } from "@mui/material";

const customeTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#FF5A00", // Header, Buttons
      light: "#FF8A4C",
      dark: "#E64D00", // Button Hover
    },
    secondary: {
      main: "#FF1E1E", // Offers
    },
    warning: {
      main: "#FFB800", // Ratings
    },
    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.2s',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FF5A00',
            borderWidth: '1px',
            boxShadow: '0 0 0 3px rgba(255, 90, 0, 0.2)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          '&:focus': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
  },
});

export default customeTheme;