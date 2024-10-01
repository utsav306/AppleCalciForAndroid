// pages/_app.js
import "../styles/globals.css"; // Ensure this path points to your global CSS file

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
