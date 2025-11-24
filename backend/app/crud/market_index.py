from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.models import MarketIndex, HourlyIndexPrice
from typing import List, Optional

def get_all_indices(db: Session) -> List[MarketIndex]:
    """
    Fetch all market indices from the database
    """
    return db.query(MarketIndex).order_by(MarketIndex.name).all()


def get_index_by_symbol(db: Session, symbol: str) -> Optional[MarketIndex]:
    """
    Fetch a specific market index by symbol
    """
    return db.query(MarketIndex).filter(MarketIndex.symbol == symbol).first()


def get_index_with_prices(db: Session, symbol: str) -> Optional[MarketIndex]:
    """
    Fetch a market index with all its hourly prices
    """
    return db.query(MarketIndex).filter(MarketIndex.symbol == symbol).first()


def get_indices_with_latest_prices(db: Session) -> List[dict]:
    """
    Fetch all indices with their latest price data
    """
    indices = db.query(MarketIndex).all()
    result = []
    
    for index in indices:
        latest_price_record = (
            db.query(HourlyIndexPrice)
            .filter(HourlyIndexPrice.index_id == index.id)
            .order_by(desc(HourlyIndexPrice.datetime))
            .first()
        )
        
        result.append({
            "id": index.id,
            "name": index.name,
            "symbol": index.symbol,
            "industry": index.industry,
            "latest_price": latest_price_record.price if latest_price_record else None,
            "latest_datetime": latest_price_record.datetime if latest_price_record else None
        })
    
    return result
