import { useState, useEffect, useContext, useRef } from "react";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api";
import Comment from "../comment/Comment";

export default function Post({ post }) {
    const [like, setLike] = useState(post.likes.length);
    const [isLiked, setIsLiked] = useState(false);
    const [postUser, setPostUser] = useState({});
    const { user: currentUser } = useContext(AuthContext);
    const PF = import.meta.env.VITE_PUBLIC_FOLDER;
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const commentText = useRef();

    useEffect(() => {
        setIsLiked(post.likes.includes(currentUser._id));
    }, [currentUser._id, post.likes]);

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                const [userRes, commentsRes] = await Promise.all([
                    api.get(`/users?userId=${post.userId}`),
                    api.get(`/posts/${post._id}/comments`)
                ]);
                setPostUser(userRes.data);
                setComments(commentsRes.data.sort((c1, c2) => new Date(c2.createdAt) - new Date(c1.createdAt)));
            } catch (err) {
                console.error("Failed to fetch post details:", err);
            }
        };
        fetchPostDetails();
    }, [post.userId, post._id]);

    const likeHandler = () => {
        try { api.put(`/posts/${post._id}/like`, { userId: currentUser._id }) }
        catch (err) { console.error(err) }
        setLike(isLiked ? like - 1 : like + 1);
        setIsLiked(!isLiked);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const text = commentText.current.value;
        if (!text) return;
        const newComment = {
            userId: currentUser._id,
            text: text,
        };
        try {
            const res = await api.post(`/posts/${post._id}/comments`, newComment);
            setComments([res.data, ...comments]);
            commentText.current.value = "";
        } catch (err) {
            console.error("Failed to post comment", err);
        }
    };

    const handleShare = () => {
        const postUrl = `${window.location.origin}/post/${post._id}`; // Note: This route doesn't exist yet, but is good for sharing
        const shareText = `${postUser.username}: ${post.desc || 'Check out this post!'}`;

        if (navigator.share) {
            navigator.share({
                title: `${postUser.username}'s Post`,
                text: shareText,
                url: postUrl
            }).catch(err => console.error("Share failed:", err));
        } else {
            navigator.clipboard.writeText(`${shareText}\n${postUrl}`).then(() => {
                alert('Post link copied to clipboard!');
            });
        }
    };

    return (
        <div className="w-full my-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Link to={`/profile/${postUser.username}`} className="group">
                            <div className="relative">
                                <img
                                    src={postUser.profilePicture ? `http://localhost:8800/images/${postUser.profilePicture}` : PF + "person/noAvatar.png"}
                                    alt=""
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-600 group-hover:ring-blue-400 transition-all duration-200"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                            </div>
                        </Link>
                        <div>
                            <Link to={`/profile/${postUser.username}`} className="block">
                                <span className="font-semibold text-white hover:text-blue-400 transition-colors">{postUser.username}</span>
                            </Link>
                            <span className="text-sm text-gray-400">{format(post.createdAt)}</span>
                        </div>
                    </div>
                </div>



                {/* Content */}
                <div className="mb-6">
                    {post?.desc && (
                        <p className="text-gray-200 text-base leading-relaxed mb-4">{post.desc}</p>
                    )}
                    {post.img && (
                        <div className="relative group">
                            <img
                                src={`http://localhost:8800/images/${post.img}`}
                                alt="Post"
                                className="w-full max-h-[600px] object-cover rounded-xl shadow-lg"
                            />
                        </div>
                    )}
                    {/* --- ADD THIS VIDEO BLOCK --- */}
                    {post.video && (
                        <div className="relative group mt-4">
                            <video
                                src={`http://localhost:8800/images/${post.video}`}
                                controls
                                className="w-full max-h-[600px] object-cover rounded-xl shadow-lg"
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <div className="flex items-center space-x-6">
                        {/* Like Button */}
                        <button onClick={likeHandler} className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group">
                            <div className={`p-1.5 rounded-full transition-all duration-200 ${isLiked ? 'bg-red-500/20 text-red-400' : 'text-gray-400 group-hover:text-red-400'}`}>
                                <svg className={`w-5 h-5 transition-transform duration-200 ${isLiked ? 'scale-110' : ''}`} fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isLiked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <span className={`text-sm font-medium transition-colors ${isLiked ? 'text-red-400' : 'text-gray-400 group-hover:text-red-400'}`}>{like} {like === 1 ? 'like' : 'likes'}</span>
                        </button>

                        {/* Comment Button */}
                        <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group">
                            <div className="p-1.5 rounded-full text-gray-400 group-hover:text-blue-400 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            </div>
                            <span className="text-sm font-medium text-gray-400 group-hover:text-blue-400 transition-colors">{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
                        </button>

                        {/* Share Button */}
                        <button onClick={handleShare} className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group">
                            <div className="p-1.5 rounded-full text-gray-400 group-hover:text-green-400 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                            </div>
                            <span className="text-sm font-medium text-gray-400 group-hover:text-green-400 transition-colors">Share</span>
                        </button>
                    </div>
                </div>

                {/* Comment Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 mb-4">
                            <img src={currentUser.profilePicture ? `http://localhost:8800/images/${currentUser.profilePicture}` : PF + "person/noAvatar.png"} alt="Your Profile" className="w-10 h-10 rounded-full object-cover" />
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                ref={commentText}
                                className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors">Post</button>
                        </form>

                        <div className="flex flex-col max-h-60 overflow-y-auto pr-2 space-y-2">
                            {comments.length > 0 ? (
                                comments.map(comment => <Comment key={comment._id} comment={comment} />)
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first!</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}