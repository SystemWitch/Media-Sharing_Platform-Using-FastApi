import { useState } from "react";
import Auth from "./components/Auth";
import Upload from "./components/Upload";
import Feed from "./components/Feed";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  if (!loggedIn) return <Auth onLogin={() => setLoggedIn(true)} />;

  return (
    <>
      <h1>Media Sharing Platform</h1>
      <Upload onUpload={() => window.location.reload()} />
      <Feed />
    </>
  );
}
