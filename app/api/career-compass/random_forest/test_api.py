#!/usr/bin/env python3
"""
Test script for the Career Compass ML API
"""

import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoints"""
    print("🔍 Testing health check endpoints...")
    
    try:
        # Test root endpoint
        response = requests.get(f"{BASE_URL}/")
        print(f"Root endpoint: {response.status_code} - {response.json()}")
        
        # Test health endpoint
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health endpoint: {response.status_code} - {response.json()}")
        
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_single_prediction():
    """Test single prediction endpoint"""
    print("\n🎯 Testing single prediction...")
    
    test_data = {
        "skills": ["Python", "Machine Learning", "Data Analysis", "SQL"],
        "education": "Bachelor of Science",
        "job_experience": 3
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            headers={"Content-Type": "application/json"},
            json=test_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Prediction successful!")
            print(f"   Predicted Job Role: {result['predicted_job_role']}")
            print(f"   Confidence: {result['confidence']:.2f}")
            print(f"   Success: {result['success']}")
            
            if result.get('probabilities'):
                print("   Probabilities:")
                for role, prob in result['probabilities'].items():
                    print(f"     {role}: {prob:.3f}")
            
            return True
        else:
            print(f"❌ Prediction failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Prediction test failed: {e}")
        return False

def test_batch_prediction():
    """Test batch prediction endpoint"""
    print("\n📦 Testing batch prediction...")
    
    test_data = [
        {
            "skills": ["Python", "Machine Learning"],
            "education": "Bachelor of Science",
            "job_experience": 2
        },
        {
            "skills": ["Java", "Spring Boot", "Microservices"],
            "education": "Master of Science",
            "job_experience": 5
        },
        {
            "skills": ["React", "JavaScript", "CSS"],
            "education": "Bachelor of Arts",
            "job_experience": 1
        }
    ]
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict-batch",
            headers={"Content-Type": "application/json"},
            json=test_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Batch prediction successful!")
            print(f"   Total processed: {result['total_processed']}")
            
            for i, prediction in enumerate(result['results']):
                if prediction.get('success'):
                    print(f"   Request {i+1}: {prediction['predicted_job_role']} (confidence: {prediction['confidence']:.2f})")
                else:
                    print(f"   Request {i+1}: Failed - {prediction.get('message', 'Unknown error')}")
            
            return True
        else:
            print(f"❌ Batch prediction failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Batch prediction test failed: {e}")
        return False

def test_invalid_input():
    """Test API with invalid input"""
    print("\n❗ Testing invalid input handling...")
    
    # Test with missing required fields
    invalid_data = {
        "skills": ["Python"],
        # Missing education and job_experience
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            headers={"Content-Type": "application/json"},
            json=invalid_data
        )
        
        if response.status_code == 422:  # Validation error expected
            print("✅ Invalid input properly rejected with validation error")
            return True
        else:
            print(f"❌ Expected validation error, got: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Invalid input test failed: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("🚀 Starting Career Compass ML API Tests\n")
    
    # Wait a moment for server to be ready
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    tests = [
        ("Health Check", test_health_check),
        ("Single Prediction", test_single_prediction),
        ("Batch Prediction", test_batch_prediction),
        ("Invalid Input", test_invalid_input)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*50)
    print("📊 TEST SUMMARY")
    print("="*50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    run_all_tests()
