import { CircleAlert } from "lucide-react";

const Alert = ({ children }) => (
  <div className="alert" role="alert">
    <CircleAlert size={16} />
    <span>{children}</span>
  </div>
);

export default Alert;
