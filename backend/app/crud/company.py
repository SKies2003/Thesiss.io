from sqlalchemy.orm import Session
from datetime import date
from app.database import models

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