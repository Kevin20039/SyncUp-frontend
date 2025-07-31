import { useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api";

export default function Login() {
  const email = useRef();
  const password = useRef();
  const { dispatch, isFetching } = useContext(AuthContext);

  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await api.post("/auth/login", {
        email: email.current.value,
        password: password.current.value,
      });
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE" });
      console.error(err);
    }
  };

  return (
    <div className="w-screen h-screen bg-background-primary flex items-center justify-center">
      <div className="w-full md:w-3/4 lg:w-1/2 p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-5xl font-extrabold text-neon-primary drop-shadow-neon-glow">SyncUp</h3>
          
        </div>
        <div className="flex-1">
          <form onSubmit={handleClick} className="p-6 bg-background-secondary rounded-lg shadow-lg flex flex-col gap-4">
            <input placeholder="Email" type="email" required ref={email} className="h-12 px-4 rounded-md bg-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-primary" />
            <input placeholder="Password" type="password" required minLength="6" ref={password} className="h-12 px-4 rounded-md bg-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-primary" />
            <button type="submit" disabled={isFetching} className="h-12 bg-neon-primary text-background-primary font-bold rounded-md hover:shadow-neon-glow transition-shadow disabled:bg-gray-600 disabled:cursor-not-allowed">
              {isFetching ? "Loading..." : "Log In"}
            </button>
            <span className="text-center text-neon-secondary cursor-pointer">Forgot Password?</span>
            <Link to="/register" className="w-full">
              <button className="h-12 w-full bg-neon-secondary text-background-primary font-bold rounded-md hover:shadow-lg hover:shadow-neon-secondary/50 transition-shadow">
                Create a New Account
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}