import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { Container } from "../components";

function Unsubscribe() {
    const { token } = useParams();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid unsubscribe link.");
            return;
        }

        const unsubscribe = async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_DOMAIN_URL}/api/v1/users/unsubscribe/${token}`
                );
                if (data.success) {
                    setStatus("success");
                    setMessage(data.message);
                } else {
                    setStatus("error");
                    setMessage(data.message || "Failed to unsubscribe.");
                }
            } catch (error) {
                setStatus("error");
                setMessage(
                    error.response?.data?.message ||
                    "An error occurred. Please try again."
                );
            }
        };

        unsubscribe();
    }, [token]);

    return (
        <Container className="min-h-[80vh] flex items-center justify-center">
            <div className="bg-white dark:bg-bg-primary-light rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                {status === "loading" && (
                    <>
                        <Loader size={48} className="animate-spin text-primary mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-300">Processing your request...</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Unsubscribed Successfully</h2>
                        <p className="text-gray-600 dark:text-gray-300">{message}</p>
                        <Link
                            to="/"
                            className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Go to Homepage
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <>
                        <XCircle size={48} className="text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Unsubscribe Failed</h2>
                        <p className="text-gray-600 dark:text-gray-300">{message}</p>
                        <Link
                            to="/"
                            className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Go to Homepage
                        </Link>
                    </>
                )}
            </div>
        </Container>
    );
}

export default Unsubscribe;