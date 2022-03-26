import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import HomeForm from "./HomeForm"
import { Link as RouterLink } from "react-router-dom";
import { useEffect } from "react";
import axios from "../../axios";

const useStyles = makeStyles(theme => ({
  secondaryBg: {
    [theme.breakpoints.down("xs")]: {
      padding: 20,
    },
    backgroundColor: theme.palette.background.secondary,
    borderRadius: "10px 10px 0px 0px",
    padding: 45,
  },
  statusdesc: {
    [theme.breakpoints.down("xs")]: {
      fontSize: 18,
    },
    color: theme.palette.text.primary,
    marginTop: 0,
    fontSize: 28,
  },
  available: {
      color: theme.palette.success.main
  },
  unavailable: {
    color: theme.palette.error.main
    },
  description: {
    [theme.breakpoints.down("sm")]: {
      lineHeight: "60px",
      fontSize: 25,
    },
    [theme.breakpoints.down("xs")]: {
      lineHeight: "50px",
      fontSize: 20,
    },
    width: "100%",
    height: "auto",
    lineHeight: "70px",
    marginBottom: 35,
    backgroundColor: theme.palette.description.background,
    color: theme.palette.description.text,
    fontSize: 36,
    borderRadius: 10,
  },
  linkdesc: {
    [theme.breakpoints.down("xs")]: {
      fontSize: 18,
    },
    color: theme.palette.text.primary,
    fontSize: 24,
  },
  link: {
    [theme.breakpoints.down("xs")]: {
      fontSize: 18,
    },
    textDecoration: "none",
    color: theme.palette.primary.main,
  },
}));

function InnerHome() {
  const classes = useStyles();
  const [status, setStatus] = useState(true);

  useEffect(() => {
    axios
      .get("/check_status")
      .then(function(response) {
        if (response.data.active === true) {
          setStatus(true)
        }
        else if (response.data.active === false) {
          setStatus(false)
        }
      })
  }, []);

  return (
    <>
      <div className={classes.secondaryBg}>
        <p className={ classes.statusdesc }>
            Safe Box Status :&nbsp;
            {!status ? 
                <span className={ classes.available }>
                    Available
                </span>
                :
                <span className={ classes.unavailable }>
                    Unavailable
                </span>
            }
        </p>
        <div className={classes.description}>
            Enter Username and Password<br/>
            to use the safe box
        </div>
        <HomeForm status={status} setStatus={setStatus}/>
        <p className={ classes.linkdesc }>Don't have an account ?&nbsp;
        <RouterLink className={classes.link} to="/register">
            &nbsp;&nbsp;Register
        </RouterLink>
        </p>
      </div>
    </>
  )
}

export default InnerHome