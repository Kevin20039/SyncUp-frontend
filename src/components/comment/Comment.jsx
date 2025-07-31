import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "timeago.js";
import api from "../../api";

export default function Comment({ comment }) {
  const [user, setUser] = useState({});
  const PF = import.meta.env.VITE_PUBLIC_FOLDER;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users?userId=${comment.userId}`);
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [comment.userId]);

  return (
    <div className="flex gap-3 my-3">
      <Link to={`/profile/${user.username}`}>
        <img
          src={user.profilePicture ? `http://localhost:8800/images/${user.profilePicture}` : PF + "person/noAvatar.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      </Link>
      <div className="bg-gray-700/50 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
            <Link to={`/profile/${user.username}`}>
                <span className="font-semibold text-sm text-white hover:text-blue-400 transition-colors">{user.username}</span>
            </Link>
            <span className="text-xs text-gray-400">{format(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-200">{comment.text}</p>
      </div>
    </div>
  );
}