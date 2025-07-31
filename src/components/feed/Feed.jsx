import { useContext, useEffect, useState } from "react";
import api from "../../api";
import { AuthContext } from "../../context/AuthContext";
import Post from "../post/Post";
import Share from "../share/Share";

export default function Feed({ username }) {
    const [posts, setPosts] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = username
                    ? await api.get(`/posts/profile/${username}`)
                    : await api.get(`/posts/timeline/${user._id}`);
                setPosts(res.data.sort((p1, p2) => new Date(p2.createdAt) - new Date(p1.createdAt)));
            } catch (err) { console.error(err) }
        };
        fetchPosts();
    }, [username, user._id]);

    return (
        <div className="w-full">
            {(!username || username === user.username) && <Share />}
            {posts.map((p) => (<Post key={p._id} post={p} />))}
        </div>
    );
}