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


def calculate_drip_projection(db: Session, symbol: str, start_date: date, end_date: date, initial_investment: float):
    """
    Calculate realistic dividend reinvestment projection with TRUE COMPOUND EFFECT:
    
    WITHOUT DRIP:
    - Dividends accumulate as cash (dead money)
    - Only original shares appreciate in value
    - Dividend income is linear (same shares every time)
    
    WITH DRIP (The Magic):
    - Dividends buy more shares immediately
    - New shares ALSO give dividends in future events (compound effect)
    - More shares = higher capital gains from price appreciation
    - Exponential growth: shares → dividends → more shares → more dividends
    
    Returns timeline data and final comparison statistics.
    """
    company = db.query(models.Company).filter(models.Company.symbol == symbol.upper()).first()
    if not company:
        return None
    
    # Get all stock prices in date range
    stock_prices = db.query(models.StockPrice).filter(
        models.StockPrice.company_id == company.id,
        models.StockPrice.date.between(start_date, end_date)
    ).order_by(models.StockPrice.date).all()
    
    if not stock_prices:
        return None
    
    # Get all dividend actions in date range
    dividends = db.query(models.CorporateAction).filter(
        models.CorporateAction.company_id == company.id,
        models.CorporateAction.action_type == models.ActionType.DIVIDEND,
        models.CorporateAction.date.between(start_date, end_date)
    ).order_by(models.CorporateAction.date).all()
    
    # Initialize tracking variables
    initial_price = float(stock_prices[0].price)
    initial_shares = initial_investment / initial_price
    
    # WITHOUT DRIP: Fixed shares, cash accumulates
    shares_without_drip = initial_shares
    cash_without_drip = 0.0
    
    # WITH DRIP: Shares grow over time, reinvesting creates compound effect
    shares_with_drip = initial_shares
    total_shares_from_dividends = 0.0
    
    # Timeline for charting
    timeline = []
    
    # Create a map of dates to dividends for efficient lookup
    dividend_map = {}
    for div in dividends:
        div_value = float(div.details.get('value', 0)) if div.details else 0
        dividend_map[div.date] = div_value
    
    # Process each day in the timeline
    for price_record in stock_prices:
        current_date = price_record.date
        current_price = float(price_record.price)
        
        # Check if there's a dividend declared on this date
        if current_date in dividend_map:
            dividend_per_share = dividend_map[current_date]
            
            # === WITHOUT DRIP ===
            # Always the same number of shares, so dividend is linear
            dividend_received_without = shares_without_drip * dividend_per_share
            cash_without_drip += dividend_received_without
            
            # === WITH DRIP (THE MAGIC) ===
            # THIS TIME: More shares = MORE dividend than last time
            # Because shares bought from previous dividends ALSO pay dividends now
            dividend_received_with = shares_with_drip * dividend_per_share
            
            # Buy MORE shares with this dividend
            additional_shares = dividend_received_with / current_price
            total_shares_from_dividends += additional_shares
            shares_with_drip += additional_shares
            
            # NEXT TIME a dividend comes, these new shares will ALSO generate dividends
            # This creates the exponential compound effect
        
        # Calculate portfolio values at current price
        # WITHOUT DRIP: Only original shares benefit from price gains
        value_without_drip = (shares_without_drip * current_price) + cash_without_drip
        
        # WITH DRIP: ALL accumulated shares benefit from price gains
        # This includes shares bought with dividends, which also appreciate
        value_with_drip = shares_with_drip * current_price
        
        # Record timeline point
        timeline.append({
            'date': current_date,
            'without_drip': round(value_without_drip, 2),
            'with_drip': round(value_with_drip, 2),
            'shares_owned': round(shares_with_drip, 4),
            'total_dividends_received': round(cash_without_drip, 2)
        })
    
    # === FINAL CALCULATIONS ===
    final_price = float(stock_prices[-1].price)
    
    # Without DRIP: Original shares at final price + accumulated cash
    final_value_without_drip = (shares_without_drip * final_price) + cash_without_drip
    
    # With DRIP: ALL shares (original + dividend-bought) at final price
    # The dividend-bought shares have ALSO appreciated from their purchase price
    final_value_with_drip = shares_with_drip * final_price
    
    # Calculate returns
    gain_without_drip_percent = ((final_value_without_drip - initial_investment) / initial_investment) * 100
    gain_with_drip_percent = ((final_value_with_drip - initial_investment) / initial_investment) * 100
    drip_advantage_percent = gain_with_drip_percent - gain_without_drip_percent
    
    # Calculate how much extra wealth was created by DRIP
    extra_wealth_from_drip = final_value_with_drip - final_value_without_drip
    
    return {
        'symbol': company.symbol,
        'company_name': company.company_name,
        'initial_investment': initial_investment,
        'start_date': start_date,
        'end_date': end_date,
        
        # Final values
        'final_value_without_drip': round(final_value_without_drip, 2),
        'final_value_with_drip': round(final_value_with_drip, 2),
        'extra_wealth_from_drip': round(extra_wealth_from_drip, 2),
        
        # Dividend statistics (same amount, used differently)
        'total_dividends_received': round(cash_without_drip, 2),
        'total_dividends_reinvested': round(cash_without_drip, 2),  # Same as without DRIP
        
        # Share accumulation
        'total_shares_without_drip': round(shares_without_drip, 4),
        'total_shares_with_drip': round(shares_with_drip, 4),
        'shares_from_dividends': round(total_shares_from_dividends, 4),
        
        # Returns
        'gain_without_drip_percent': round(gain_without_drip_percent, 2),
        'gain_with_drip_percent': round(gain_with_drip_percent, 2),
        'drip_advantage_percent': round(drip_advantage_percent, 2),
        
        # Timeline for charting
        'timeline': timeline
    }