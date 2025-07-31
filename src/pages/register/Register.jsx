import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

export default function Register() {
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();
    if (passwordAgain.current.value !== password.current.value) {
      passwordAgain.current.setCustomValidity("Passwords don't match!");
    } else {
      const user = {
        username: username.current.value,
        email: email.current.value,
        password: password.current.value,
      };
      try {
        await api.post("/auth/register", user);
        navigate("/login");
      } catch (err) {
        console.log(err);
      }
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
            <input placeholder="Username" required ref={username} className="h-12 px-4 rounded-md bg-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-primary" />
            <input placeholder="Email" required type="email" ref={email} className="h-12 px-4 rounded-md bg-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-primary" />
            <input placeholder="Password" required type="password" minLength="6" ref={password} className="h-12 px-4 rounded-md bg-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-primary" />
            <input placeholder="Password Again" required type="password" ref={passwordAgain} className="h-12 px-4 rounded-md bg-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-primary" />
            <button type="submit" className="h-12 bg-neon-primary text-background-primary font-bold rounded-md hover:shadow-neon-glow transition-shadow">Sign Up</button>
            <Link to="/login" className="w-full">
              <button className="h-12 w-full bg-neon-secondary text-background-primary font-bold rounded-md hover:shadow-lg hover:shadow-neon-secondary/50 transition-shadow">
                Log into Account
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}