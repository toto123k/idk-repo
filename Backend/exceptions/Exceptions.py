import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

class ORSClientError(Exception):
    pass

logger = logging.getLogger(__name__)

async def ors_exception_handler(request: Request, exc: ORSClientError):
    return JSONResponse(
        status_code=502,
        content={"detail": str(exc)}
    )

async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."}
    )

def register_exception_handlers(app: FastAPI):
    app.add_exception_handler(ORSClientError, ors_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)