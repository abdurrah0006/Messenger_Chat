import { useState } from "react";
import { Users } from "lucide-react";
import toast from "react-hot-toast";

import Alert from "../common/Alert";
import Field from "../common/Field";
import Modal from "../common/Modal";
import Spinner from "../common/Spinner";
import UserPicker from "./UserPicker";

import { getErrorMessage } from "../../api/axios";
import { useChat } from "../../hooks/useChat";

const CreateGroupModal = ({ onClose, onCreated }) => {
  const { createGroup } = useChat();

  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleMember = (person) =>
    setMembers((prev) =>
      prev.some((item) => item._id === person._id)
        ? prev.filter((item) => item._id !== person._id)
        : [...prev, person]
    );

  const handleCreate = async () => {
    if (!name.trim()) return setError("Give your group a name.");
    if (members.length < 2) return setError("Add at least 2 people to create a group.");

    setError("");
    setBusy(true);
    try {
      const chat = await createGroup(
        name.trim(),
        members.map((person) => person._id)
      );
      toast.success("Group created");
      onCreated(chat);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create the group"));
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Create group"
      description="Name your group and choose who to add."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={handleCreate} disabled={busy}>
            {busy && <Spinner size={16} />}
            Create group
          </button>
        </>
      }
    >
      <div className="stack">
        <Field
          id="group-name"
          label="Group name"
          icon={Users}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Weekend plans"
          maxLength={50}
          autoFocus
        />

        {error && <Alert>{error}</Alert>}

        <UserPicker selected={members} onToggle={toggleMember} />
      </div>
    </Modal>
  );
};

export default CreateGroupModal;
