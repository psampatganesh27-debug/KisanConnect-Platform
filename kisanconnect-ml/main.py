"""
KisanConnect ML Text-Matching Backend
FastAPI & Scikit-Learn service for rural equipment marketplace matching.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(
    title="KisanConnect ML Engine",
    description="Machine Learning text-matching for rural equipment & labor marketplace",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Pydantic Data Model
class Listing(BaseModel):
    id: Optional[int] = Field(default=None, description="Listing ID")
    type: Literal['Need', 'Have'] = Field(..., description="Type of listing: 'Need' or 'Have'")
    title: str = Field(..., description="Listing title, e.g. Mahindra Tractor 50HP")
    description: str = Field(..., description="Detailed description of equipment or service needed/provided")
    category: str = Field(..., description="Category, e.g. Tractor & Machinery, Harvesting, Labor, Irrigation")
    village: str = Field(..., description="Village or location name")

# 2. Mock Database of Listings
MOCK_DATABASE = [
    Listing(id=1001, type='Have', title='Available: Harvester', description='Wheat harvesting machine, low grain loss.', category='harvester', village='Bhimavaram'),
    Listing(id=1002, type='Need', title='Required: Harvester', description='Quick harvesting for dry fields.', category='harvester', village='Kishanpur'),
    Listing(id=1003, type='Need', title='Required: Tractor', description='Mahindra tractor ready for ploughing.', category='tractor', village='Bhimavaram'),
    Listing(id=1004, type='Need', title='Required: Harvester', description='Harvester for rent, 2 acres per hour.', category='harvester', village='Palampur'),
    Listing(id=1005, type='Need', title='Required: Tractor', description='John Deere tractor, experienced driver.', category='tractor', village='Rampur'),
    Listing(id=1006, type='Need', title='Required: Harvester', description='Heavy duty harvester available.', category='harvester', village='Rampur'),
    Listing(id=1007, type='Have', title='Available: Tractor', description='45 HP tractor available for tilling.', category='tractor', village='Madhopur'),
    Listing(id=1008, type='Need', title='Required: Sprayer', description='Backpack sprayers with labor.', category='sprayer', village='Bhimavaram'),
    Listing(id=1009, type='Need', title='Required: Seeder', description='Multi-crop planter machine.', category='seeder', village='Palampur'),
    Listing(id=1010, type='Need', title='Required: Harvester', description='Quick harvesting for dry fields.', category='harvester', village='Rampur'),
    Listing(id=1011, type='Have', title='Available: Tractor', description='John Deere tractor, experienced driver.', category='tractor', village='Sitapur'),
    Listing(id=1012, type='Have', title='Available: Sprayer', description='Motorized rig for quick spraying.', category='sprayer', village='Kishanpur'),
    Listing(id=1013, type='Have', title='Available: Seeder', description='Seed drill for wheat.', category='seeder', village='Sitapur'),
    Listing(id=1014, type='Have', title='Available: Labor', description='Skilled labor for transplanting.', category='labor', village='Sitapur'),
    Listing(id=1015, type='Need', title='Required: Seeder', description='Automatic seed planter.', category='seeder', village='Kishanpur'),
    Listing(id=1016, type='Need', title='Required: Tractor', description='Tractor for farm bed preparation.', category='tractor', village='Madhopur'),
    Listing(id=1017, type='Need', title='Required: Seeder', description='Maize seeder, tractor attached.', category='seeder', village='Rampur'),
    Listing(id=1018, type='Have', title='Available: Tractor', description='Tractor for farm bed preparation.', category='tractor', village='Bhimavaram'),
    Listing(id=1019, type='Have', title='Available: Seeder', description='Multi-crop planter machine.', category='seeder', village='Madhopur'),
    Listing(id=1020, type='Need', title='Required: Labor', description='Farm hands available for full day.', category='labor', village='Rampur'),
    Listing(id=1021, type='Need', title='Required: Tractor', description='45 HP tractor available for tilling.', category='tractor', village='Madhopur'),
    Listing(id=1022, type='Need', title='Required: Harvester', description='Wheat harvesting machine, low grain loss.', category='harvester', village='Bhimavaram'),
    Listing(id=1023, type='Have', title='Available: Seeder', description='Maize seeder, tractor attached.', category='seeder', village='Sonpur'),
    Listing(id=1024, type='Have', title='Available: Sprayer', description='Boom sprayer for large fields.', category='sprayer', village='Madhopur'),
    Listing(id=1025, type='Have', title='Available: Tractor', description='Heavy duty tractor with rotavator.', category='tractor', village='Bhimavaram'),
    Listing(id=1026, type='Need', title='Required: Labor', description='Workers for loading and unloading.', category='labor', village='Sonpur'),
    Listing(id=1027, type='Need', title='Required: Sprayer', description='Boom sprayer for large fields.', category='sprayer', village='Palampur'),
    Listing(id=1028, type='Need', title='Required: Seeder', description='Seed drill for wheat.', category='seeder', village='Madhopur'),
    Listing(id=1029, type='Need', title='Required: Harvester', description='Harvester for rent, 2 acres per hour.', category='harvester', village='Sonpur'),
    Listing(id=1030, type='Need', title='Required: Harvester', description='Harvester for rent, 2 acres per hour.', category='harvester', village='Sonpur'),
    Listing(id=1031, type='Have', title='Available: Sprayer', description='High pressure fungicide sprayer.', category='sprayer', village='Kishanpur'),
    Listing(id=1032, type='Need', title='Required: Tractor', description='John Deere tractor, experienced driver.', category='tractor', village='Madhopur'),
    Listing(id=1033, type='Need', title='Required: Seeder', description='Automatic seed planter.', category='seeder', village='Sonpur'),
    Listing(id=1034, type='Need', title='Required: Sprayer', description='Drone sprayer for pesticides.', category='sprayer', village='Sitapur'),
    Listing(id=1035, type='Need', title='Required: Labor', description='Skilled labor for transplanting.', category='labor', village='Rampur'),
    Listing(id=1036, type='Have', title='Available: Seeder', description='Multi-crop planter machine.', category='seeder', village='Kishanpur'),
    Listing(id=1037, type='Need', title='Required: Seeder', description='Maize seeder, tractor attached.', category='seeder', village='Sonpur'),
    Listing(id=1038, type='Have', title='Available: Seeder', description='Seed drill for wheat.', category='seeder', village='Bhimavaram'),
    Listing(id=1039, type='Have', title='Available: Seeder', description='Seed drill for wheat.', category='seeder', village='Palampur'),
    Listing(id=1040, type='Have', title='Available: Harvester', description='Heavy duty harvester available.', category='harvester', village='Madhopur'),
    Listing(id=1041, type='Need', title='Required: Tractor', description='Tractor for farm bed preparation.', category='tractor', village='Madhopur'),
    Listing(id=1042, type='Need', title='Required: Tractor', description='John Deere tractor, experienced driver.', category='tractor', village='Sonpur'),
    Listing(id=1043, type='Have', title='Available: Labor', description='Farm hands available for full day.', category='labor', village='Sitapur'),
    Listing(id=1044, type='Have', title='Available: Sprayer', description='Drone sprayer for pesticides.', category='sprayer', village='Sonpur'),
    Listing(id=1045, type='Have', title='Available: Harvester', description='Harvester for rent, 2 acres per hour.', category='harvester', village='Madhopur'),
    Listing(id=1046, type='Need', title='Required: Tractor', description='45 HP tractor available for tilling.', category='tractor', village='Madhopur'),
    Listing(id=1047, type='Need', title='Required: Labor', description='Farm hands available for full day.', category='labor', village='Sitapur'),
    Listing(id=1048, type='Have', title='Available: Sprayer', description='Backpack sprayers with labor.', category='sprayer', village='Rampur'),
    Listing(id=1049, type='Need', title='Required: Seeder', description='Automatic seed planter.', category='seeder', village='Sitapur'),
    Listing(id=1050, type='Need', title='Required: Harvester', description='Combine harvester for paddy.', category='harvester', village='Sitapur'),
    Listing(id=1051, type='Have', title='Available: Seeder', description='Automatic seed planter.', category='seeder', village='Rampur'),
    Listing(id=1052, type='Have', title='Available: Seeder', description='Automatic seed planter.', category='seeder', village='Kishanpur'),
    Listing(id=1053, type='Have', title='Available: Tractor', description='Heavy duty tractor with rotavator.', category='tractor', village='Rampur'),
    Listing(id=1054, type='Have', title='Available: Labor', description='Cotton picking labor group.', category='labor', village='Bhimavaram'),
    Listing(id=1055, type='Need', title='Required: Sprayer', description='Motorized rig for quick spraying.', category='sprayer', village='Kishanpur'),
    Listing(id=1056, type='Need', title='Required: Labor', description='Skilled labor for transplanting.', category='labor', village='Bhimavaram'),
    Listing(id=1057, type='Need', title='Required: Sprayer', description='Drone sprayer for pesticides.', category='sprayer', village='Madhopur'),
    Listing(id=1058, type='Have', title='Available: Tractor', description='Mahindra tractor ready for ploughing.', category='tractor', village='Kishanpur'),
    Listing(id=1059, type='Need', title='Required: Labor', description='Farm hands available for full day.', category='labor', village='Rampur'),
    Listing(id=1060, type='Need', title='Required: Harvester', description='Wheat harvesting machine, low grain loss.', category='harvester', village='Madhopur'),
    Listing(id=1061, type='Need', title='Required: Harvester', description='Harvester for rent, 2 acres per hour.', category='harvester', village='Madhopur'),
    Listing(id=1062, type='Need', title='Required: Sprayer', description='Motorized rig for quick spraying.', category='sprayer', village='Sitapur'),
    Listing(id=1063, type='Need', title='Required: Harvester', description='Heavy duty harvester available.', category='harvester', village='Madhopur'),
    Listing(id=1064, type='Need', title='Required: Labor', description='Cotton picking labor group.', category='labor', village='Palampur'),
    Listing(id=1065, type='Have', title='Available: Labor', description='Cotton picking labor group.', category='labor', village='Sonpur'),
    Listing(id=1066, type='Need', title='Required: Seeder', description='Multi-crop planter machine.', category='seeder', village='Rampur'),
    Listing(id=1067, type='Have', title='Available: Seeder', description='Maize seeder, tractor attached.', category='seeder', village='Madhopur'),
    Listing(id=1068, type='Need', title='Required: Seeder', description='Seed drill for wheat.', category='seeder', village='Rampur'),
    Listing(id=1069, type='Have', title='Available: Sprayer', description='Backpack sprayers with labor.', category='sprayer', village='Sitapur'),
    Listing(id=1070, type='Have', title='Available: Sprayer', description='High pressure fungicide sprayer.', category='sprayer', village='Madhopur'),
    Listing(id=1071, type='Have', title='Available: Labor', description='Farm hands available for full day.', category='labor', village='Kishanpur'),
    Listing(id=1072, type='Need', title='Required: Labor', description='Team of 5 for weeding.', category='labor', village='Madhopur'),
    Listing(id=1073, type='Have', title='Available: Tractor', description='45 HP tractor available for tilling.', category='tractor', village='Madhopur'),
    Listing(id=1074, type='Need', title='Required: Harvester', description='Harvester for rent, 2 acres per hour.', category='harvester', village='Palampur'),
    Listing(id=1075, type='Have', title='Available: Labor', description='Workers for loading and unloading.', category='labor', village='Bhimavaram'),
    Listing(id=1076, type='Have', title='Available: Seeder', description='Automatic seed planter.', category='seeder', village='Gopalpur'),
    Listing(id=1077, type='Have', title='Available: Labor', description='Cotton picking labor group.', category='labor', village='Palampur'),
    Listing(id=1078, type='Need', title='Required: Labor', description='Skilled labor for transplanting.', category='labor', village='Sonpur'),
    Listing(id=1079, type='Have', title='Available: Labor', description='Cotton picking labor group.', category='labor', village='Sitapur'),
    Listing(id=1080, type='Have', title='Available: Harvester', description='Combine harvester for paddy.', category='harvester', village='Bhimavaram'),
    Listing(id=1081, type='Need', title='Required: Harvester', description='Combine harvester for paddy.', category='harvester', village='Kishanpur'),
    Listing(id=1082, type='Need', title='Required: Sprayer', description='High pressure fungicide sprayer.', category='sprayer', village='Sitapur'),
    Listing(id=1083, type='Have', title='Available: Tractor', description='Mahindra tractor ready for ploughing.', category='tractor', village='Madhopur'),
    Listing(id=1084, type='Need', title='Required: Labor', description='Workers for loading and unloading.', category='labor', village='Sonpur'),
    Listing(id=1085, type='Have', title='Available: Labor', description='Team of 5 for weeding.', category='labor', village='Sonpur'),
    Listing(id=1086, type='Have', title='Available: Labor', description='Cotton picking labor group.', category='labor', village='Palampur'),
    Listing(id=1087, type='Have', title='Available: Seeder', description='Maize seeder, tractor attached.', category='seeder', village='Rampur'),
    Listing(id=1088, type='Have', title='Available: Labor', description='Cotton picking labor group.', category='labor', village='Bhimavaram'),
    Listing(id=1089, type='Have', title='Available: Harvester', description='Combine harvester for paddy.', category='harvester', village='Madhopur'),
    Listing(id=1090, type='Have', title='Available: Sprayer', description='Motorized rig for quick spraying.', category='sprayer', village='Madhopur'),
    Listing(id=1091, type='Have', title='Available: Sprayer', description='High pressure fungicide sprayer.', category='sprayer', village='Madhopur'),
    Listing(id=1092, type='Need', title='Required: Tractor', description='John Deere tractor, experienced driver.', category='tractor', village='Bhimavaram'),
    Listing(id=1093, type='Have', title='Available: Tractor', description='Mahindra tractor ready for ploughing.', category='tractor', village='Sitapur'),
    Listing(id=1094, type='Have', title='Available: Sprayer', description='High pressure fungicide sprayer.', category='sprayer', village='Bhimavaram'),
    Listing(id=1095, type='Have', title='Available: Sprayer', description='Drone sprayer for pesticides.', category='sprayer', village='Palampur'),
    Listing(id=1096, type='Have', title='Available: Sprayer', description='High pressure fungicide sprayer.', category='sprayer', village='Madhopur'),
    Listing(id=1097, type='Have', title='Available: Labor', description='Skilled labor for transplanting.', category='labor', village='Kishanpur'),
    Listing(id=1098, type='Need', title='Required: Tractor', description='Heavy duty tractor with rotavator.', category='tractor', village='Sonpur'),
    Listing(id=1099, type='Need', title='Required: Tractor', description='45 HP tractor available for tilling.', category='tractor', village='Palampur'),
    Listing(id=1100, type='Have', title='Available: Sprayer', description='Drone sprayer for pesticides.', category='sprayer', village='Kishanpur'),
]


# 3. ML Engine Function
def find_top_matches(incoming: Listing, top_k: int = 3) -> List[dict]:
    """
    Finds the top_k highest-scoring matches for an incoming listing from opposite type listings.
    Uses TF-IDF Vectorizer and Cosine Similarity over combined title and description text.
    """
    target_type = "Have" if incoming.type == "Need" else "Need"
    
    # Filter database for opposite listing type
    opposite_listings = [item for item in MOCK_DATABASE if item.type == target_type]
    
    if not opposite_listings:
        return []
    
    # Combine title and description fields
    def get_text(item: Listing) -> str:
        return f"{item.title} {item.description} {item.category}".lower()
    
    incoming_text = get_text(incoming)
    opposite_texts = [get_text(item) for item in opposite_listings]
    
    # Combine incoming listing text with opposite listings corpus
    corpus = [incoming_text] + opposite_texts
    
    # TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    # Calculate Cosine Similarity between incoming vector (index 0) and opposite listings (indices 1..)
    incoming_vector = tfidf_matrix[0]
    opposite_vectors = tfidf_matrix[1:]
    
    similarities = cosine_similarity(incoming_vector, opposite_vectors)[0]
    
    # Pair opposite listings with similarity scores
    scored_matches = []
    for idx, listing in enumerate(opposite_listings):
        score = float(similarities[idx])
        # Convert to dict and add match score metrics
        match_dict = listing.dict()
        match_dict["score"] = round(score, 4)
        match_dict["match_score"] = round(score, 4)
        match_dict["match_percentage"] = f"{round(score * 100, 1)}%"
        scored_matches.append(match_dict)
    
    # Sort descending by similarity score
    scored_matches.sort(key=lambda x: x["score"], reverse=True)
    
    # Return top K matches
    return scored_matches[:top_k]


# 4. API Endpoint: POST /api/match
@app.post("/api/match")
def match_endpoint(incoming: Listing):
    """
    Executes TF-IDF text matching against opposite marketplace listings
    and returns top 3 matches formatted as JSON.
    """
    top_matches = find_top_matches(incoming, top_k=3)
    return {
        "status": "success",
        "query": {
            "id": incoming.id,
            "type": incoming.type,
            "title": incoming.title,
            "category": incoming.category,
            "village": incoming.village
        },
        "count": len(top_matches),
        "matches": top_matches
    }

@app.get("/api/match/health")
def health_check():
    return {"status": "ok", "service": "KisanConnect ML Engine", "database_size": len(MOCK_DATABASE)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
