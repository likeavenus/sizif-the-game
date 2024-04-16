import { useState } from "react";
import styles from "./App.module.scss";

function App() {
  return (
    <div className={styles.App}>
      <div className={styles.link_box}>
        <a
          href="https://t.me/likeavenus"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made by @likeavenus{" "}
        </a>
        <a
          href="https://github.com/likeavenus"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>
      </div>
    </div>
  );
}

export default App;
