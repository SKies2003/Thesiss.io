import os
import sys
from datetime import datetime, timedelta
import pandas as pd
import yfinance as yf
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env file BEFORE any imports that need them
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)

# Add the project root to the Python path to allow for absolute imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.models import Base, MarketIndex, HourlyIndexPrice
password = os.getenv("DATABASE_PASSWORD")
if not password:
    raise ValueError("DATABASE_PASSWORD environment variable not set.")

# --- Database Connection ---
DATABASE_URL = f"postgresql://postgres:{password}@localhost:5432/Python"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def safe_float_conversion(value):
    """Safely convert a value to float, handling pandas scalars and None values."""
    if value is None or pd.isna(value):
        return None
    try:
        if isinstance(value, (int, float)):
            return float(value)
        elif isinstance(value, str):
            return float(value)
        else:
            # Handle pandas scalars
            return float(value.item()) if hasattr(value, 'item') else float(value)
    except (ValueError, TypeError, AttributeError):
        return None

def populate_market_data():
    """
    Main function to populate market indices with hourly price data for the latest available day.
    Clears previous data and fetches fresh hourly data.
    """
    session = SessionLocal()

    try:
        # --- Read indices from CSV ---
        print("Reading market indices from indices.csv...")
        csv_path = os.path.join(os.path.dirname(__file__), "indices.csv")
        df = pd.read_csv(csv_path)
        
        print(f"Found {len(df)} market indices.")
        
        # --- Clear existing hourly price data ---
        print("\nClearing previous hourly index price data...")
        session.query(HourlyIndexPrice).delete()
        session.commit()
        print("Previous hourly data cleared.")
        
        # --- Ensure all indices exist in market_indices table ---
        print("\nEnsuring all indices exist in market_indices table...")
        for _, row in df.iterrows():
            existing_index = session.query(MarketIndex).filter_by(symbol=row['Yahoo Finance Symbol']).first()
            if not existing_index:
                new_index = MarketIndex(
                    name=row['Name'],
                    symbol=row['Yahoo Finance Symbol'],
                    industry=row.get('Industry')
                )
                session.add(new_index)
                print(f"Added new index: {row['Name']} ({row['Yahoo Finance Symbol']})")
        session.commit()
        print("Market indices table updated.")
        
        # --- Fetch and insert hourly data for each index ---
        print("\n--- Fetching hourly data for latest available day ---")
        
        # Calculate date range for the latest day (last 7 days to ensure we get data)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        for _, row in df.iterrows():
            symbol = row['Yahoo Finance Symbol']
            index_name = row['Name']
            
            # Get the index from database
            market_index = session.query(MarketIndex).filter_by(symbol=symbol).first()
            if not market_index:
                print(f"Could not find index {symbol} in DB, skipping.")
                continue
            
            print(f"\nProcessing {index_name} ({symbol})...")
            
            try:
                # Fetch hourly data (1h interval)
                print(f"Fetching hourly data for {symbol}...")
                hourly_data = yf.download(
                    symbol, 
                    start=start_date, 
                    end=end_date, 
                    interval='1h',
                    auto_adjust=True, 
                    progress=False
                )
                
                if isinstance(hourly_data, pd.DataFrame) and len(hourly_data) > 0:
                    # Handle MultiIndex columns (single ticker)
                    if isinstance(hourly_data.columns, pd.MultiIndex):
                        hourly_data.columns = [col[0] for col in hourly_data.columns]
                    
                    # Check if Close column exists
                    if 'Close' in hourly_data.columns:
                        # Get only the latest day's data
                        if len(hourly_data) > 0:
                            latest_date = hourly_data.index.max().date()
                            latest_day_data = hourly_data[hourly_data.index.date == latest_date]
                            
                            print(f"Found {len(latest_day_data)} hourly records for {latest_date}")
                            
                            # Insert hourly prices
                            for idx in latest_day_data.index:
                                price_val = latest_day_data.loc[idx, 'Close']
                                converted_price = safe_float_conversion(price_val)
                                
                                if converted_price is not None:
                                    hourly_price = HourlyIndexPrice(
                                        index_id=market_index.id,
                                        datetime=idx.to_pydatetime(),
                                        price=converted_price
                                    )
                                    session.add(hourly_price)
                            
                            session.commit()
                            print(f"Successfully added hourly data for {symbol}")
                        else:
                            print(f"No data available for {symbol}")
                    else:
                        print(f"No Close column found for {symbol}")
                else:
                    print(f"No valid hourly data found for {symbol}")
                    
            except Exception as e:
                print(f"!!! Error processing {symbol}: {e} !!!")
                session.rollback()
                continue
        
        print("\n--- Market data population complete ---")
        
        # Print summary
        total_indices = session.query(MarketIndex).count()
        total_hourly_prices = session.query(HourlyIndexPrice).count()
        print(f"\nSummary:")
        print(f"Total market indices: {total_indices}")
        print(f"Total hourly price records: {total_hourly_prices}")
        
    except Exception as e:
        print(f"\nA critical error occurred: {e}")
        session.rollback()
    finally:
        session.close()
        print("\nDatabase population process finished.")

if __name__ == "__main__":
    # Ensure tables exist
    print("Ensuring market tables exist...")
    Base.metadata.create_all(bind=engine)
    print("Tables ready.")
    
    populate_market_data()
