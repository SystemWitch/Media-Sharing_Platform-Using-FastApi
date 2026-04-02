from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    password = Column(String(128), nullable=False)

    # relationship
    media = relationship(
        "Media",
        back_populates="owner",
        cascade="all, delete-orphan"
    )


class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)

    file_url = Column(String(512), nullable=False)
    file_id = Column(String(128), nullable=False, index=True)

    file_name = Column(String(255))
    file_type = Column(String(64))
    file_size = Column(Integer)

    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # relationship
    owner = relationship("User", back_populates="media")
