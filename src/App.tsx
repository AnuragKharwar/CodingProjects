import "./App.css";
import Chessboard from "./components/Chessboard";
import helmet from "helmet";
import React from "react";
function App() {
  return (
    <div className="App">
      <div id="app_center">
        <Chessboard />
      </div>
    </div>
  );
}

export default App;
