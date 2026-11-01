import { useState } from "react";
import toast from "react-hot-toast";

import Modal from "./Modal";
import Spinner from "./Spinner";
import { getErrorMessage } from "../../api/axios";

// `onConfirm` may be async; if it throws, the error is shown and the dialog stays open.
const ConfirmDialog = ({ title, message, confirmLabel = "Confirm", onConfirm, onClose }) => {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={handleConfirm} disabled={busy}>
            {busy && <Spinner size={16} />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="modal__text">{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
