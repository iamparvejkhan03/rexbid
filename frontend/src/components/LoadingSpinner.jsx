import { Loader } from "lucide-react";
import { spinner } from "../assets";

function LoadingSpinner({height}) {
  return (
    <div
    style={{ minHeight: height }}
    className="w-full flex justify-center items-center">
      {/* <img src={spinner} alt="spinner" className="h-20 w-auto animate-spin" style={{ animation: "spin 0.65s linear infinite" }} /> */}
      <Loader size={36} className="animate-spin" />
    </div>
  );
}


export default LoadingSpinner;