from pydantic import BaseModel
from datetime import date
from typing import List, Optional, Any

class StockPrice(BaseModel):
    date: date
    price: float

    class Config:
        from_attributes = True

class FinancialReport(BaseModel):
    date: date
    period_type: str
    total_revenue: Optional[float]
    net_income: Optional[float]

    class Config:
        from_attributes = True

class CorporateAction(BaseModel):
    date: date
    action_type: str
    details: Any

    class Config:
        from_attributes = True

class CompanyData(BaseModel):
    id: int
    symbol: str
    company_name: str
    industry: Optional[str]
    stock_prices: List[StockPrice] = []
    financials: List[FinancialReport] = []
    corporate_actions: List[CorporateAction] = []

    class Config:
        from_attributes = True