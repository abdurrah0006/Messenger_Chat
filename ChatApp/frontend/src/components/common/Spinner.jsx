import { LoaderCircle } from "lucide-react";

const Spinner = ({ size = 18 }) => (
  <LoaderCircle className="spin" size={size} role="status" aria-label="Loading" />
);

export default Spinner;
