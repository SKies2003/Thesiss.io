from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.endpoints import dependencies
from app.crud import market_index as market_index_crud
from app.schemas import market_index as market_index_schema
from app.database import models

router = APIRouter()

@router.get("/list", response_model=List[market_index_schema.MarketIndexList])
def list_all_indices(
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """
    Fetch all available market indices with their basic information
    """
    indices = market_index_crud.get_all_indices(db)
    return indices


@router.get("/{symbol}", response_model=market_index_schema.MarketIndexDetail)
def get_index_details(
    symbol: str,
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """
    Fetch detailed information for a specific market index including all hourly prices
    """
    index = market_index_crud.get_index_with_prices(db, symbol)
    
    if not index:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market index with symbol '{symbol}' not found"
        )
    
    return index
