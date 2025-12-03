import pytest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app  # noqa: E402

@pytest.fixture
def client():
    app = create_app() 
    
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client