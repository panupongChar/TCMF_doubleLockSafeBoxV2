import { useState } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormHelperText,
  TextField,
} from "@material-ui/core";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { makeStyles } from "@material-ui/core/styles";
import CompleteDialog from "../CompleteDialog"
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "../../axios";

const validationSchema = yup.object({
  otp: yup.string().required("Please fill a valid OTP code."),
});

const useStyles = makeStyles(theme => ({
  dialog: {
    backgroundColor: theme.palette.dialog,
  },
  img: {
    [theme.breakpoints.down("xs")]: {
      width: 70,
      height: 70,
    },
    width: 100,
    height: 100,
    margin: "0 auto",
  },
  dialogtitle: {
    [theme.breakpoints.down("xs")]: {
      fontSize: 20,
    },
    fontWeight: "bold",
    fontSize: 33,
    color: theme.palette.text.primary,
  },
  dialogtext: {
    [theme.breakpoints.down("xs")]: {
      fontSize: 13,
    },
    color: theme.palette.text.primary,
  },
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
}));

export default function OTPDialog({ open, setOpen, type, userName, password }) {
  const [openin, setOpenin] = useState(false);
  const [incorrect, setIncorrect] = useState(false);
  const [disable, setDisable] = useState(false);
  const [timer,setTimer] = useState("");

  const classes = useStyles();
  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpenin(true);
  };

  const Resend = () => {
    const userData = {
      username: userName,
      password: password,
    };
    setDisable(true)
    setTimer("Please wait for 10 seconds to resend again.")
    setTimeout(() => setDisable(false), 10000);
    setTimeout(() => setTimer(""), 10000);
    axios
      .post("/get_OTP", userData)
      .then(function (response) {
      })
      .catch(function (error) {
      });
  }

  const desc = type === "open" ? "We have sent OTP code to you.  Please check your mailbox to get the OTP code and enter it at the safe box." 
  : "Plese fill your OTP code that you recently use it to open the safe box to deactivate the safe box.";

  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (type === "deactivate") {
        const userData = {
          username: userName,
          password: password,
          OTP: values.otp,
        };
        axios
          .post("/deactivate", userData)
          .then(function (response) {
            if (response.data.result === "success") {
              handleOpen();
              setIncorrect(false);
            }
            else {
              setIncorrect(true);
            }
          })
          .catch(function (error) {
          });
      }
    },
  });
  return (
    <>
      <Dialog
        PaperProps={{ className: classes.dialog }}
        open={open}
        onClose={handleClose}
        fullWidth
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box textAlign="center">
          <DialogTitle className={ classes.dialog }>
            <IconButton onClick={handleClose} style={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}>
                <CloseIcon className={ classes.dialogtext } />
            </IconButton>
          </DialogTitle>
          <DialogContent className={ classes.dialog }>
            <img src="/img/key.png" alt="key" className={ classes.img }/>
            <form onSubmit={formik.handleSubmit}>
            <DialogContentText id="alert-dialog-description">
                <span className={ classes.dialogtitle }>OTP Verification</span><br />
                <span className={ classes.dialogtext }>{desc}</span><br />
                {type === "open" ?
                  <>
                  <span className={classes.dialogtext} style={{ marginBottom: 0 }}>Haven’t recieve the OTP code ?</span><br />
                  <Button variant="text" color="primary" onClick={Resend} disabled={disable}>
                    Resend
                  </Button>
                  <br />
                  <span className={classes.dialogtext} style={{ marginBottom: 0 }}>{timer}</span><br />
                  </>
                  :
                  <>
                      <TextField
                        className={ classes.input }
                        label="OTP Code"
                        variant="filled"
                        name="otp"
                        type="password"
                        value={formik.values.otp}
                        onChange={formik.handleChange}
                        error={formik.touched.otp && Boolean(formik.errors.otp)}
                        InputLabelProps={{ className: classes.label }}
                        fullWidth
                      />
                      {incorrect ? 
                      <FormHelperText className={ classes.validation }>
                        Please fill a valid OTP code.
                      </FormHelperText>
                      :
                      formik.touched.otp && formik.errors.otp && (
                        <FormHelperText className={ classes.validation }>
                          {formik.errors.otp}
                        </FormHelperText>
                      )}
                      <Button 
                        variant="contained" 
                        color="primary"
                        type="submit"
                        style={{ marginBottom: 20, fontWeight: "bold" }}
                        fullWidth
                      >
                        Verify
                      </Button>
                    <CompleteDialog
                      open={openin}
                      setOpen={setOpenin}
                      path={window.location.pathname}
                    />
                  </>
                }
            </DialogContentText>
            </form>
          </DialogContent>
        </Box>
      </Dialog>
    </>
  );
}
