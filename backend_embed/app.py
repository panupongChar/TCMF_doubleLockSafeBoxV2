from flask import Flask, request
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
import json
import urllib.parse
from hashlib import sha256
import math, random
import smtplib
from email.message import EmailMessage
import time



# ========================= Config Password ==========================
config = json.load(open("config.json"))

DB_USER_NAME = urllib.parse.quote_plus(config["mongo_username"])
DB_PASSWORD = urllib.parse.quote_plus(config["mongo_password"])
SALT = config["salt"]

MY_EMAIL_ADDRESS = config["my_email_address"]
MY_EMAIL_PASSWORD = config["my_email_password"]
# ====================================================================



# ========================= Config MongoDB ===========================
client = MongoClient(f"mongodb+srv://{DB_USER_NAME}:{DB_PASSWORD}@cluster0.3qfxb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
db = client.get_database("TCMF_DB")
user_collection = db.user
box_collection = db.box
log_collection = db.log
tmp_collection = db.tmp
# ====================================================================



# ===================== Function Declaration =========================
def encrypt(password):
    h = sha256()
    password_binary = f'{password}'.encode('utf-8')
    h.update(password_binary)
    hash = h.hexdigest()
    return hash


def generateOTP() :
    digits = "0123456789"
    OTP = ""
    for _ in range(6) :
        OTP += digits[math.floor(random.random() * 10)]
    return OTP


def send_email(email_type, recipient_email, OTP="000000"):
    msg = EmailMessage()
    msg['Subject'] = 'DOUBLE LOCK SAFE BOX'
    msg['From'] = MY_EMAIL_ADDRESS
    msg['To'] = recipient_email

    if email_type == "alert":
        with open("./Break_the_box.html") as fp:
            msg.set_content(fp.read(), subtype='html')

    if email_type == "OTP":
        with open("./OTP_message.html") as fp:
            msg.set_content(fp.read().replace("OTPCODE", OTP), subtype='html')

    if email_type == "wrong_password":
        with open("./Wrong_login.html") as fp:
            msg.set_content(fp.read(), subtype='html')

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(MY_EMAIL_ADDRESS, MY_EMAIL_PASSWORD) 
        smtp.send_message(msg)

TIME = time.strftime('%d-%m-%y %H:%M:%S', time.localtime())
# =====================================================================



app = Flask(__name__)
cors = CORS(app, resource={r"/": {"origins": "*"}})



# ===========================  Frontend  ==============================
@app.route("/", methods=["GET"])
@cross_origin()
def index():
    texts = "Hello from TCMF_Backend"
    return texts


@app.route("/web_login", methods=["POST"])
@cross_origin()
def user_find_one():
    data = request.json
    user_name = data["username"]

    if user_collection.find_one({"username": user_name}, {'_id': False}) == None:
        return {"error": "password_wrong"}

    query = user_collection.find_one({"username": user_name}, {'_id': False})

    # Check if username password is correct
    if encrypt(data["username"] + data["password"] + SALT) == query["password"]:

        # insert log to log_collection
        insert_log = {
            "time" : TIME,
            "desc" : f"user:{user_name} login success from website."
        }
        log_collection.insert_one(insert_log)

        # Check if user is not current user
        query = box_collection.find_one({"box_id": "0"}, {'_id': False})
        if data["username"]!=query["username"] and query["active"]:
            return {"error":"current_user_error"}

        return {'result': 'success'}

    else:

        # insert log to log_collection
        insert_log = {
            "time" : TIME,
            "desc" : f"user:{user_name} login fail from website."
        }
        log_collection.insert_one(insert_log)
        return {"error": "password_wrong"}


@app.route("/register", methods=["POST"])
@cross_origin()
def user_insert_one():
    data = request.json
    user_name = data["username"]
    user_email = data["email"]

    user_dup = False
    email_dup = False

    # Check if username is already in use
    if user_collection.find_one({"username": user_name}, {'_id': False}) != None:
        user_dup = True

    # Check if email is already in use
    if user_collection.find_one({"email": user_email}, {'_id': False}) != None:
        email_dup = True

    # ruturn if error
    if user_dup and email_dup:
        return {'error': 'user_and_email_error'}
    elif user_dup:
        return {'error': 'user_error'}
    elif email_dup:
        return {'error': 'email_error'}

    # insert user to user_collection
    myInsert = {
            "username" : data["username"],
            "password" : encrypt(data["username"] + data["password"] + SALT),
            "email" : data["email"],
        }
    user_collection.insert_one(myInsert)

    # insert log to log_collection
    insert_log = {
            "time" : TIME,
            "desc" : f"user:{data['username']} register success."
        }
    log_collection.insert_one(insert_log)

    return {'result': 'success'}


@app.route("/get_OTP", methods=["POST"])
@cross_origin()
def get_OTP():
    data = request.json
    user_name = data["username"]

    if user_collection.find_one({"username": user_name}, {'_id': False}) == None:
        return {"error": "password_wrong"}

    query = user_collection.find_one({"username": user_name}, {'_id': False})
    user_email = query["email"]

    # Check if username password is correct
    if encrypt(data["username"] + data["password"] + SALT) == query["password"]:

        # insert log to log_collection
        insert_log = {
            "time" : TIME,
            "desc" : f"user:{user_name} login success from website."
        }
        log_collection.insert_one(insert_log)

        # query box data
        query = box_collection.find_one({"box_id": "0"}, {'_id': False})

        # Check if box is available or user is owner
        if not query["active"] or data["username"]==query["username"]:

            # generate OTP
            OTP = generateOTP()

            # update box data to box_collection
            myquery = { "box_id": "0" }
            myInsert = { "$set": { "password": encrypt(OTP + SALT), "lock": True, "active": True, "username": data["username"]} }
            box_collection.update_one(myquery, myInsert)

            # insert log to log_collection
            insert_log = {
                "time" : TIME,
                "desc" : f"OTP sent."
            }
            log_collection.insert_one(insert_log)

            # send email
            send_email("OTP", user_email, OTP = OTP)
            
            # update ready status to tmp_collection
            myquery = { "box_id": "0" }
            myInsert = { "$set": { "ready": 1} }
            tmp_collection.update_one(myquery, myInsert)

            print("set true")
            return {'result': 'success'}

        else:
            return {"error":"current_user_error"}

    else:
        # insert log to log_collection
        insert_log = {
            "time" : TIME,
            "desc" : f"user:{user_name} login fail from website."
        }
        log_collection.insert_one(insert_log)
        return {"error": "password_wrong"}


@app.route("/deactivate", methods=["Post"])
@cross_origin()
def unuse_box():
    data = request.json
    user_name = data["username"]

    if user_collection.find_one({"username": user_name}, {'_id': False}) == None:
        return {"error": "password_wrong"}

    query = user_collection.find_one({"username": user_name}, {'_id': False})

    # Check if username password is correct
    if encrypt(data["username"] + data["password"] + SALT) == query["password"]:

        # insert log to log_collection
        insert_log = {
            "time" : TIME,
            "desc" : f"user:{user_name} login success from website."
        }
        log_collection.insert_one(insert_log)

        # query box data
        query = box_collection.find_one({"box_id": "0"}, {'_id': False})

        if query["active"]:
            
            if data["username"]==query["username"]:

                if encrypt(data["OTP"] + SALT) == query["password"]:

                    myquery = { "box_id": "0" }
                    newpass = { "$set": { "lock": True, "active": False ,  "password":"", "username":"" } }
                    box_collection.update_one(myquery, newpass)
                    insert_log = {
                            "time" : TIME,
                            "desc" : f"user:{data['username']} unuse box."
                        }
                    log_collection.insert_one(insert_log)
                    return {"result":"success"}

                else:
                    return {"error": "OTP_wrong"}

            else:
                return {"error": "current_user_error"}

        else:
            {"error": "deactivate_error"}

    else:
        # insert log to log_collection
        insert_log = {
            "time" : TIME,
            "desc" : f"user:{user_name} login fail from website."
        }
        log_collection.insert_one(insert_log)
        return {"error": "password_wrong"}
# =====================================================================



# ===========================  Hardware  ==============================
@app.route("/hardware_alert", methods=["POST"])
@cross_origin()
def hardware_alert():
    query = box_collection.find_one({"box_id": "0"}, {'_id': False})
    current_user = query["username"]

    query = user_collection.find_one({"username": current_user}, {'_id': False})
    user_email = query["email"]

    send_email("alert", user_email)

    # insert log to log_collection
    insert_log = {
        "time" : TIME,
        "desc" : f"user:{current_user} hardware alert."
    }
    log_collection.insert_one(insert_log)

    return {'result': 1}


@app.route("/hardware_open", methods=["POST"])
@cross_origin()
def hardware_open():
    data = request.json

    query = box_collection.find_one({"box_id": "0"}, {'_id': False})
    current_user = query["username"]
    box_password = query["password"]

    query = user_collection.find_one({"username": current_user}, {'_id': False})
    user_email = query["email"]

    if encrypt(data["password"] + SALT) == box_password:
        myquery = { "box_id": "0" }
        newpass = { "$set": { "lock": False } }
        box_collection.update_one(myquery, newpass)
        
        # update ready status to tmp_collection
        myquery = { "box_id": "0" }
        myInsert = { "$set": { "ready": 0} }
        tmp_collection.update_one(myquery, myInsert)

        return {"result": 1, "password": data["password"]}

    else:
        # send email
        send_email("wrong_password", user_email)

        return {"result": 0, "password": data["password"]}


@app.route("/check_status", methods=["GET"])
@cross_origin()
def check_status():
    query = box_collection.find_one({"box_id": "0"})
    tmp = {
        "box_id" : query["box_id"],
        "lock" : query["lock"],
        "active": query["active"],
        "item_inside": query["item_inside"]
    }
    return tmp


@app.route("/hardware_close", methods=["POST"])
@cross_origin()
def hardware_close():
    myquery = { "box_id": "0" }
    newpass = { "$set": { "lock": True } }
    box_collection.update_one(myquery, newpass)
    return {"result": 1}


@app.route("/item_inside", methods=["POST"])
@cross_origin()
def check_item_inside():
    data = request.json

    if data["have"] == 1:
        check = True
    elif data["have"] == 0:
        check = False

    # update data to box_collection
    myquery = { "box_id": "0" }
    newpass = { "$set": { "item_inside": check } }
    box_collection.update_one(myquery, newpass)
    return {"result": 1}


@app.route("/check_ready", methods=["GET"])
@cross_origin()
def check_ready():
    query = tmp_collection.find_one({"box_id": "0"})
    tmp = {
        "ready" : query["ready"]
    }
    return tmp
# =====================================================================



if __name__ == "__main__":
    #app.run(host='0.0.0.0', port='3000', debug=True)
    app.run()