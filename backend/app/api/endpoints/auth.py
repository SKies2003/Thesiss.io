from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated

from app.database import models
from app.schemas import user as user_schema
from app.core.security import get_password_hash, verify_password, create_access_token
from .dependencies import get_db, get_current_user

router = APIRouter()

@router.post(
    "/register", response_model=user_schema.UserWithToken, status_code=status.HTTP_201_CREATED
)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token for the newly registered user
    access_token = create_access_token(data={"sub": db_user.email, "id": db_user.id})
    
    return {
        "user": db_user,
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/token", response_model=user_schema.Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=user_schema.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user