import requests
import logging
from basic_objects.Config import settings
from exceptions.Exceptions import ORSClientError

logger = logging.getLogger(__name__)

def get_ors_route_data(payload: dict) -> dict:
    headers = {"Authorization": f"Bearer {settings.ors_token}"}
    try:
        response = requests.post(
            url=settings.ors_url,
            json=payload,
            headers=headers,
            timeout=settings.ors_timeout
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout as exc:
        logger.error("ORS timed out after %s seconds", settings.ors_timeout)
        raise ORSClientError("Routing service timed out") from exc
    except requests.exceptions.HTTPError as exc:
        message = str(exc)
        if exc.response is not None:
            try:
                err_json = exc.response.json()
                message = err_json.get("error", {}).get("message", str(err_json))
            except requests.exceptions.JSONDecodeError:
                message = exc.response.text
        logger.error("ORS error %s: %s", exc.response.status_code, message)
        raise ORSClientError(message) from exc
    except requests.exceptions.RequestException as exc:
        logger.error("ORS connection failed: %s", exc)
        raise ORSClientError("Routing service connection failed") from exc