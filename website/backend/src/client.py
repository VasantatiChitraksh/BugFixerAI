import requests

DGX_API_URL = "http://10.23.20.36:8000/analyze_code/"  # Use DGX's IP

code_snippet = """
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n - 1)
print(factorial(5))
"""

try:
    print("🚀 Sending request to DGX API...")

    # 10s timeout for safety
    response = requests.post(
        DGX_API_URL, json={"code": code_snippet}, timeout=60)

    print(f"📡 Received response with status code: {response.status_code}")

    if response.status_code == 200:
        print("✅ Code Analysis Result:", response.json().get(
            "analysis", "No analysis found"))
    else:
        print(f"❌ Error {response.status_code}: {response.text}")

except requests.exceptions.ConnectionError:
    print("🚨 Connection Error: Unable to reach the DGX server. Check if the server is running.")
except requests.exceptions.Timeout:
    print("⏳ Timeout Error: The request took too long to complete. Try increasing the timeout.")
except requests.exceptions.RequestException as e:
    print(f"⚠️ Unexpected Error: {e}")
except Exception as e:
    print(f"🔥 Critical Error: {e}")