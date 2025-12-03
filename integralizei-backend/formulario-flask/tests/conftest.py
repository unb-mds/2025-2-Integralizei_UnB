import pytest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app as flask_app


@pytest.fixture
def client():

    flask_app.config["TESTING"] = True

    with flask_app.test_client() as client:
        yield client
