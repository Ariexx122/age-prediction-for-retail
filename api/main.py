from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import io


app = FastAPI()

MODEL_PATH = "age_prediction_model.keras"
model = load_model(MODEL_PATH)

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
