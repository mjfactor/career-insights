# Career Compass ML API

This Python API serves a trained Random Forest model for job role prediction based on skills, education, and job experience.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Ensure Model File

Make sure the `rf.pkl` file (your trained model) is in the same directory as `main.py`.

### 3. Run the API

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at: `http://localhost:8000`

## API Documentation

Once running, you can access:
- **Interactive API Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

## Endpoints

### Health Check
- **GET** `/` - Basic health check
- **GET** `/health` - Detailed health status

### Predictions
- **POST** `/predict` - Single prediction
- **POST** `/predict-batch` - Batch predictions

## Example Usage

### Single Prediction

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Python", "Machine Learning", "SQL"],
    "education": "Bachelor of Science",
    "job_experience": 3
  }'
```

### Python Request Example

```python
import requests

url = "http://localhost:8000/predict"
data = {
    "skills": ["Python", "Machine Learning", "SQL", "Data Analysis"],
    "education": "Master of Science",
    "job_experience": 5
}

response = requests.post(url, json=data)
result = response.json()
print(f"Predicted Job Role: {result['predicted_job_role']}")
print(f"Confidence: {result['confidence']:.2f}")
```

## Input Format

The API expects:
- **skills**: List of strings or comma-separated string
- **education**: String representing education level
- **job_experience**: Number (int or float) representing years of experience

## Response Format

```json
{
  "predicted_job_role": "Data Scientist",
  "confidence": 0.85,
  "probabilities": {
    "Data Scientist": 0.85,
    "Software Engineer": 0.10,
    "ML Engineer": 0.05
  },
  "success": true,
  "message": "Prediction completed successfully"
}
```

## Integration with Next.js

To call this API from your Next.js application:

```typescript
// Example API route in Next.js
export async function POST(request: Request) {
  const body = await request.json();
  
  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      skills: body.skills,
      education: body.education,
      job_experience: body.job_experience
    })
  });
  
  const result = await response.json();
  return Response.json(result);
}
```

## Notes

- The feature preprocessing in `preprocess_features()` function may need to be customized based on how your model was originally trained
- CORS is configured for localhost:3000 to work with Next.js development server
- The API includes error handling and validation using Pydantic models
- Batch prediction endpoint is available for processing multiple requests at once

## Troubleshooting

1. **Model not loading**: Ensure `rf.pkl` is in the correct directory
2. **Import errors**: Make sure all dependencies from requirements.txt are installed
3. **CORS issues**: Update the allowed origins in the CORS middleware if needed
4. **Port conflicts**: Change the port in the uvicorn run command if 8000 is occupied
