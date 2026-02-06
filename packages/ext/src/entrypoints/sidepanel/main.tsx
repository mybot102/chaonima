import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@/assets/tailwind.css';

const root = document.getElementById('app');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
