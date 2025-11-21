from sqlmodel import Session, create_engine

sqlite_url = "sqlite:///database.db"

engine = create_engine(sqlite_url)

def get_db():
    with Session(engine) as session:
        yield session