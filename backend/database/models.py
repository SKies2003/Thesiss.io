from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    symbol = Column(String, unique=True, index=True)
    five_year_cagr = Column(Float)

    timeline_events = relationship("TimelineEvent", back_populates="company")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, index=True)
    event = Column(String)
    revenue = Column(Float)
    net_profit = Column(Float)
    stock_price = Column(Float)
    company_id = Column(Integer, ForeignKey("companies.id"))

    company = relationship("Company", back_populates="timeline_events")
