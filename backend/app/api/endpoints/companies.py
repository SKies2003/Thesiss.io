from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Annotated

from app.api.endpoints import dependencies
from app.crud import company as company_crud
from app.schemas import company as company_schema
from app.database import models

# Prefix and tags are defined in the main router, so they are not needed here.
router = APIRouter()

@router.get("/{symbol}", response_model=company_schema.CompanyData)
def get_company_timeseries_data(
    symbol: str,
    start_date: date = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: date = Query(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """
    Retrieve all time-series data for a specific company symbol within a date range.
    This includes stock prices, financial reports, and corporate actions.
    """
    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date cannot be after end date."
        )

    company_data = company_crud.get_company_data_by_symbol(
        db=db, symbol=symbol, start_date=start_date, end_date=end_date
    )

    if not company_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with symbol '{symbol}' not found."
        )
    
    return company_data