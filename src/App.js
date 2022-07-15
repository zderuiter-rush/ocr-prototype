import "./App.css";
import { Component } from "react";
import { init } from "./ocr";

export default class App extends Component {
  componentDidMount() {
    init();
  }

  render() {
    return (
      <div className="App">
        <table className="table">
          <tbody>
            <tr>
              <td>
                <button id="start-camera">Start Camera</button>
                <button id="click-photo">Click Photo</button>
              </td>
            </tr>
            <tr>
              <td>
                <video
                  id="video"
                  width="320"
                  height="240"
                  autoPlay
                  playsInline
                ></video>
              </td>
            </tr>
            <tr>
              <td>
                <canvas id="canvas" width="320" height="240" hidden></canvas>
              </td>
            </tr>
            <tr>
              <td>
                <div className="output"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
