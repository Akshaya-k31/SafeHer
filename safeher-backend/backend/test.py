import requests

url = "http://127.0.0.1:5000/auth/register"

data = {
    "email": "test@gmail.com",
    "password": "123456"
}

res = requests.post(url, json=data)

print(res.status_code)
print(res.json())