#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <HardwareSerial.h>

#define tckMs portTICK_PERIOD_MS

static TaskHandle_t task_item_inside = NULL;
static TaskHandle_t task_alert = NULL;

const char* url_get = "https://tcmf-backend.herokuapp.com/check_status";
const char* url_post1 = "https://tcmf-backend.herokuapp.com/hardware_close";
const char* url_post2 = "https://tcmf-backend.herokuapp.com/item_inside";
const char* url_post3 = "https://tcmf-backend.herokuapp.com/hardware_alert";

//Please enter your own access point information
const char* ssid = "HARDWARE_hotspot";
const char* password = "1Q2w3e4%";

const int _size = 2 * JSON_OBJECT_SIZE(10);

StaticJsonDocument<_size> JSONPost1; //for _post1
StaticJsonDocument<_size> JSONPost2; //for _post2
StaticJsonDocument<_size> JSONPost3; //for _post3
StaticJsonDocument<_size> JSONGet; //for _get
char str1[30]; //for _post1
char str2[50]; //for _post2
char str3[30]; //for _post3

//Pin assigned
int led = 2; //This is built-in LED use for indicate WiFi connection
int lightBlock = 27;
int relay = 33;

//Global variables
int state=0;
int lock=1;
int readVal=-1;
volatile int talkVal=-1;
bool activeStatus = false;
bool itemInsideStatus = false;

void WiFi_Connect(){
  WiFi.disconnect();
  WiFi.begin(ssid,password);
  while(WiFi.status()!=WL_CONNECTED){
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  digitalWrite(led,1);
  Serial.println("Connected to the WiFi network");
  Serial.print("IP Address : ");
  Serial.println(WiFi.localIP());
}

void _get(){
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(url_get);
    int httpCode = http.GET();
    if(httpCode==HTTP_CODE_OK){
      String payload = http.getString();
      DeserializationError err = deserializeJson(JSONGet, payload);
      if(err){
        Serial.print(F("deserializeJson() failed with code "));
        Serial.println(err.c_str());
      }
      else{
        Serial.println(httpCode);
//        Serial.println(payload);
        Serial.print("lock : ");
        Serial.println((int)(JSONGet["lock"]));
        lock=(int)(JSONGet["lock"]);
        if(activeStatus!=(bool)(JSONGet["active"])){
          activeStatus=(bool)(JSONGet["active"]);
          if(activeStatus){
            Serial2.write(3); //tell board4 that the safe box activated
          }
          else{
            Serial2.write(4); //tell board4 that the safe box deactivated
          }
        }
        itemInsideStatus=(bool)(JSONGet["item_inside"]);
        if(lock==0){
          Serial2.write(1); //tell board4 that the safe box unlocked
          digitalWrite(relay,0); //make it really unlocked
          state=1;
          Serial.println("Change to state 1");
        }
      }
    }
    else{
      Serial.println(httpCode);
      Serial.println("ERROR on HTTP Request");
    }
  }
  else{
    WiFi_Connect();
  }
}

void _post1(){
  if(WiFi.status()==WL_CONNECTED){
    HTTPClient http;
    http.begin(url_post1);
    http.addHeader("Content-Type", "application/json");
    serializeJson(JSONPost1, str1);
    int httpCode = http.POST(str1);
    if(httpCode==HTTP_CODE_OK){
      String payload = http.getString();
      Serial.println(httpCode);
      Serial.println(payload);
      DeserializationError err = deserializeJson(JSONPost1, payload);
      if(err){
        Serial.print(F("deserializeJson() failed with code "));
        Serial.println(err.c_str());
      }
      int val = (int)(JSONPost1["result"]);
      if(val==1){
        Serial2.write(2); //tell board4 that the safe box locked and 
        digitalWrite(relay,1); //make it really locked
        state=0;
        Serial.println("Change to state 0");
      }
    }
    else{
      Serial.println(httpCode);
      Serial.println("ERROR on HTTP Request");
    }
  }
  else{
    WiFi_Connect();
  }
}

void _post2(void *param){
  while(1){
    if(talkVal==5 || talkVal==6){ //5-> have item, 6-> no item
      int itemIn = 6-talkVal;
      if(WiFi.status()==WL_CONNECTED){
        HTTPClient http;
        http.begin(url_post2);
        http.addHeader("Content-Type", "application/json");
        JSONPost2["have"] = itemIn;
        serializeJson(JSONPost2, str2);
        int httpCode = http.POST(str2);
        if(httpCode==HTTP_CODE_OK){
          String payload = http.getString();
          Serial.println(httpCode);
          Serial.println(payload);
          DeserializationError err = deserializeJson(JSONPost2, payload);
          if(err){
            Serial.print(F("deserializeJson() failed with code "));
            Serial.println(err.c_str());
          }
          int val = (int)(JSONPost2["result"]);
          if(val==1){
            if(itemIn){
              Serial.println("item inside");
            }
            else{
              Serial.println("item not inside");
            }
            talkVal=-1;
          }
        }
        else{
          Serial.println(httpCode);
          Serial.println("ERROR on HTTP Request");
        }
      }
      else{
        WiFi_Connect();
      }
    }
    vTaskDelay(10/tckMs);
  }
}

void _post3(void *param){
  while(1){
    if(state==0 && talkVal==7){
      if(WiFi.status()==WL_CONNECTED){
        HTTPClient http;
        http.begin(url_post3);
        http.addHeader("Content-Type", "application/json");
        serializeJson(JSONPost3, str3);
        int httpCode = http.POST(str3);
        if(httpCode==HTTP_CODE_OK){
          String payload = http.getString();
          Serial.println(httpCode);
          Serial.println(payload);
          DeserializationError err = deserializeJson(JSONPost3, payload);
          if(err){
            Serial.print(F("deserializeJson() failed with code "));
            Serial.println(err.c_str());
          }
          int val = (int)(JSONPost3["result"]);
          if(val==1){
            Serial.println("ALERT");
            talkVal=-1;
          }
        }
        else{
          Serial.println(httpCode);
          Serial.println("ERROR on HTTP Request");
        }
      }
      else{
        WiFi_Connect();
      }
    }
    vTaskDelay(10/tckMs);
  }
}

void setup() {
  // put your setup code here, to run once:
  pinMode(led,OUTPUT);
  pinMode(relay,OUTPUT);
  pinMode(lightBlock,INPUT);
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  digitalWrite(relay,1); //start with door locked
  WiFi_Connect();
  xTaskCreatePinnedToCore(_post2, "item_inside", 1024 * 32, NULL, 1, &task_item_inside, 0);
  xTaskCreatePinnedToCore(_post3, "hardware_alert", 1024 * 32, NULL, 1, &task_alert, 0);
}

void loop() {
  // put your main code here, to run repeatedly:
  readVal = Serial2.read();
  if(readVal!=-1){
    talkVal = readVal;
  }
  
  if(state == 0){ //waiting for unlock status
    _get();
    delay(1000);
  }
  else if(state == 1){ //waiting for user to pull door
    if(digitalRead(lightBlock)==0){ //if door lip out of sensor detection area change state to 2
      state=2;
      Serial.println("Change to state 2");
    }
  }
  else if(state == 2){ //waiting for user to close the door
    if(digitalRead(lightBlock)==1){ //if door lip back to sensor detection area, make POST request (and change to state 0, change state inside _post1 function)
      _post1();
      delay(1000);
    }
  }
}
