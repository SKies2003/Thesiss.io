from .database import Base
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Enum, Float, BigInteger
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class PeriodType(enum.Enum):
    QUARTERLY = "QUARTERLY"
    ANNUAL = "ANNUAL"

class ActionType(enum.Enum):
    DIVIDEND = "DIVIDEND"
    SPLIT = "SPLIT"
    ANNOUNCEMENT = "ANNOUNCEMENT"

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True)
    company_name = Column(String(255), nullable=False)
    symbol = Column(String(20), unique=True, nullable=False, index=True)
    industry = Column(String(100))
    
    stock_prices = relationship("StockPrice", back_populates="company", cascade="all, delete-orphan")
    financials = relationship("FinancialReport", back_populates="company", cascade="all, delete-orphan")
    corporate_actions = relationship("CorporateAction", back_populates="company", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Company(symbol='{self.symbol}')>"


class StockPrice(Base):
    __tablename__ = "stock_prices"
    
    date = Column(Date, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), primary_key=True)
    price = Column(Float, nullable=False)
    
    company = relationship("Company", back_populates="stock_prices")

    def __repr__(self):
        return f"<StockPrice(symbol='{self.company.symbol}', date='{self.date}', price='{self.price}')>"

class FinancialReport(Base):
    __tablename__ = "financial_reports"
    
    date = Column(Date, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), primary_key=True)
    period_type = Column(Enum(PeriodType), primary_key=True)
    
    total_revenue = Column(Float)
    net_income = Column(Float)
    
    company = relationship("Company", back_populates="financials")

    def __repr__(self):
        return f"<FinancialReport(symbol='{self.company.symbol}', date='{self.date}', type='{self.period_type.name}')>"

class CorporateAction(Base):
    __tablename__ = "corporate_actions"
    
    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False, index=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    action_type = Column(Enum(ActionType), nullable=False)
    details = Column(JSONB)
    
    company = relationship("Company", back_populates="corporate_actions")


class MarketIndex(Base):
    __tablename__ = "market_indices"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    symbol = Column(String(50), unique=True, nullable=False, index=True)
    industry = Column(String(100))
    
    hourly_prices = relationship("HourlyIndexPrice", back_populates="index", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MarketIndex(symbol='{self.symbol}', name='{self.name}')>"


class HourlyIndexPrice(Base):
    __tablename__ = "hourly_index_prices"
    
    id = Column(Integer, primary_key=True)
    index_id = Column(Integer, ForeignKey('market_indices.id'), nullable=False)
    datetime = Column(DateTime, nullable=False, index=True)
    price = Column(Float, nullable=False)
    
    index = relationship("MarketIndex", back_populates="hourly_prices")

    def __repr__(self):
        return f"<HourlyIndexPrice(symbol='{self.index.symbol}', datetime='{self.datetime}', price='{self.price}')>"