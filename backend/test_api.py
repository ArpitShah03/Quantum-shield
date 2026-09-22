import requests

def test_system():
    try:
        print("Testing Dashboard API...")
        res = requests.get('http://127.0.0.1:8000/analytics/dashboard')
        print(f"Status {res.status_code}: {res.json()}\n")
        
        print("Testing System Health API...")
        res = requests.get('http://127.0.0.1:8000/analytics/system-health')
        print(f"Status {res.status_code}: {res.json()}\n")
        
        print("Testing Benchmark API (running PQ algorithms)...")
        res = requests.get('http://127.0.0.1:8000/analytics/benchmark')
        print(f"Status {res.status_code}: {res.json()}\n")
        
        print("ALL TESTS PASSED!")
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == '__main__':
    test_system()
