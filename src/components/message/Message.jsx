import { format } from "timeago.js";

export default function Message({ message, own }) {
  return (
    <div className={`flex flex-col mt-5 ${own ? "items-end" : "items-start"}`}>
      <div className={`p-3 rounded-2xl max-w-sm ${own ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}`}>
        <p>{message.text}</p>
      </div>
      <div className="text-xs mt-1 text-gray-400">
        {format(message.createdAt)}
      </div>
    </div>
  );
}