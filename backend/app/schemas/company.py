from pydantic import BaseModel, Field, field_validator
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

class CompanyList(BaseModel):
    id: int
    company_name: str
    symbol: str
    industry: Optional[str] = None

    class Config:
        from_attributes = True

# --- ADD THIS NEW SCHEMA ---
class CompanyTicker(BaseModel):
    symbol: str
    company_name: str
    current_price: float
    change_percent: float
    is_profit: bool

    class Config:
        from_attributes = True

# --- DRIP Simulation Schemas ---
class DRIPProjectionRequest(BaseModel):
    symbol: str = Field(
        default="RELIANCE.NS",
        description="Company ticker symbol (e.g., RELIANCE.NS, TCS.NS)",
        examples=["RELIANCE.NS", "TCS.NS", "INFY.NS"]
    )
    start_date: date = Field(
        default=date(2020, 1, 1),
        description="Start date for simulation (YYYY-MM-DD)",
        examples=["2020-01-01"]
    )
    end_date: date = Field(
        default=date(2025, 11, 25),
        description="End date for simulation (YYYY-MM-DD)",
        examples=["2025-11-25"]
    )
    initial_investment: float = Field(
        default=100000.0,
        gt=0,
        description="Initial investment amount in rupees (must be > 0)",
        examples=[100000, 500000, 1000000]
    )
    
    @field_validator('symbol')
    @classmethod
    def validate_symbol(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Symbol cannot be empty')
        return v.strip().upper()
    
    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v: date, info) -> date:
        if 'start_date' in info.data and v < info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "symbol": "RELIANCE.NS",
                "start_date": "2020-01-01",
                "end_date": "2025-11-25",
                "initial_investment": 100000
            }
        }

class DRIPDataPoint(BaseModel):
    date: date
    without_drip: float
    with_drip: float
    shares_owned: float
    total_dividends_received: float

class DRIPProjectionResponse(BaseModel):
    symbol: str
    company_name: str
    initial_investment: float
    start_date: date
    end_date: date
    
    # Final portfolio values
    final_value_without_drip: float
    final_value_with_drip: float
    extra_wealth_from_drip: float
    
    # Dividend statistics
    total_dividends_received: float
    total_dividends_reinvested: float
    
    # Share accumulation details
    total_shares_without_drip: float
    total_shares_with_drip: float
    shares_from_dividends: float
    
    # Performance metrics
    gain_without_drip_percent: float
    gain_with_drip_percent: float
    drip_advantage_percent: float
    
    # Time series data for chart
    timeline: List[DRIPDataPoint]