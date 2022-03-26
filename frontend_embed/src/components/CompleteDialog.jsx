import { useNavigate } from "react-router-dom";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  dialog: {
    backgroundColor: theme.palette.dialog,
  },
  img: {
    width: 100,
    height: 100,
    margin: "0 auto",
  },
  dialogtext: {
    color: theme.palette.text.primary,
  },
}));

export default function CompleteDialog({ open, setOpen, path }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const handleClose = () => {
    setOpen(false);
    if (path !== "/") {
      navigate("/")
    }
    else {
      navigate(0)
    }
  };

  const desc = path === "/" ? "Your operation has been completed. Thankyou for using our service." 
  : "Your account has been created.";

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
          <DialogTitle>
            <IconButton onClick={handleClose} style={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}>
                <CloseIcon className={ classes.dialogtext }/>
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <img src="/img/checkmark.png" alt="complete" className={ classes.img }/>
            <DialogContentText id="alert-dialog-description">
              <span className={ classes.dialogtext }>{desc}</span>
            </DialogContentText>
          </DialogContent>
        </Box>
      </Dialog>
    </>
  );
}
