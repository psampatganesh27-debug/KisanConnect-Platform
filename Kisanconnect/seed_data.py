import sqlite3
import random
from datetime import datetime, timedelta
import os

NAMES = ["Ramesh", "Suresh", "Vijay", "Balwinder", "Amit", "Rajesh", "Vikram", "Anil", "Sunil", "Prakash", "Deepak", "Manoj"]
LAST_NAMES = ["Kumar", "Patel", "Reddy", "Singh", "Sharma", "Verma", "Yadav", "Chaudhary", "Deshmukh", "Gowda"]
VILLAGES = ["Rampur", "Bhimavaram", "Sonpur", "Gopalpur", "Kishanpur", "Palampur", "Madhopur", "Sitapur"]
DISTRICTS = ["Karnal", "West Godavari", "Anand", "Ludhiana", "Patna", "Guntur", "Nashik", "Amritsar"]
CATEGORIES = ["tractor", "harvester", "sprayer", "labor", "seeder"]

DESCRIPTIONS = {
    "tractor": ["45 HP tractor available for tilling.", "Heavy duty tractor with rotavator.", "Tractor for farm bed preparation.", "John Deere tractor, experienced driver.", "Mahindra tractor ready for ploughing."],
    "harvester": ["Combine harvester for paddy.", "Wheat harvesting machine, low grain loss.", "Heavy duty harvester available.", "Harvester for rent, 2 acres per hour.", "Quick harvesting for dry fields."],
    "sprayer": ["Drone sprayer for pesticides.", "Motorized rig for quick spraying.", "Backpack sprayers with labor.", "High pressure fungicide sprayer.", "Boom sprayer for large fields."],
    "labor": ["Team of 5 for weeding.", "Skilled labor for transplanting.", "Cotton picking labor group.", "Workers for loading and unloading.", "Farm hands available for full day."],
    "seeder": ["Automatic seed planter.", "Maize seeder, tractor attached.", "Pneumatic precision seeder.", "Seed drill for wheat.", "Multi-crop planter machine."]
}

def generate_mock_db():
    print("Generating data...")
    users = []
    
    # 1. Connect to DB to insert users and get their actual database IDs
    db_path = "kisanconnect.sqlite"
    if not os.path.exists(db_path):
        print("Database not found! Make sure you run your Node server once to create it.")
        return

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    for i in range(50):
        name = f"{random.choice(NAMES)} {random.choice(LAST_NAMES)}"
        phone = f"9{random.randint(100000000, 999999999)}"
        pin = "1234"
        village = random.choice(VILLAGES)
        district = random.choice(DISTRICTS)
        
        try:
            c.execute("INSERT INTO users (name, phone, pin, village, district) VALUES (?, ?, ?, ?, ?)", 
                      (name, phone, pin, village, district))
            user_id = c.lastrowid
            users.append({
                "id": user_id,
                "name": name,
                "phone": phone,
                "village": village,
                "district": district
            })
        except Exception as e:
            pass # Skip if phone is somehow not unique

    print(f"Successfully generated {len(users)} users.")

    listings_for_ml = []
    
    # 2. Generate and insert 100 listings based on your exact schema
    for i in range(1, 101):
        cat = random.choice(CATEGORIES)
        user = random.choice(users)
        l_type = random.choice(["Have", "Need"])
        title = f"{'Available' if l_type == 'Have' else 'Required'}: {cat.capitalize()}"
        description = random.choice(DESCRIPTIONS[cat])
        rate = random.choice([500, 800, 1200, 1500, 2000])
        unit = random.choice(["hour", "day", "acre"])
        
        # Save for the Python ML text file
        listings_for_ml.append({
            "id": 1000 + i,
            "type": l_type,
            "title": title,
            "description": description,
            "category": cat,
            "village": user["village"]
        })

        try:
            if l_type == 'Have':
                c.execute("""
                    INSERT INTO equipment_listings 
                    (user_id, owner_name, owner_phone, category, title, description, rate_per_unit, unit_type, village, district) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (user["id"], user["name"], user["phone"], cat, title, description, rate, unit, user["village"], user["district"]))
            else:
                work_date = (datetime.now() + timedelta(days=random.randint(1, 14))).strftime("%Y-%m-%d")
                c.execute("""
                    INSERT INTO labor_requests 
                    (user_id, requester_name, requester_phone, category, title, description, offered_rate, unit_type, work_date, village, district) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (user["id"], user["name"], user["phone"], cat, title, description, rate, unit, work_date, user["village"], user["district"]))
        except Exception as e:
            print(f"Failed to insert listing: {e}")

    conn.commit()
    conn.close()
    
    # 3. Write the Python List for main.py
    with open("generated_ml_data.txt", "w") as f:
        f.write("MOCK_DATABASE = [\n")
        for item in listings_for_ml:
            f.write(f"    Listing(id={item['id']}, type='{item['type']}', title='{item['title']}', description='{item['description']}', category='{item['category']}', village='{item['village']}'),\n")
        f.write("]\n")
        
    print("Successfully injected listings into the database.")
    print("Created 'generated_ml_data.txt'. Don't forget to paste this into main.py!")

if __name__ == "__main__":
    generate_mock_db()