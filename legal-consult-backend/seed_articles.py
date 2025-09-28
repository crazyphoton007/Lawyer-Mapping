import os
import uuid
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import Base
from app import models

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set.")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

def ensure_tables():
    Base.metadata.create_all(bind=engine)

def seed():
    entries = [
        {
            "title": "State vs. Sharma — 2015",
            "year": 2015,
            "court": "High Court of Delhi",
            "summary": "Landmark judgment clarifying mens rea standards for aggravated assault; the court held that recklessness + knowledge are distinct factors and must be proved separately.",
            "full_text": "In this appeal the court considered... the requirement that mens rea be established beyond reasonable doubt...",
            "tags": ["criminal-law", "mens-rea", "assault"],
        },
        {
            "title": "People v. Rao — 2018",
            "year": 2018,
            "court": "Supreme Court (sample)",
            "summary": "Discusses admissibility of electronic evidence and chain-of-custody; set requirements for forensic verification.",
            "full_text": "The court recognized evolving nature of digital evidence and emphasized certification and preservation of hashes...",
            "tags": ["evidence", "digital", "chain-of-custody"],
        },
        {
            "title": "R. vs. K. Gupta — 2020",
            "year": 2020,
            "court": "Bombay High Court",
            "summary": "On use of confessions made to third parties and admissibility under exception clauses; the ruling set out guidelines for corroborative evidence.",
            "full_text": "The evidence was evaluated in light of corroboration and reliability of witness testimony…",
            "tags": ["confession", "admissibility", "witness"],
        },
        {
            "title": "State v. Mehta — 2016",
            "year": 2016,
            "court": "Karnataka High Court",
            "summary": "Interprets statutory sentencing minimums for repeat offenders under particular penal sections; clarified remission rules.",
            "full_text": "Court reviewed prior sentencing jurisprudence and held that mitigating factors must be documented…",
            "tags": ["sentencing", "repeat-offender"],
        },
        {
            "title": "Criminal Law Review — 2019 — Search & Seizure in the Digital Age",
            "year": 2019,
            "court": "N/A (journal)",
            "summary": "Overview article on balancing privacy rights with investigative powers; recommended legislative updates for warrant scopes.",
            "full_text": "As technology evolves, warrants should specify scope, duration and access controls….",
            "tags": ["journal", "search", "privacy"],
        },
    ]

    with Session(engine) as session:
        existing_titles = {
            t for (t,) in session.execute(select(models.Article.title)).all()
        }
        for e in entries:
            if e["title"] in existing_titles:
                continue
            a = models.Article(
                title=e["title"],
                year=e["year"],
                court=e["court"],
                summary=e["summary"],
                full_text=e["full_text"],
                tags=e["tags"],
            )
            session.add(a)
        session.commit()
    print("Seed complete.")

if __name__ == "__main__":
    ensure_tables()
    seed()
