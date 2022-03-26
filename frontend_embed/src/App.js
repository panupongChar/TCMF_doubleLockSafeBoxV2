import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useTheme, useMediaQuery } from "@material-ui/core";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Register from "./pages/Register";
import Home from "./pages/Home";
import "@fontsource/signika-negative"

function App() {
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down('xs'));

  const [darkmode, setDarkmode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("darkmode") === "true") {
      setDarkmode(true);
    }
    else {
      setDarkmode(false);
    }
  }, []);

  useEffect(() => {
    if (darkmode) {
      if (xs) {
        document.body.style.backgroundColor = "#1D1D1E";
      }
      else {
        document.body.style.backgroundColor = "#2D2D2D";
      }
    }
    else {
      if (xs) {
        document.body.style.backgroundColor = "#FFE39B";
      }
      else {
        document.body.style.backgroundColor = "#F1F1F1";
      }
    }
  }, [darkmode, xs]);

  const darkTheme = createTheme({
    palette: {
        primary: {
          main: "#FFCD39"
        },
        error: {
          main: "#F14336"
        },
        success: {
          main: "#28B446"
        },
        background: {
          primary: "#1D1D1E",
          secondary: "#2D2D2D",
        },
        description: {
          background: "#1D1D1E",
          text: "#FFCD39"
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#111111",
        },
        dialog: "#1D1D1E",
    },
  });
  
  const lightTheme = createTheme({
    palette: {
      primary: {
        main: "#5194F8"
      },
      error: {
        main: "#F14336"
      },
      success: {
        main: "#28B446"
      },
      background: {
        primary: "#FFE39B",
        secondary: "#F1F1F1",
      },
      description: {
        background: "#D0E9FF",
        text: "#111111"
      },
      text: {
        primary: "#111111",
        secondary: "#FFFFFF",
      },
      dialog: "#F1F1F1",
    },
  });

  return (
    <ThemeProvider theme={darkmode ? darkTheme : lightTheme}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/register" element={<Register darkmode={darkmode} setDarkmode={setDarkmode}/>}/>
            <Route path="/" exact element={<Home darkmode={darkmode} setDarkmode={setDarkmode}/>}/>
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
);
}

export default App;
