import { makeStyles } from "@material-ui/core/styles";
import OTPDialog from "./OTPDialog"
import UnloadDialog from "./UnloadDialog"
import { useState } from "react"
import {
    Button,
    FormHelperText,
    Grid,
    TextField,
    useTheme,
    useMediaQuery,
  } from "@material-ui/core";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "../../axios";

const validationSchema = yup.object({
  userName: yup.string().required("Please enter your username"),
  password: yup
    .string()
    .required("Please enter your password"),
});

const useStyles = makeStyles(theme => ({
  input: {
    "& .MuiFilledInput-root": {
      backgroundColor: theme.palette.text.secondary,
      fontVariant: "normal",
    },
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    color : theme.palette.text.primary,
  },
  validation: {
    color: theme.palette.error.main,
    marginTop: -12,
    marginBottom: 5,
    fontSize: 15,
  },
  deactivate: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.text.secondary,
    '&:hover': {
        backgroundColor: "#D9372B",
    },
    "&:disabled": {
        backgroundColor: "#FF9D9D",
    },
  }
}));

function HomeForm({status, setStatus}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [inbox, setInbox] = useState(false);
  const [inuse, setInuse] = useState(false);
  const [incorrect, setIncorrect] = useState(false);
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down('xs'));

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClick = (type) => {
    if (type === "open") {
        setType("open")
    }
    else {
        setType("deactivate")
    } 
  }

  const formik = useFormik({
    initialValues: {
      userName: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const userData = {
        username: values.userName,
        password: values.password,
      };
      axios
        .get("/check_status")
        .then(function (response) {
          if (response.data.item_inside === true) {
            setInbox(true);
          }
          else if (response.data.item_inside === false) {
            setInbox(false);
          }
        })
        .catch(function(error) {
        });
      axios
        .post("/web_login", userData)
        .then(function (response) {
          if (response.data.result === "success") {
            handleOpen();
            setIncorrect(false);
            setInuse(false);
            if (type === "open") {
              axios
              .post("/get_OTP", userData)
              .then(function (response) {
                axios
                .get("/check_status")
                .then(function (response) {
                  if (response.data.active === true) {
                    setStatus(true);
                  }
                  else if (response.data.active === false) {
                    setStatus(false);
                  }
                })
                .catch(function(error) {
                });
              })
              .catch(function (error) {
              });
            }
          }
          if (response.data.error === "password_wrong") {
            setIncorrect(true);
            setInuse(false);
          }
          if (response.data.error === "current_user_error") {
            setIncorrect(false);
            setInuse(true);
          }
        })
        .catch(function (error) {
        });
    },
  });
  return(
    <>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          className={ classes.input }
          label="Username"
          variant="filled"
          name="userName"
          size={xs ? "small": "medium"}
          value={formik.values.userName}
          onChange={formik.handleChange}
          error={formik.touched.userName && Boolean(formik.errors.userName)}
          InputLabelProps={{ className: classes.label }}
          fullWidth
        />
        {!incorrect && !inuse && formik.touched.userName && formik.errors.userName && (
          <FormHelperText className={ classes.validation }>
            {formik.errors.userName}
          </FormHelperText>
        )}
        <TextField
          className={ classes.input }
          label="Password"
          variant="filled"
          name="password"
          type="password"
          size={xs ? "small": "medium"}
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          InputLabelProps={{ className: classes.label }}
          fullWidth
        />
        {!incorrect && !inuse && formik.touched.password && formik.errors.password && (
          <FormHelperText className={ classes.validation }>
            {formik.errors.password}
          </FormHelperText>
        )}
        {incorrect ? 
          <FormHelperText className={ classes.validation }>
            You have entered your username or password incorrectly. Please check your username
            and password and try again.
          </FormHelperText>
        :
        inuse &&
          <FormHelperText className={ classes.validation }>
            Your username are not match with current user. Please wait until 
            current user deactivate the box.
          </FormHelperText>
        }
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Button 
                  onClick={() => handleClick("open")}
                  color="primary"
                  variant="contained"
                  size={xs ? "medium": "large"}
                  type="submit"
                  style={{ fontWeight: "bold" }}
                  fullWidth
                >
                  Open the box
                </Button>
            </Grid>
            <Grid item xs={6}>
                <Button 
                    className={ classes.deactivate }
                    disabled={!status}
                    onClick={() => handleClick("deactivate")}
                    variant="contained"
                    size={xs ? "medium": "large"}
                    type="submit"
                    style={{ fontWeight: "bold" }}
                    fullWidth
                >
                    Deactivate
                </Button>
            </Grid>
        </Grid>
      </form>
      {type === "open" ? 
        <OTPDialog
            open={open}
            setOpen={setOpen}
            type={type}
            userName={formik.values.userName}
            password={formik.values.password}
        /> 
        : 
        inbox ? 
        <UnloadDialog
            open={open}
            setOpen={setOpen}
        /> 
        :
        <OTPDialog
            open={open}
            setOpen={setOpen}
            type={type}
            userName={formik.values.userName}
            password={formik.values.password}
        />
        }
    </>
  );
}

export default HomeForm