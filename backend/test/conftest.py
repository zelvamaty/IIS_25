import pytest
import os

def require_var(varname : str):
    value = os.getenv(varname)
    if not value:
        pytest.fail(f"Environment variable {varname} is not set!")
    return value

@pytest.fixture
def url():
    return require_var("URL")
