import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  img: {
    [theme.breakpoints.down("xs")]: {
      width: 70,
      height: 70,
    },
    width: 100,
    height: 100,
    margin: "0 auto",
  },
  dialog: {
    backgroundColor: theme.palette.dialog,
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
}));

export default function UnloadDialog({ open, setOpen }) {
  const classes = useStyles();
  const handleClose = () => {
    setOpen(false);
  };

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
            <img src="/img/box.png" alt="box" className={ classes.img }/>
            <DialogContentText id="alert-dialog-description">
                <span className={ classes.dialogtitle }>Oops!!</span><br />
                <span className={ classes.dialogtext }>Some of your personal items are still in the safe box. Before deactivating the safe box, please unload all of your items.</span><br />
            </DialogContentText>
            <Button 
                variant="contained" 
                color="primary"
                style={{ marginBottom: 20, fontWeight: "bold" }}
                onClick={handleClose}
                fullWidth
            >
                OK, I got it.
            </Button>
          </DialogContent>
        </Box>
      </Dialog>
    </>
  );
}
