import json
import os
import base64
from PIL import Image
from io import BytesIO

USERS_FILE = "users.json"

def load_users():
    """Load user data from JSON file."""
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_user(user):
    """Save new user data to JSON file."""
    users = load_users()
    users.append(user)
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

def create_image_directory(username):
    """Create directory for user's images if it doesn't exist."""
    image_dir = os.path.join("image_history", username)
    if not os.path.exists(image_dir):
        os.makedirs(image_dir)
    return image_dir

def save_image(username: str, image_data: str):
    """Saves a base64 encoded image to the user's directory."""
    try:
        image_dir = create_image_directory(username)
        # Remove header and decode base64 image data
        image = Image.open(BytesIO(base64.b64decode(image_data.split(',')[1])))

        # Generate unique filename using timestamp
        image_id = str(len(os.listdir(image_dir)) + 1).zfill(4)  # Zero-pad the image ID
        file_path = os.path.join(image_dir, f"{image_id}.jpeg")

        # Save image in JPEG format
        image.save(file_path, "JPEG")

        return file_path
    except Exception as e:
        print(f"Error saving image: {e}")
        return None 