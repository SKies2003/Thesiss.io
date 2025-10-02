from fastapi import APIRouter
from .endpoints import auth, companies

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(companies.router)
