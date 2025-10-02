from sqlalchemy.orm import Session
from database import models
from schemas import company as company_schema
import json


def create_company(db: Session, company: company_schema.CompanyBase):
    db_company = models.Company(
        name=company.name, symbol=company.symbol, five_year_cagr=company.five_year_cagr
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


def create_timeline_event(
    db: Session, event: company_schema.TimelineEventBase, company_id: int
):
    db_event = models.TimelineEvent(**event.model_dump(), company_id=company_id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def get_company(db: Session, company_id: int):
    return db.query(models.Company).filter(models.Company.id == company_id).first()


def get_companies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Company).offset(skip).limit(limit).all()


def populate_database(db: Session):
    # Check if data already exists to prevent duplicates
    if db.query(models.Company).first():
        return

    with open("data.json", "r") as f:
        companies_data = json.load(f)

    for company_data in companies_data:
        company_to_create = company_schema.CompanyBase(
            name=company_data["name"],
            symbol=company_data["symbol"],
            five_year_cagr=company_data["five_year_cagr"],
        )
        db_company = create_company(db, company_to_create)

        for event_data in company_data["timeline"]:
            event_to_create = company_schema.TimelineEventBase(
                year=event_data["year"],
                event=event_data["event"],
                revenue=event_data["revenue"],
                net_profit=event_data["net_profit"],
                stock_price=event_data["stock_price"],
            )
            create_timeline_event(db, event_to_create, db_company.id)
