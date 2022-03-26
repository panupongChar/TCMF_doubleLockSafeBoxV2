from pymongo import MongoClient
import json
import urllib.parse


# ========================= Config Password ==========================
config = json.load(open("config.json"))
DB_USER_NAME = urllib.parse.quote_plus(config["mongo_username"])
DB_PASSWORD = urllib.parse.quote_plus(config["mongo_password"])
# ====================================================================


# ========================= Config MongoDB ===========================
client = MongoClient(f"mongodb+srv://{DB_USER_NAME}:{DB_PASSWORD}@cluster0.3qfxb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
db = client.get_database("TCMF_DB")
log_collection = db.log
# ====================================================================


query = log_collection.find()
with open("logfile.txt", "w+") as f:
    for record in query:
        f.write(record["time"] + " " + record["desc"] + "\n")
