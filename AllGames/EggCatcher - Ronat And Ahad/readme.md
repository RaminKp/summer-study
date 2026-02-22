# Egg Catcher Game

Welcome to **Egg Catcher**, a Django-based game for children ages 7–13. This game offers multiple modes to enhance reflexes, math skills, and spelling abilities. It also provides performance metrics that can be used for educational analysis.

---

## Introduction

- **Technologies**: Django (Python framework), HTML/CSS/JavaScript
- **Purpose**: Improve hand-eye coordination, mental math, and spelling through fun mini-games.
- **requirements.txt**: All Python dependencies are listed in a `requirements.txt` file. Ensure you install them before running the project.

---

## Installation and Setup

1. **Clone or Download** the repository.
2. **Create a Virtual Environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

# Install Dependencies using the provided requirements.txt
```
pip install -r requirements.txt

```
# Game Modes and URLs

Below are the core endpoints for the Egg Catcher game:

1. **Home Page**  
   - **URL**: `/`  
   - **Description**: Provides an overview and links to all game modes.

2. **Reflex Mode**  
   - **URL**: `/play`  
   - **Description**: Test your reaction speed by catching falling eggs.

3. **Math Mode**  
   - **URL**: `/math`  
   - **Description**: Practice arithmetic by catching the correct answer.

4. **Word Mode**  
   - **URL**: `/word`  
   - **Description**: Learn spelling by catching letters to form the target word.

5. **Rules/How to Play**  
   - **URL**: `/rules`  
   - **Description**: View detailed instructions for each mode and general gameplay tips.
