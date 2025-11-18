import os
import sys
from datetime import datetime, date
import pandas as pd
import yfinance as yf
import numpy as np
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the project root to the Python path to allow for absolute imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.models import (
    Base, Company, StockPrice, FinancialReport, CorporateAction, PeriodType, ActionType
)

# Load environment variables from .env file
load_dotenv()
password = os.getenv("DATABASE_PASSWORD")
if not password:
    raise ValueError("DATABASE_PASSWORD environment variable not set.")

# --- Database Connection ---
DATABASE_URL = f"postgresql://postgres:{password}@localhost:5433/Python"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def safe_float_conversion(value):
    """Safely convert a value to float, handling pandas scalars and None values."""
    if value is None or pd.isna(value):
        return None
    try:
        if isinstance(value, (int, float, np.number)):
            return float(value)
        elif isinstance(value, str):
            return float(value)
        else:
            # Handle pandas scalars
            return float(value.item()) if hasattr(value, 'item') else float(value)
    except (ValueError, TypeError, AttributeError):
        return None

def safe_date_conversion(date_obj):
    """Safely convert various date formats to a date object."""
    if date_obj is None:
        return None
    
    try:
        if isinstance(date_obj, date):
            return date_obj
        elif hasattr(date_obj, 'date'):
            return date_obj.date()
        else:
            # Try to convert using pandas
            return pd.Timestamp(date_obj).date()
    except (ValueError, TypeError, AttributeError):
        return None

def populate_database():
    """
    Main function to clear and populate the database with fresh data.
    """
    # --- Reset Database ---
    print("Dropping and recreating all database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    session = SessionLocal()

    try:
        # --- 1. Insert Companies ---
        print("\nFetching company list from nifty100.csv...")
        csv_path = os.path.join(os.path.dirname(__file__), "nifty100.csv")
        df = pd.read_csv(csv_path)
        df['Symbol'] = df['Symbol'] + '.NS'
        df.drop(columns=['Series', 'ISIN Code'], inplace=True)
        
        print(f"Found {len(df)} companies. Inserting into 'companies' table...")
        for _, row in df.iterrows():
            company = Company(
                symbol=row['Symbol'],
                company_name=row['Company Name'],
                industry=row.get('Industry')
            )
            session.add(company)
        session.commit()
        print("Companies inserted successfully.")

        # --- 2. Fetch and Insert Data for Each Company ---
        all_symbols = [row['Symbol'] for _, row in df.iterrows()]
        
        for symbol in all_symbols:
            company = session.query(Company).filter_by(symbol=symbol).first()
            if not company:
                print(f"Could not find company {symbol} in DB, skipping.")
                continue

            print(f"\n--- Processing data for {symbol} ---")
            
            try:
                # --- Stock Prices ---
                print(f"Fetching stock prices for {symbol}...")
                end_date = datetime.now()
                start_date = datetime(2020, 1, 1)
                
                stock_data = yf.download(symbol, start=start_date, end=end_date, auto_adjust=True, progress=False)
                
                # Handle both single ticker (MultiIndex columns) and multiple tickers
                if isinstance(stock_data, pd.DataFrame) and len(stock_data) > 0:
                    # If MultiIndex columns (single ticker), flatten them
                    if isinstance(stock_data.columns, pd.MultiIndex):
                        stock_data.columns = [col[0] for col in stock_data.columns]
                    
                    # Check if Close column exists
                    if 'Close' in stock_data.columns:
                        for idx in stock_data.index:
                            price_val = stock_data.loc[idx, 'Close']
                            converted_price = safe_float_conversion(price_val)
                            converted_date = safe_date_conversion(idx)
                            
                            if converted_price is not None and converted_date is not None:
                                stock_price = StockPrice(
                                    company_id=company.id,
                                    date=converted_date,
                                    price=converted_price
                                )
                                session.add(stock_price)
                        print(f"Staged stock prices for {symbol}.")
                    else:
                        print(f"No Close column found for {symbol}.")
                else:
                    print(f"No valid stock price data found for {symbol}.")

                # --- Financials & Corporate Actions ---
                ticker = yf.Ticker(symbol)

                # Quarterly Financials
                try:
                    quarterly_financials = ticker.quarterly_financials
                    if isinstance(quarterly_financials, pd.DataFrame) and len(quarterly_financials) > 0:
                        for date_col in quarterly_financials.columns:
                            try:
                                revenue_val = quarterly_financials.loc['Total Revenue', date_col] if 'Total Revenue' in quarterly_financials.index else None
                                net_income_val = quarterly_financials.loc['Net Income', date_col] if 'Net Income' in quarterly_financials.index else None
                                
                                converted_revenue = safe_float_conversion(revenue_val)
                                converted_net_income = safe_float_conversion(net_income_val)
                                converted_date = safe_date_conversion(date_col)
                                
                                if converted_revenue is not None and converted_net_income is not None and converted_date is not None:
                                    session.add(FinancialReport(
                                        company_id=company.id, 
                                        date=converted_date, 
                                        period_type=PeriodType.QUARTERLY,
                                        total_revenue=converted_revenue, 
                                        net_income=converted_net_income
                                    ))
                            except Exception as e:
                                print(f"Error processing quarterly financial data for {symbol} on {date_col}: {e}")
                                continue
                except Exception as e:
                    print(f"Error fetching quarterly financials for {symbol}: {e}")
                
                # Annual Financials
                try:
                    annual_financials = ticker.financials
                    if isinstance(annual_financials, pd.DataFrame) and len(annual_financials) > 0:
                        for date_col in annual_financials.columns:
                            try:
                                revenue_val = annual_financials.loc['Total Revenue', date_col] if 'Total Revenue' in annual_financials.index else None
                                net_income_val = annual_financials.loc['Net Income', date_col] if 'Net Income' in annual_financials.index else None
                                
                                converted_revenue = safe_float_conversion(revenue_val)
                                converted_net_income = safe_float_conversion(net_income_val)
                                converted_date = safe_date_conversion(date_col)
                                
                                if converted_revenue is not None and converted_net_income is not None and converted_date is not None:
                                    session.add(FinancialReport(
                                        company_id=company.id, 
                                        date=converted_date, 
                                        period_type=PeriodType.ANNUAL,
                                        total_revenue=converted_revenue, 
                                        net_income=converted_net_income
                                    ))
                            except Exception as e:
                                print(f"Error processing annual financial data for {symbol} on {date_col}: {e}")
                                continue
                except Exception as e:
                    print(f"Error fetching annual financials for {symbol}: {e}")
                    
                print(f"Staged financial reports for {symbol}.")

                # Dividends
                try:
                    dividends = ticker.dividends
                    if isinstance(dividends, pd.Series) and len(dividends) > 0:
                        for div_date, div_value in dividends.items():
                            converted_value = safe_float_conversion(div_value)
                            converted_date = safe_date_conversion(div_date)
                            
                            if converted_value is not None and converted_date is not None:
                                session.add(CorporateAction(
                                    company_id=company.id, 
                                    date=converted_date, 
                                    action_type=ActionType.DIVIDEND,
                                    details={"value": converted_value}
                                ))
                except Exception as e:
                    print(f"Error fetching dividends for {symbol}: {e}")
                
                # Splits
                try:
                    splits = ticker.splits
                    if isinstance(splits, pd.Series) and len(splits) > 0:
                        for split_date, split_value in splits.items():
                            converted_value = safe_float_conversion(split_value)
                            converted_date = safe_date_conversion(split_date)
                            
                            if converted_value is not None and converted_date is not None:
                                session.add(CorporateAction(
                                    company_id=company.id, 
                                    date=converted_date, 
                                    action_type=ActionType.SPLIT,
                                    details={"value": converted_value}
                                ))
                except Exception as e:
                    print(f"Error fetching splits for {symbol}: {e}")
                    
                print(f"Staged corporate actions for {symbol}.")

                # Commit all the data for this one company
                session.commit()
                print(f"Successfully committed all data for {symbol}.")

            except Exception as e:
                print(f"!!! An error occurred processing {symbol}: {e} !!!")
                # Roll back changes for the failed company and continue
                session.rollback()

    except Exception as e:
        print(f"\nA critical error occurred: {e}")
        session.rollback()
    finally:
        session.close()
        print("\nDatabase population process finished.")

if __name__ == "__main__":
    populate_database()