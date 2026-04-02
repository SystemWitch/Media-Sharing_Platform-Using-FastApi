import os
from imagekitio import ImageKit
from dotenv import load_dotenv
load_dotenv()


# ImageKit client (server-side usage)
imagekit = ImageKit(
    private_key=os.environ.get("IMAGEKIT_PRIVATE_KEY")
)

# URL endpoint stored separately (used for URL construction)
IMAGEKIT_URL_ENDPOINT = os.environ.get("IMAGEKIT_URL_ENDPOINT")

# JWT config (unchanged)
SECRET_KEY = os.environ.get("SECRET_KEY", "CHANGE_ME")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
