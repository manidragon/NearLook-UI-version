import "./ResponseMessage.css";
import ReactMarkdown from "react-markdown";

interface ResponseMessageProps {
  message: string;
}

const ResponseMessage = ({ message }: ResponseMessageProps) => {
  const displayMessage = typeof message === 'object' && message !== null ? (message as any).message || JSON.stringify(message) : message;
  
  return (
    <div className="response-message px-3 py-4 bg-white rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 border border-gray-100">
      <ReactMarkdown>{displayMessage}</ReactMarkdown>
    </div>
  );
};

export default ResponseMessage;
