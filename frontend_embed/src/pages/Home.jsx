import { makeStyles } from "@material-ui/core/styles";
import { styled } from '@mui/material/styles';

import {
    Grid,
    Switch,
    Typography,
  } from "@material-ui/core";

import InnerHome from "../components/Home/InnerHome"

const useStyles = makeStyles(theme => ({
  primaryBg: {
    [theme.breakpoints.down("xs")]: {
      padding: "90px 0 0 0",
    },
    backgroundColor: theme.palette.background.primary,
    minHeight: "100vh",
    position: "relative",
    display: "grid",
    padding: "90px 55px 0 55px",
    textAlign: "center"
  },
  secondaryBg: {
    backgroundColor: theme.palette.background.secondary,
    minHeight: "100vh",
    overflowY: "auto",
  },
  title: {
    [theme.breakpoints.down("xs")]: {
      fontSize: 50,
      lineHeight: "60px",
    },
    color: theme.palette.primary.main,
    fontSize: 85,
    lineHeight: "100px",
    fontWeight: "bold",
    marginBottom: 10,
  },
  switch: {
    [theme.breakpoints.down("sm")]: {
      right: 75,
    },
    [theme.breakpoints.down("xs")]: {
      right: 50,
    },
    position: "absolute",
    top: 50,
    right: 100,
  }
}));

const DarkthemeSwitch = styled(Switch)(() => ({
    padding: 8,
    '& .MuiSwitch-switchBase': {
        '&.Mui-checked': {
        '& + .MuiSwitch-track': {
            backgroundColor: "#FFCD39",
            opacity: 1,
            border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.5,
        },},
    },
    '& .MuiSwitch-track': {
      borderRadius: 22 / 2,
      backgroundColor: "#5194F8",
      opacity: 1,
      '&:before, &:after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 16,
        height: 16,
    },
      '&:before': {
        backgroundImage: `url('https://cdn.discordapp.com/attachments/946841863929888782/946849974082224148/moon.png')`,
        backgroundSize: "15px 15px",
        backgroundRepeat: "no-repeat",
        left: 12,
      },
      '&:after': {
        backgroundImage: `url('https://cdn.discordapp.com/attachments/946841863929888782/946841936025776128/sun.png')`,
        backgroundSize: "15px 15px",
        backgroundRepeat: "no-repeat",
        right: 12,
      },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: "#FFFFFF",
        boxShadow: 'none',
        width: 16,
        height: 16,
        margin: 2,
    },
  }));

function Home({ darkmode, setDarkmode }) {
    const saveTheme = () => {
        setDarkmode(!darkmode);
        localStorage.setItem("darkmode", !darkmode);
    };

    const classes = useStyles();
    return (
      <>
        <Grid 
            container direction="row"
            justifyContent="center"
            className={classes.secondaryBg}
        >
            <Grid item xs={12} sm={11} md={8} lg={6} className={classes.primaryBg}>
                <DarkthemeSwitch
                    className={classes.switch}
                    checked={darkmode}
                    onChange={() => saveTheme()}
                />
                <Typography className={classes.title}>
                    Double Lock<br/>
                    Safe Box V.2
                </Typography>
                <InnerHome/>
            </Grid>
        </Grid>
      </>
    );
  }
  
  export default Home;