const async = require("async");
const ComputerVisionClient =
  require("@azure/cognitiveservices-computervision").ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

const vid = {
  stream: null,
  toggle: false,
};

export function init() {
  const camera_button = document.querySelector("#start-camera");
  const click_button = document.querySelector("#click-photo");
  const video = document.querySelector("#video");
  const canvas = document.querySelector("#canvas");

  camera_button.addEventListener("click", async function () {
    vid.toggle = !vid.toggle;
    if (vid.toggle) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "environment",
          },
        })
        .then((stream) => {
          vid.stream = stream;
          video.srcObject = stream;
        });
    } else {
      vid.stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  });

  click_button.addEventListener("click", function () {
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      computerVision(blob);
    });
  });
}

/**
 * AUTHENTICATE
 * This single client is used for all examples.
 */
const key = "9c89e2c23f7f43dc8a0c196d6b970044";
const endpoint =
  "https://computer-vision-prototype.cognitiveservices.azure.com/";

const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);
/**
 * END - Authenticate
 */

function computerVision(blob) {
  async.series(
    [
      async function () {
        /**
         * OCR: READ PRINTED & HANDWRITTEN TEXT WITH THE READ API
         * Extracts text from images using OCR (optical character recognition).
         */
        console.log("-------------------------------------------------");
        console.log("READ PRINTED, HANDWRITTEN TEXT AND PDF");
        console.log();

        const printedResult = await readTextFromURL(computerVisionClient, blob);
        printRecText(printedResult);

        // Perform read and await the result from URL
        async function readTextFromURL(client, url) {
          // To recognize text in a local image, replace client.read() with readTextInStream() as shown:
          let result = await client.readInStream(url);
          // Operation ID is last path segment of operationLocation (a URL)
          let operation = result.operationLocation.split("/").slice(-1)[0];

          // Wait for read recognition to complete
          // result.status is initially undefined, since it's the result of read
          while (result.status !== "succeeded") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            result = await client.getReadResult(operation);
          }
          return result.analyzeResult.readResults; // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
        }

        // Prints all text from Read result
        function printRecText(readResults) {
          console.log("Recognized text:");
          document.querySelector(".output").innerHTML = "";
          for (const page in readResults) {
            if (readResults.length > 1) {
              console.log(`==== Page: ${page}`);
            }
            const result = readResults[page];
            if (result.lines.length) {
              for (const line of result.lines) {
                let res = line.words.map((w) => w.text).join(" ");
                console.log(res);
                document.querySelector(".output").innerHTML += res + "<br />";
              }
            } else {
              console.log("No recognized text.");
              document.querySelector(".output").innerHTML =
                "No recognized text";
            }
          }
        }

        /**
         * END - Recognize Printed & Handwritten Text
         */
        console.log();
        console.log("-------------------------------------------------");
        console.log("End of quickstart.");
      },
      function () {
        return new Promise((resolve) => {
          resolve();
        });
      },
    ],
    (err) => {
      throw err;
    }
  );
}
