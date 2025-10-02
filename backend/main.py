from fastapi import FastAPI
from database.database import engine, SessionLocal
from database import models
from crud.company import populate_database
from api.router import api_router

# Create all database tables
models.Base.metadata.create_all(bind=engine)

# Create a FastAPI instance
app = FastAPI(
    title="Thesis.io API",
    description="Backend services for the Thesis.io Investor Persuader.",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup():
    # Populate the database with initial data from data.json
    db = SessionLocal()
    populate_database(db)
    db.close()


# Include the main API router
app.include_router(api_router)


@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Thesis.io API"}
