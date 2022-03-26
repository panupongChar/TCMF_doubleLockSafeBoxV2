import { makeStyles } from "@material-ui/core/styles";
import RegisterForm from "./RegisterForm"
import { Link as RouterLink } from "react-router-dom";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const useStyles = makeStyles(theme => ({
  secondaryBg: {
    [theme.breakpoints.down("xs")]: {
      padding: 20,
    },
    backgroundColor: theme.palette.background.secondary,
    borderRadius: "10px 10px 0px 0px",
    padding: 45,
  },
  description: {
    [theme.breakpoints.down("xs")]: {
      lineHeight: "50px",
      fontSize: 20,
    },
    width: "100%",
    height: "auto",
    lineHeight: "90px",
    marginBottom: 35,
    backgroundColor: theme.palette.description.background,
    color: theme.palette.description.text,
    fontSize: 36,
    borderRadius: 10,
  },
  link: {
    [theme.breakpoints.down("xs")]: {
      fontSize: 18,
    },
    textDecoration: "none",
    color: theme.palette.primary.main,
    fontSize: 24,
    width:"100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: 'center',
  },
}));

function InnerRegister() {
  const classes = useStyles();

  return (
    <>
      <div className={classes.secondaryBg}>
        <div className={classes.description}>
          Create an account
        </div>
        <RegisterForm/>
        <RouterLink className={classes.link} to="/">
          <ArrowForwardIcon/>&nbsp;&nbsp;Go to Homepage
        </RouterLink>
      </div>
    </>
  )
}

export default InnerRegister