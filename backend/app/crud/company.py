from sqlalchemy.orm import Session
from datetime import date
from sqlalchemy import desc
from app.database import models
from app.schemas import company as company_schema
import math

def get_all_companies(db: Session):
    """
    Fetch all companies with their names and symbols
    """
    return db.query(models.Company).all()

def get_company_data_by_symbol(db: Session, symbol: str, start_date: date, end_date: date):
    """
    Fetches all time-series data for a given company symbol within a date range.
    """
    company = db.query(models.Company).filter(models.Company.symbol == symbol.upper()).first()
    if not company:
        return None
    
    # Eagerly load related data to avoid the N+1 query problem
    # Although for separate date ranges, separate queries are better.
    
    company.stock_prices = db.query(models.StockPrice).filter(
        models.StockPrice.company_id == company.id,
        models.StockPrice.date.between(start_date, end_date)
    ).order_by(models.StockPrice.date).all()
    
    company.financials = db.query(models.FinancialReport).filter(
        models.FinancialReport.company_id == company.id,
        models.FinancialReport.date.between(start_date, end_date)
    ).order_by(models.FinancialReport.date).all()

    company.corporate_actions = db.query(models.CorporateAction).filter(
        models.CorporateAction.company_id == company.id,
        models.CorporateAction.date.between(start_date, end_date)
    ).order_by(models.CorporateAction.date).all()

    return company

def get_ticker_data(db: Session):
    """
    Fetches latest price and calculates % change safely.
    Sanitizes NaN/Infinity to prevent 500 JSON serialization errors.
    """
    companies = db.query(models.Company).all()
    ticker_data = []

    for company in companies:
        try:
            # Get the 2 most recent stock prices
            recent_prices = (db.query(models.StockPrice)
                             .filter(models.StockPrice.company_id == company.id)
                             .order_by(desc(models.StockPrice.date))
                             .limit(2)
                             .all())

            if recent_prices:
                current_price = float(recent_prices[0].price)
                change = 0.0
                
                # Calculate change safely
                if len(recent_prices) > 1:
                    prev_price = float(recent_prices[1].price)
                    
                    # CRITICAL FIX: Check for Zero to avoid crash
                    if prev_price != 0:
                        change = ((current_price - prev_price) / prev_price) * 100
                
                # CRITICAL FIX: JSON crashes on NaN/Infinity, so we must sanitize it
                if math.isnan(change) or math.isinf(change):
                    change = 0.0
                
                ticker_data.append({
                    "symbol": company.symbol.replace(".NS", ""),
                    "company_name": company.company_name,
                    "current_price": current_price,
                    "change_percent": abs(change),
                    "is_profit": change >= 0
                })
        except Exception as e:
            # Log error but don't crash the whole request
            print(f"Skipping {company.symbol}: {e}")
            continue
    
    return ticker_data