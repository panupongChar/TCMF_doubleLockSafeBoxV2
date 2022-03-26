import { useState } from "react";
import CompleteDialog from "../CompleteDialog"
import { makeStyles } from "@material-ui/core/styles";
import {
    Button,
    FormHelperText,
    TextField,
    useTheme,
    useMediaQuery,
  } from "@material-ui/core";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "../../axios";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid Email")
    .required("Please enter your Email"),
  userName: yup.string().required("Please enter your username"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Please enter your password"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Password not match")
    .required("Password not match"),
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
  img: {
    width: 100,
    height: 100,
    margin: "0 auto",
  },
}));

function RegisterForm() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [emailValidate, setEmailValidate] = useState(false);
  const [usernameValidate, setUsernameValidate] = useState(false);
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down('xs'));

  const handleOpen = () => {
    setOpen(true);
  };


  const formik = useFormik({
    initialValues: {
      email: "",
      userName: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const userData = {
        username: values.userName,
        email: values.email,
        password: values.password,
      };
      axios
        .post("/register", userData)
        .then(function (response) {
          if (response.data.result === "success") {
            handleOpen()
          }
          if (response.data.error === "user_and_email_error") {
            setEmailValidate(true);
            setUsernameValidate(true);
          }
          else if (response.data.error === "user_error") {
            setUsernameValidate(true);
            setEmailValidate(false);
          }
          else if (response.data.error === "email_error") {
            setUsernameValidate(false);
            setEmailValidate(true);
          }
          else {
            setEmailValidate(false);
            setUsernameValidate(false);
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
          label="Email"
          variant="filled"
          name="email"
          size={xs ? "small": "medium"}
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          InputLabelProps={{ className: classes.label }}
          fullWidth
        />
        {emailValidate ? 
          <FormHelperText className={ classes.validation }>
            This email is already in used. Please use another email.
          </FormHelperText>
          :
          (formik.touched.email && formik.errors.email) && (
          <FormHelperText className={ classes.validation }>
            {formik.errors.email}
          </FormHelperText>
        )}
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
        {usernameValidate ? 
          <FormHelperText className={ classes.validation }>
            This username is already in used. Please use another username.
          </FormHelperText>
          :
          (formik.touched.userName && formik.errors.userName) && (
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
        {formik.touched.password && formik.errors.password && (
          <FormHelperText className={ classes.validation }>
            {formik.errors.password}
          </FormHelperText>
        )}
        <TextField
          className={ classes.input }
          label="Comfirm Password"
          variant="filled"
          name="confirmPassword"
          type="password"
          size={xs ? "small": "medium"}
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          error={
            formik.touched.confirmPassword &&
            Boolean(formik.errors.confirmPassword)
          }
          InputLabelProps={{ className: classes.label }}
          fullWidth
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <FormHelperText className={ classes.validation }>
            {formik.errors.confirmPassword}
          </FormHelperText>
        )}
        <Button 
          color="primary"
          variant="contained"
          size={xs ? "medium": "large"}
          type="submit"
          style={{ fontWeight: "bold", marginBottom: 20 }}
          fullWidth
        >
          Register
        </Button>
      </form>
      <CompleteDialog
        open={open}
        setOpen={setOpen}
        path={window.location.pathname}
      />
    </>
  );
}

export default RegisterForm