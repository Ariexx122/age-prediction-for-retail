const API_URL = "https://age-prediction-for-retail.onrender.com/predict";
let stream = null;
let selectedFile = null;

function switchTab(tab) {
  document
    .getElementById("tab-upload")
    .classList.toggle("active", tab === "upload");
  document
    .getElementById("tab-webcam")
    .classList.toggle("active", tab === "webcam");
  document.getElementById("upload-panel").style.display =
    tab === "upload" ? "block" : "none";
  document.getElementById("webcam-panel").style.display =
    tab === "webcam" ? "block" : "none";
  hideError();
  if (tab !== "webcam" && stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById("dropzone").style.background = "#fafaf8";
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) loadFile(file);
}

function previewFile(input) {
  if (input.files[0]) loadFile(input.files[0]);
}

function loadFile(file) {
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById("preview");
    img.src = e.target.result;
    img.style.display = "block";
    document.getElementById("dropzone").style.display = "none";
    document.getElementById("predict-upload-btn").disabled = false;
  };
  reader.readAsDataURL(file);
}

async function predictFromUpload() {
  if (!selectedFile) return;
  showSpinner();
  hideError();
  try {
    const formData = new FormData();
    formData.append("file", selectedFile);
    const res = await fetch(API_URL, { method: "POST", body: formData });
    const data = await res.json();
    if (data.predicted_age !== undefined) showResult(data.predicted_age);
    else throw new Error(data.error || "Unexpected response");
  } catch (err) {
    showError("Something went wrong. Is the API awake? Try again in a moment.");
    console.error(err);
  } finally {
    hideSpinner();
  }
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });
    const video = document.getElementById("video");
    video.srcObject = stream;
    document.getElementById("webcam-placeholder").style.display = "none";
    video.style.display = "block";
    document.getElementById("start-camera-btn").style.display = "none";
    document.getElementById("capture-btn").style.display = "block";
  } catch (err) {
    showError("Camera access denied or unavailable.");
  }
}

async function captureAndPredict() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("snapshot");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  video.style.display = "none";
  canvas.style.display = "block";
  document.getElementById("capture-btn").style.display = "none";
  document.getElementById("retake-btn").style.display = "block";
  showSpinner();
  hideError();
  canvas.toBlob(
    async (blob) => {
      try {
        const formData = new FormData();
        formData.append("file", blob, "capture.jpg");
        const res = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.predicted_age !== undefined) showResult(data.predicted_age);
        else throw new Error(data.error || "Unexpected response");
      } catch (err) {
        showError(
          "Something went wrong. Is the API awake? Try again in a moment.",
        );
        console.error(err);
      } finally {
        hideSpinner();
      }
    },
    "image/jpeg",
    0.92,
  );
}

function retake() {
  document.getElementById("snapshot").style.display = "none";
  document.getElementById("retake-btn").style.display = "none";
  document.getElementById("webcam-placeholder").style.display = "flex";
  document.getElementById("start-camera-btn").style.display = "block";
  hideError();
}

function showResult(age) {
  document.getElementById("age-output").textContent = age;
  document.getElementById("result-card").style.display = "block";
  document
    .getElementById("result-card")
    .scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function reset() {
  document.getElementById("result-card").style.display = "none";
  document.getElementById("preview").style.display = "none";
  document.getElementById("dropzone").style.display = "block";
  document.getElementById("fileInput").value = "";
  document.getElementById("predict-upload-btn").disabled = true;
  selectedFile = null;
  hideError();
  switchTab("upload");
}

function showSpinner() {
  document.getElementById("spinner").style.display = "block";
  document.getElementById("loading-msg").style.display = "block";
}
function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
  document.getElementById("loading-msg").style.display = "none";
}
function showError(msg) {
  const el = document.getElementById("error-msg");
  el.textContent = msg;
  el.style.display = "block";
}
function hideError() {
  document.getElementById("error-msg").style.display = "none";
}
