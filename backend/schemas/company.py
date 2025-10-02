from pydantic import BaseModel
from typing import List


class TimelineEventBase(BaseModel):
    year: int
    event: str
    revenue: float
    net_profit: float
    stock_price: float


class TimelineEvent(TimelineEventBase):
    id: int
    company_id: int

    class Config:
        from_attributes = True


class CompanyBase(BaseModel):
    name: str
    symbol: str
    five_year_cagr: float


class Company(CompanyBase):
    id: int
    timeline_events: List[TimelineEvent] = []

    class Config:
        from_attributes = True


class CompanyList(CompanyBase):
    id: int

    class Config:
        from_attributes = True


class WealthProjection(BaseModel):
    initial_capital: float
    company_name: str
    cagr: float
    projection_10_years: float
    projection_20_years: float
