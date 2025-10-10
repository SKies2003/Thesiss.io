from fastapi import FastAPI
from app.database.database import engine
from app.database import models
from app.api.router import api_router

# Create all database tables
models.Base.metadata.create_all(bind=engine)

# Create a FastAPI instance
app = FastAPI(
    title="Thesis.io API",
    description="Backend services for the Thesis.io Investor Persuader.",
    version="2.0.0",
)

# Include the main API router
app.include_router(api_router)

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Thesis.io API"}