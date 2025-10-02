from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from crud import company as company_crud
from schemas import company as company_schema
from .dependencies import get_db, get_current_user

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("/", response_model=List[company_schema.CompanyList])
def read_companies(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    companies = company_crud.get_companies(db, skip=skip, limit=limit)
    return companies


@router.get("/{company_id}", response_model=company_schema.Company)
def read_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_company = company_crud.get_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company


@router.post("/project-wealth", response_model=company_schema.WealthProjection)
def project_wealth(
    starting_capital: float,
    company_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_company = company_crud.get_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")

    cagr = db_company.five_year_cagr

    # Formula for compound interest: A = P(1 + r)^t
    projection_10 = starting_capital * ((1 + cagr) ** 10)
    projection_20 = starting_capital * ((1 + cagr) ** 20)

    return {
        "initial_capital": starting_capital,
        "company_name": db_company.name,
        "cagr": cagr,
        "projection_10_years": round(projection_10, 2),
        "projection_20_years": round(projection_20, 2),
    }
