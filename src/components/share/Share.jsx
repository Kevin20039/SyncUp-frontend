// src/components/share/Share.jsx

import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api";

export default function Share() {
    const { user } = useContext(AuthContext);
    const desc = useRef();
    const [file, setFile] = useState(null);
    const PF = import.meta.env.VITE_PUBLIC_FOLDER;

    const submitHandler = async (e) => {
        e.preventDefault();
        const newPost = {
            userId: user._id,
            desc: desc.current.value,
        };

        if (file) {
            const data = new FormData();
            const fileName = Date.now() + file.name;
            data.append("name", fileName);
            data.append("file", file);
            
            // --- MODIFIED LOGIC: Check if file is image or video ---
            if (file.type.startsWith("video/")) {
                newPost.video = fileName;
            } else {
                newPost.img = fileName;
            }
            // --- END OF MODIFIED LOGIC ---

            try {
                await api.post("/upload", data);
            } catch (err) {
              console.error("File upload failed:", err);
            }
        }

        try {
            await api.post("/posts", newPost);
            window.location.reload();
        } catch (err) {
            console.error("Post creation failed:", err);
        }
    };

    return (
        <div className="w-full p-4 rounded-lg bg-background-secondary shadow-md my-5">
            <div className="flex items-center">
                <img src={user.profilePicture ? `http://localhost:8800/images/${user.profilePicture}` : PF + "person/noAvatar.png"} alt="Profile" className="w-12 h-12 rounded-full object-cover mr-4" />
                <input placeholder={`What's on your mind, ${user.username}?`} ref={desc} className="w-full bg-transparent text-lg focus:outline-none" />
            </div>
            <hr className="my-4 border-gray-700" />
            <form onSubmit={submitHandler} className="flex justify-between items-center">
                <div className="flex gap-4">
                    <label htmlFor="file" className="flex items-center gap-2 cursor-pointer text-neon-secondary hover:opacity-80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14" /></svg>
                        <span className="font-semibold">Photo or Video</span>
                        {/* --- MODIFIED INPUT: Now accepts videos --- */}
                        <input 
                            type="file" 
                            id="file" 
                            accept=".png,.jpeg,.jpg,.mp4,.mkv" 
                            onChange={(e) => setFile(e.target.files[0])} 
                            className="hidden" 
                        />
                    </label>
                </div>
                <button type="submit" className="px-4 py-2 bg-neon-primary text-background-primary font-bold rounded-md hover:shadow-neon-glow transition-shadow">Share</button>
            </form>
            {file && <div className="mt-4 text-sm text-text-secondary">Selected: {file.name}</div>}
        </div>
    );
}