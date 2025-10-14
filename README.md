# Thesiss.io

Thesiss.io, a next-generation investment intelligence platform designed for the Indian equities market. The platform's core mission is to shift retail participants from high-risk, speculative trading towards disciplined, long-term, thesis-driven investing.

## Setup Instructions

### Clone the repository

```bash
git clone https://github.com/SKies2003/Thesiss.io.git
cd Thesiss.io/backend
```

### Create virtual environment

```bash
python -m venv venv
```

### Activate virtual environment

#### On Windows Powershell

```powershell
venv\Scripts\Activate.ps1
```

#### On Mac/Linux

```bash
source venv/bin/activate
```

### Install Dependencies

```python
pip install -r requirements.txt
```

### Run the Application

```bash
uvicorn app.main:app --reload
```

### Test the API

Visit: <http://localhost:8000/docs> for interactive API documentation

API Endpoints Available:

1. Authentication Endpoints

- POST /auth/register - Create User
- POST /auth/token - Login for access token
- Use Authorize button to get authenticated (mandatory to use other functionality)

2. Companies Endpoints

- GET /companies/list - List All Companies
- GET /companies/{symbol} - Get specific companies data and details (eg. Enter - "reliance.ns", 2025-01-01, 2025-10-01)
