import pytest
import requests

def test_get_index():
    response = requests.get("http://example.com")
    assert response.status_code == 200
