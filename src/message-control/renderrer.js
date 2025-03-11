const electron = window.require("electron");
const { ipcRenderer } = electron;

export default function send(sql) {
  return new Promise((resolve) => {
    ipcRenderer.once("asynchronous-reply", (_, arg) => {
      resolve(arg);
    });
    try {
      ipcRenderer.send("asynchronous-message", sql);
    } catch (error) {
      console.log(error);
    }
  });
}
