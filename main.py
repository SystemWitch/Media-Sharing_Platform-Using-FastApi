# ---------- main.py ----------
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from database import Base, engine
from models import User, Media
from schemas import UserCreate, Token
from auth import hash_password, verify_password, create_access_token
from dependencies import get_db, get_current_user
from config import imagekit
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import Column, Integer, String, ForeignKey, select
from fastapi.concurrency import run_in_threadpool
from config import imagekit, IMAGEKIT_URL_ENDPOINT
from fastapi import Body




app = FastAPI(title="Async Media Sharing Platform")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from fastapi import Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/media", response_class=HTMLResponse)
async def media_page(request: Request):
    return templates.TemplateResponse("media.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/upload", response_class=HTMLResponse)
async def upload_page(request: Request):
    return templates.TemplateResponse("upload.html", {"request": request})

@app.get("/", response_class=HTMLResponse)
async def home_page(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ------------------------------------------------------------------
# ROUTES
# ------------------------------------------------------------------


@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    username: str = Body(...),
    password: str = Body(...),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.username == username)
    )

    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(
        username=username,
        password=hash_password(password)
    )

    db.add(user)
    await db.commit()

    return {"message": "User registered successfully"}



@app.post("/login")
async def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.username == form.username)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(form.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    file_bytes = await file.read()

    upload_result = await run_in_threadpool(
        imagekit.files.upload,
        file=file_bytes,
        file_name=file.filename
    )

    file_url = f"{IMAGEKIT_URL_ENDPOINT}/{upload_result.file_path}"

    media = Media(
        file_id=upload_result.file_id,
        file_url=file_url,
        file_name=upload_result.name,
        file_type=upload_result.file_type,
        file_size=upload_result.size,
        width=getattr(upload_result, "width", None),
        height=getattr(upload_result, "height", None),
        user_id=current_user.id
    )

    db.add(media)
    await db.commit()

    return {
        "file_url": file_url,
        "metadata": {
            "file_id": media.file_id,
            "file_name": media.file_name,
            "file_type": media.file_type,
            "file_size": media.file_size,
            "width": media.width,
            "height": media.height
        }
    }


@app.get("/api/media")
async def list_media(
    current_user: User = Depends(get_current_user),   # ← add this
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Media).where(Media.user_id == current_user.id)   # ← filter by current user only
    )
    return result.scalars().all()

@app.get("/api/public-media")
async def list_public_media(db: AsyncSession = Depends(get_db)):
    # Join with User to get username
    stmt = (
        select(
            Media.id,
            Media.file_url,
            Media.file_name,
            Media.file_type,
            Media.file_size,
            Media.width,
            Media.height,
            User.username.label("uploader_username")  # ← key addition
        )
        .join(User, Media.user_id == User.id)
        .order_by(Media.id.desc())  # newest first, optional
    )
    
    result = await db.execute(stmt)
    rows = result.mappings().all()  # returns list of dicts
    
    # Convert to list of dicts for JSON
    return [dict(row) for row in rows]


@app.delete("/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    media_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch media
    result = await db.execute(
        select(Media).where(Media.id == media_id)
    )
    media = result.scalar_one_or_none()

    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Ownership check (matches your model)
    if media.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Delete from ImageKit (CORRECT SIGNATURE)
    try:
        imagekit.files.delete(media.file_id)
        print("deleted successfully")
    except Exception as e:
        print("ImageKit delete error:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to delete file from ImageKit"
        )

    # Delete metadata from DB
    await db.delete(media)
    await db.commit()

    return

