from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client.skillup

# Models for Request
class PathRequest(BaseModel):
    goal: str
    level: Optional[str] = "beginner"
    knownSkills: Optional[List[str]] = []

def score_course(course: dict, goal: str, level: str, known_skills: List[str]) -> int:
    score = 0
    goal_lower = goal.lower()
    domain_lower = course.get("domain", "").lower()
    title_lower = course.get("title", "").lower()
    course_skills = [s.lower() for s in course.get("skills", [])]
    known_lower = [s.lower().strip() for s in known_skills]

    # ===== Domain relevance (REQUIRED to proceed) =====
    domain_match = False

    # Exact domain match (+5)
    if goal_lower in domain_lower or domain_lower in goal_lower:
        if domain_lower: # avoid empty string matches
            score += 5
            domain_match = True

    # Keyword overlap in domain or title (+3)
    goal_words = [w for w in goal_lower.split() if len(w) > 2]
    for word in goal_words:
        if word in domain_lower or word in title_lower:
            score += 3
            domain_match = True
            break

    # Skill tag overlap with goal keywords (+2)
    if not domain_match:
        for word in goal_words:
            if any(word in s or s in word for s in course_skills):
                score += 2
                domain_match = True
                break

    # If the course has ZERO domain relevance, return 0 immediately
    if not domain_match:
        return 0

    # ===== Level bonus (+3) =====
    course_level = course.get("level", course.get("difficulty", "")).lower()
    if course_level == (level or "").lower():
        score += 3

    # ===== Skill gap bonus: +2 for each skill user does NOT know =====
    for skill in course_skills:
        if not any(k in skill or skill in k for k in known_lower):
            score += 2

    # ===== Penalty: -3 for each skill user already knows =====
    for skill in course_skills:
        if any(k in skill or skill in k for k in known_lower):
            score -= 3

    return max(0, score)

LEVEL_ORDER = { 'beginner': 0, 'intermediate': 1, 'advanced': 2 }

def get_level_order(course: dict) -> int:
    lvl = course.get("level", course.get("difficulty", "beginner")).lower()
    return LEVEL_ORDER.get(lvl, 1)

@app.post("/generate-path")
async def generate_path(request: PathRequest):
    goal = request.goal
    level = request.level
    known_skills = request.knownSkills

    if not goal or len(goal.strip()) == 0:
        raise HTTPException(status_code=400, detail="Please provide a learning goal.")

    # Fetch all courses from MongoDB
    all_courses_cursor = db.courses.find({})
    all_courses = await all_courses_cursor.to_list(length=1000)

    # Clean ObjectIds to strings
    for course in all_courses:
        course["_id"] = str(course["_id"])

    scored = []
    for course in all_courses:
        scored.append({
            "course": course,
            "score": score_course(course, goal, level, known_skills)
        })

    # Filter: only domain-relevant courses (score >= 3)
    relevant = [s for s in scored if s["score"] >= 3]
    
    # Sort
    def sort_key(item):
        lvl_order = get_level_order(item["course"])
        score = item["score"]
        # In Node: levelDiff = a - b, so we sort by levelOrder asc, then score desc.
        return (lvl_order, -score)
    
    relevant.sort(key=sort_key)

    if len(relevant) < 2:
        return {
            "message": 'Not enough resources available for this topic. Please try a broader engineering domain like "Frontend Development", "Data Science", "Machine Learning", "Cybersecurity", "Backend Development", "Cloud Computing", or "UI/UX Design".',
            "path": None
        }

    foundation = []
    intermediate = []
    advanced = []

    for item in relevant:
        course = item["course"]
        lvl = get_level_order(course)
        if lvl == 0:
            foundation.append(course["_id"])
        elif lvl == 1:
            intermediate.append(course["_id"])
        else:
            advanced.append(course["_id"])

    stages = []
    if foundation:
        stages.append({"stageName": "Foundation", "courses": foundation})
    if intermediate:
        stages.append({"stageName": "Core Skills", "courses": intermediate})
    if advanced:
        stages.append({"stageName": "Advanced Topics", "courses": advanced})

    path_title = f"{goal} Learning Path"
    path_description = f"Personalized {goal} roadmap generated for {level or 'all'} level."
    
    # For a standalone demo without auth, we simulate a user ID or skip saving to DB.
    # To mimic exactly, we could save it, but we lack `req.user._id`.
    # We will just return the built payload.
    
    # Let's mock a user ID for saving.
    mock_user_id = "test_user_id"
    
    existing_path = await db.learningpaths.find_one({"user": mock_user_id})
    relevant_ids = [r["course"]["_id"] for r in relevant]

    path_doc = {
        "user": mock_user_id,
        "title": path_title,
        "description": path_description,
        "goal": goal,
        "level": level,
        "knownSkills": known_skills,
        "stages": stages,
        "courses": relevant_ids
    }

    if existing_path:
        await db.learningpaths.update_one({"_id": existing_path["_id"]}, {"$set": path_doc})
        path_id = existing_path["_id"]
    else:
        result = await db.learningpaths.insert_one(path_doc)
        path_id = result.inserted_id

    # Populate to match Node.js exactly
    populated_stages = []
    for stage in stages:
        populated_stage_courses = []
        for c_id in stage["courses"]:
            c = next((r["course"] for r in relevant if r["course"]["_id"] == c_id), None)
            if c:
                populated_stage_courses.append(c)
        populated_stages.append({
            "stageName": stage["stageName"],
            "courses": populated_stage_courses
        })
    
    populated_path = {
        "_id": str(path_id),
        "user": mock_user_id,
        "title": path_title,
        "description": path_description,
        "goal": goal,
        "level": level,
        "knownSkills": known_skills,
        "stages": populated_stages,
        "courses": [r["course"] for r in relevant]
    }

    return {"message": "Path generated successfully!", "path": populated_path}
