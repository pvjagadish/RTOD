import React from "react";
import ReactDOM from "react-dom";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./styles.css";

class App extends React.Component {
  state = {
    model: null,
    preview: "",
    predictions: []
  };

  componentDidMount() {
    const video = document.getElementById("video");
    video.play();
    cocoSsd.load().then(model => {
      const canvas = document.getElementById("canvas");

      const ctx = canvas.getContext("2d");
      canvas.width = video.width;
      canvas.height = 300;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      this.detectFrame(video, canvas, model);
    });
  }

  detectFrame = (video, canvas, model) => {
    model.detect(video).then(predictions => {
      console.log(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, canvas, model);
      });
    });
  };

  onImageChange = e => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    this.cropToCanvas(e.target, c, ctx);
    this.state.model.detect(c).then(predictions => {
      // Font options.
      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";

      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];
        // Draw the bounding box.
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);
        // Draw the label background.
        ctx.fillStyle = "#00FFFF";
        const textWidth = ctx.measureText(prediction.class).width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
      });

      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);
      });
    });
  };

  render() {
    return (
      <div>
        <video id="video" width="400" height="300" controls>
          <source crossorigin="anonymous" src="/mov_bbb.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
        <canvas id="canvas" controls />
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
