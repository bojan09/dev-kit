import { evaluateRegex } from "./regex-engine.js";
self.onmessage = (event) => {
  try {
    self.postMessage({ result: evaluateRegex(event.data) });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
