# AI Resume Builder

An AI Resume Builder built with FastAPI and a lightweight responsive frontend.

## What the UI does

- Guided AI resume interview
- Live profile completion indicator
- Contact, experience, education, skills, projects and certification tracking
- ATS resume generation when the backend marks the interview as complete
- Resume preview modal
- Markdown resume download
- Persistent anonymous browser `user_id` using localStorage

## Run

1. Create/activate a Python virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Make sure your `.env` contains the existing OpenAI and MySQL settings expected by `config/settings.py`.
4. Start FastAPI from the project root:

```bash
uvicorn app:app --reload
```

5. Open:

```text
http://127.0.0.1:8000/
```

The frontend is served directly by FastAPI, so no separate frontend server is required.

## Backend note

The current authentication controller exists in the repository but is not included in `app.py`, and its methods are placeholders. The UI intentionally focuses on the working resume-interview flow rather than presenting non-functional login screens.
