import "./App.css";
import APILogIn from "./components/APILogIn";
import PriceLadder from"./components/PriceLadder";

function App() {

  return (
    <div className="App">
      <header className="App-header">
      </header>
      <div className= "app-title">
      <h1> Alejandro's Trading App</h1>
      </div>
      <APILogIn />
      <PriceLadder />
    </div>
  );
}

export default App;
