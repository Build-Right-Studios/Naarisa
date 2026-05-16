import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (typeof window !== "undefined") {
  const findOverflow = () => {
    document.querySelectorAll("*").forEach((el) => {
      if (el.offsetWidth > document.documentElement.offsetWidth) {
        el.style.outline = "3px solid red";
        console.log("OVERFLOW:", el);
      }
    });
  };
  setTimeout(findOverflow, 1000);
}