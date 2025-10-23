import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/markdown.css";
import "./styles/visual-enhancements.css";

createRoot(document.getElementById("root")!).render(<App />);
