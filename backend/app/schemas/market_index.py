from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class HourlyPriceData(BaseModel):
    datetime: datetime
    price: float

    class Config:
        from_attributes = True


class MarketIndexList(BaseModel):
    id: int
    name: str
    symbol: str
    industry: Optional[str] = None

    class Config:
        from_attributes = True


class MarketIndexDetail(BaseModel):
    id: int
    name: str
    symbol: str
    industry: Optional[str] = None
    hourly_prices: List[HourlyPriceData] = []

    class Config:
        from_attributes = True


class MarketIndexLatestPrice(BaseModel):
    id: int
    name: str
    symbol: str
    industry: Optional[str] = None
    latest_price: Optional[float] = None
    latest_datetime: Optional[datetime] = None

    class Config:
        from_attributes = True
