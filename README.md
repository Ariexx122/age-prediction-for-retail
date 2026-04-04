# 🧑 Age Estimator: ResNet50 for Retail Age Verification

**Live Interface:**  
https://ariexx122.github.io/age-prediction-for-retail/

This project is a full-stack Computer Vision application that estimates a person's age from facial images. It features a fine-tuned **ResNet50** model served via a **FastAPI** backend and a responsive web frontend supporting both image upload and real-time webcam capture.

---

##  Project Overview

This project addresses automated age verification for retail environments, specifically, flagging potentially underage customers at checkout for alcohol compliance.

A key focus of this project was validating whether transfer learning could meaningfully outperform a naive baseline, achieved by:

- Establishing a **mean-age baseline** (MAE = 13.32 years) as the minimum performance threshold
- Comparing a **frozen backbone** vs. **fine-tuned backbone** configuration
- Evaluating model precision in the critical 18–24 age range (17% of the dataset)

---

##  Modeling Approach

The model is built on **ResNet50** pretrained on ImageNet, adapted for age regression.

### Architecture:
- **Backbone:** ResNet50 (pretrained on ImageNet)
- **Head:** GlobalAveragePooling2D → Dense(1, activation='relu')
- **Loss:** Mean Squared Error
- **Optimizer:** Adam (lr=0.0001)
- **Early Stopping:** patience=3 on val_mae

### Two configurations were evaluated:

| Configuration | Val MAE | Val RMSE | vs. Baseline |
|---|---|---|---|
| Frozen Backbone | 13.14 yrs | 17.07 | ~0% improvement |
| Fine-Tuned Backbone ✅ | **6.45 yrs** | 8.75 | **~52% improvement** |

The frozen backbone failed to outperform the baseline, confirming that fixed ImageNet representations are insufficient for facial age estimation. Fine-tuning the backbone allowed the model to adapt its learned features to this specific task.

### Data augmentation:
- Horizontal flip
- Rotation (±15°)
- Rescaling (1./255)

---

## 📈 Business Impact

This system can help retailers:
- Automate preliminary age screening at point of sale
- Reduce risk of non-compliant alcohol sales to minors
- Flag borderline cases for human review

The model achieves a MAE of ~6.45 years, providing sufficient precision to meaningfully support, though not replace, human judgment in age verification workflows.

---

## 🛠️ Tech Stack

- **Modeling:** Python, TensorFlow/Keras, ResNet50, TFLite
- **API:** FastAPI, Uvicorn
- **Frontend:** HTML5, CSS3, JavaScript (webcam + file upload)
- **Deployment:** Render (Backend) and GitHub Pages (Frontend)

---

## 📂 Repository Structure

- **`/api`** → FastAPI backend, trained model (.tflite), and requirements
- **`/docs`** → Frontend (HTML, CSS, JS) deployed with GitHub Pages
- **`/notebook`** → EDA and model development

---

## 🛠️ Features

- **Real-time prediction** via webcam capture or image upload
- **TFLite conversion** for lightweight deployment without GPU dependency
- **Cold-start handling** for free-tier backend deployment
- **Clear separation** between CV model, API, and frontend layers

---

## 💻 Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Ariexx122/age-prediction-for-retail.git
cd age-prediction-for-retail
```

### 2. Install dependencies
```bash
pip install -r api/requirements.txt
```

### 3. Run the API
```bash
uvicorn api.main:app --reload
```

### 4. Open the interface
Open **`docs/index.html`** in your browser to start predicting.
