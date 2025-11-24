from fastapi import APIRouter
from .endpoints import auth, companies, market_indices

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(market_indices.router, prefix="/market-indices", tags=["Market Indices"])