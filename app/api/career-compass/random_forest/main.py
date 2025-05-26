import pickle
import os
from typing import List, Union, Dict, Any
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="Career Compass ML API",
    description="API for job role prediction based on skills, education, and experience",
    version="1.0.0"
)

# Add CORS middleware for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store the loaded model
model = None

# Pydantic models for request/response
class PredictionRequest(BaseModel):
    skills: Union[List[str], str] = Field(..., description="Skills as a list or comma-separated string")
    education: str = Field(..., description="Education level")
    job_experience: Union[int, float] = Field(..., description="Years of job experience", ge=0)

class PredictionResponse(BaseModel):
    predicted_job_role: str
    confidence: float
    probabilities: Dict[str, float]
    success: bool
    message: str

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_type: str

def load_model():
    """Load the pickle model on startup"""
    global model
    try:
        model_path = os.path.join(os.path.dirname(__file__), "rf.pkl")
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        raise e

def preprocess_features(skills: Union[List[str], str], education: str, job_experience: Union[int, float]) -> pd.DataFrame:
    """
    Preprocess the input features for the model
    This function should be adapted based on how your model was trained
    """
    # Convert skills to appropriate format
    if isinstance(skills, str):
        skills_list = [skill.strip() for skill in skills.split(",")]
    else:
        skills_list = skills
    
    # Create a basic feature representation
    # Note: This is a simplified example - you may need to adjust based on your model's training
    features = {
        'skills_count': len(skills_list),
        'education': education.lower().strip(),
        'job_experience': float(job_experience),
        # Add more feature engineering as needed based on your model
    }
    
    # Convert to DataFrame
    df = pd.DataFrame([features])
    
    return df

@app.on_event("startup")
async def startup_event():
    """Load model when the application starts"""
    load_model()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Career Compass ML API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    model_status = "loaded" if model is not None else "not loaded"
    return {
        "status": "healthy",
        "model_status": model_status,
        "api_version": "1.0.0"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_job_role(request: PredictionRequest):
    """
    Predict job role based on skills, education, and experience
    """
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Preprocess the input features
        features_df = preprocess_features(
            skills=request.skills,
            education=request.education,
            job_experience=request.job_experience
        )
        
        # Make prediction
        prediction = model.predict(features_df)[0]
        
        # Get prediction probabilities if available
        probabilities = {}
        confidence = 0.0
        
        try:
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba(features_df)[0]
                
                # Get class labels if available
                if hasattr(model, 'classes_'):
                    classes = model.classes_
                    probabilities = {str(cls): float(prob) for cls, prob in zip(classes, proba)}
                    confidence = float(max(proba))
                else:
                    confidence = float(max(proba)) if len(proba) > 0 else 0.0
        except Exception as e:
            print(f"Warning: Could not get probabilities: {str(e)}")
            confidence = 0.5  # Default confidence
        
        return PredictionResponse(
            predicted_job_role=str(prediction),
            confidence=confidence,
            probabilities=probabilities,
            success=True,
            message="Prediction completed successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

@app.post("/predict-batch")
async def predict_batch(requests: List[PredictionRequest]):
    """
    Batch prediction endpoint for multiple requests
    """
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        results = []
        for req in requests:
            try:
                # Process individual request
                features_df = preprocess_features(
                    skills=req.skills,
                    education=req.education,
                    job_experience=req.job_experience
                )
                
                prediction = model.predict(features_df)[0]
                
                # Get confidence if available
                confidence = 0.0
                probabilities = {}
                
                if hasattr(model, 'predict_proba'):
                    proba = model.predict_proba(features_df)[0]
                    confidence = float(max(proba))
                    
                    if hasattr(model, 'classes_'):
                        classes = model.classes_
                        probabilities = {str(cls): float(prob) for cls, prob in zip(classes, proba)}
                
                results.append(PredictionResponse(
                    predicted_job_role=str(prediction),
                    confidence=confidence,
                    probabilities=probabilities,
                    success=True,
                    message="Prediction completed successfully"
                ))
                
            except Exception as e:
                results.append(ErrorResponse(
                    success=False,
                    message=f"Failed to process request: {str(e)}",
                    error_type="prediction_error"
                ))
        
        return {"results": results, "total_processed": len(requests)}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Batch prediction failed: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)