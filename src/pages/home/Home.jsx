import Topbar from "../../components/topbar/Topbar";
import Feed from "../../components/feed/Feed";

export default function Home() {
  return (
    <div className="bg-background-primary min-h-screen">
      <Topbar />
      <div className="w-full max-w-4xl mx-auto px-4">
        <Feed />
      </div>
    </div>
  );
}