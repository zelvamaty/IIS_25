import requests

HTTP_OK = 200
HTTP_UNAUTHORIZED = 401
HTTP_FORBIDDEN = 403
HTTP_NOT_FOUND = 404

def assert_response(url : str, expected_code : int = 200, expected_content : str = None, method : str = "GET", data : dict = None):
    response = requests.request(method, url, json=data)
    assert expected_code == response.status_code, f"Expected status code {expected_code}, got {response.status_code}"
    if expected_content is not None:
        assert expected_content == response.content, f"Expected content {expected_content}, got {response.content}"

