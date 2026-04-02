from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import gdown
import io
import os
from contextlib import asynccontextmanager


MODEL_PATH = "age_prediction_model.keras"
FILE_ID = "1o1_goGYHKE1L-CPY2McgThK1dsPaw2yx"
model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    if not os.path.exists(MODEL_PATH):
        print("Downloading model...")
        url = f"https://drive.google.com/uc?id={FILE_ID}"
        gdown.download(url, MODEL_PATH, quiet=False)

    print("Loading model into memory...")
    model = load_model(MODEL_PATH)
    print("Model loaded successfully.")
    yield
    model = None

app = FastAPI(lifespan=lifespan)

IMG_SIZE = (224, 224)


def preprocess_image(image: Image.Image):
    image = image.resize(IMG_SIZE)
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image


@app.get("/")
def read_root():
    return {"message": "Age Prediction API is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        processed = preprocess_image(image)

        prediction = model.predict(processed)[0][0]

        predicted_age = int(round(prediction))

        return JSONResponse(content={
            "predicted_age": predicted_age
        })

    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )
