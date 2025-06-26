import logging
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from endpoints.RoutingEndpoint import router
from exceptions.Exceptions import register_exception_handlers

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Routing API",
    description="Get driving routes with optional avoid zones"
)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )