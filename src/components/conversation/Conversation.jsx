import { useEffect, useState } from "react";
import api from "../../api";

export default function Conversation({ conversation, currentUser }) {
  const [user, setUser] = useState(null);
  const PF = import.meta.env.VITE_PUBLIC_FOLDER;

  useEffect(() => {
    const friendId = conversation.members.find((m) => m !== currentUser._id);

    const getUser = async () => {
      try {
        const res = await api.get("/users?userId=" + friendId);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, conversation]);

  return (
    <div className="flex items-center p-2 cursor-pointer hover:bg-gray-700/50 rounded-lg">
      <img
        className="w-10 h-10 rounded-full object-cover mr-3"
        src={user?.profilePicture ? `http://localhost:8800/images/${user.profilePicture}`: PF + "person/noAvatar.png"}
        alt=""
      />
      <span className="font-semibold text-white">{user?.username}</span>
    </div>
  );
}