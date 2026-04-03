from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import numpy as np
from ai_edge_litert.interpreter import Interpreter
from PIL import Image
import gdown
import io
import os
from contextlib import asynccontextmanager

MODEL_PATH = "age_prediction_model.tflite"
FILE_ID = "1k3rvXovXY6RYkVnR5HPi5mtQi_aHDDdE"  # the .tflite file's Drive ID
interpreter = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global interpreter
    if not os.path.exists(MODEL_PATH):
        print("Downloading model...")
        gdown.download(
            f"https://drive.google.com/uc?id={FILE_ID}", MODEL_PATH, quiet=False)

    print("Loading model...")
    interpreter = Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    print("Model loaded.")
    yield
    interpreter = None

app = FastAPI(lifespan=lifespan)
IMG_SIZE = (224, 224)


def preprocess_image(image: Image.Image):
    image = image.resize(IMG_SIZE)
    image = np.array(image, dtype=np.float32) / 255.0
    return np.expand_dims(image, axis=0)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        processed = preprocess_image(image)

        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        interpreter.set_tensor(input_details[0]['index'], processed)
        interpreter.invoke()
        prediction = interpreter.get_tensor(output_details[0]['index'])[0][0]

        return JSONResponse(content={"predicted_age": int(round(float(prediction)))})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
