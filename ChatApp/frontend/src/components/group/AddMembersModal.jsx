import { useState } from "react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import Spinner from "../common/Spinner";
import UserPicker from "./UserPicker";

import { getErrorMessage } from "../../api/axios";
import { useChat } from "../../hooks/useChat";

const AddMembersModal = ({ chat, onClose }) => {
  const { addMembers } = useChat();

  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);

  const toggle = (person) =>
    setSelected((prev) =>
      prev.some((item) => item._id === person._id)
        ? prev.filter((item) => item._id !== person._id)
        : [...prev, person]
    );

  const handleAdd = async () => {
    setBusy(true);
    try {
      await addMembers(
        chat._id,
        selected.map((person) => person._id)
      );
      toast.success(selected.length === 1 ? "Member added" : `${selected.length} members added`);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add members"));
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Add members"
      description={`Invite people to ${chat.chatName}.`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleAdd}
            disabled={busy || selected.length === 0}
          >
            {busy && <Spinner size={16} />}
            {selected.length > 0 ? `Add ${selected.length}` : "Add"}
          </button>
        </>
      }
    >
      <UserPicker
        selected={selected}
        onToggle={toggle}
        excludeIds={chat.users.map((member) => member._id)}
      />
    </Modal>
  );
};

export default AddMembersModal;
