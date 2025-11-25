from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Annotated, List

from app.api.endpoints import dependencies
from app.crud import company as company_crud
from app.schemas import company as company_schema
from app.database import models

# Prefix and tags are defined in the main router, so they are not needed here.
router = APIRouter()

@router.get("/list", response_model=List[company_schema.CompanyList])
def list_all_companies(
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """
    Fetch all available companies with their names and symbols
    """
    companies = company_crud.get_all_companies(db)
    return companies


# --- CRITICAL FIX: These routes must come BEFORE /{symbol} ---
@router.get("/ticker", response_model=List[company_schema.CompanyTicker])
def get_ticker_tape_data(
    db: Session = Depends(dependencies.get_db),
):
    """
    Get real-time ticker data for the navbar tape.
    This is a public endpoint (no auth required) so it loads instantly.
    """
    data = company_crud.get_ticker_data(db)
    if not data:
        return [] 
    return data


@router.get("/drip-simulation", response_model=company_schema.DRIPProjectionResponse)
def simulate_dividend_reinvestment(
    symbol: str = Query(..., description="Company ticker symbol (e.g., RELIANCE.NS)", example="RELIANCE.NS"),
    start_date: date = Query(..., description="Start date for simulation in YYYY-MM-DD format", example="2020-01-01"),
    end_date: date = Query(..., description="End date for simulation in YYYY-MM-DD format", example="2025-11-25"),
    initial_investment: float = Query(..., gt=0, description="Initial investment amount in rupees", example=100000),
    db: Session = Depends(dependencies.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    """
    **Simulate Dividend Reinvestment Plan (DRIP)**
    
    Compare two investment strategies:
    - **Without DRIP**: Dividends collected as cash (linear growth)
    - **With DRIP**: Dividends buy more shares → more dividends → compound growth
    
    **True Compound Effect:**
    - Shares bought with dividends ALSO generate future dividends
    - All shares (original + dividend-bought) benefit from price appreciation
    - Creates exponential wealth accumulation over time
    
    **Returns:**
    - Timeline data for dual-line chart visualization
    - Final portfolio values and performance metrics
    - DRIP advantage percentage and extra wealth created
    
    **Example:** ₹1L invested in a stock paying regular dividends.
    After 5 years, DRIP might give you 15-30% more wealth than taking cash!
    """
    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date cannot be after end date."
        )
    
    projection = company_crud.calculate_drip_projection(
        db=db,
        symbol=symbol,
        start_date=start_date,
        end_date=end_date,
        initial_investment=initial_investment
    )
    
    if not projection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company '{symbol}' not found or insufficient data for period {start_date} to {end_date}. Try a different date range or symbol."
        )
    
    return projection


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


