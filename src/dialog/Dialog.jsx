import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@material-ui/core";

export const ConfirmationDialog = ({
  open,
  title,
  variant,
  description,
  onSubmit,
  onClose
}) => {
  return (
    <Dialog open={open}>
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {variant === "confirm" && (
          <>
            <Button color="primary" onClick={onSubmit}>
              Submit
            </Button>
            <Button color="primary" onClick={onClose} autoFocus>
              Cancel
            </Button>
          </>
        )}

        {variant === "info" && (
          <Button color="primary" onClick={onSubmit}>
            OK
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
