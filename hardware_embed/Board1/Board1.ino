#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Keypad.h>
#include <HardwareSerial.h>

#define tckMs portTICK_PERIOD_MS

static TaskHandle_t task_keypad = NULL;

const char* url_get1 = "https://tcmf-backend.herokuapp.com/check_ready";
const char* url_get2 = "https://tcmf-backend.herokuapp.com/check_status";
const char* url_post = "https://tcmf-backend.herokuapp.com/hardware_open";

//Please enter your own access point information
const char* ssid = "HARDWARE_hotspot";
const char* password = "1Q2w3e4%";

const int _size = 2 * JSON_OBJECT_SIZE(10);

StaticJsonDocument<_size> JSONPost;
StaticJsonDocument<_size> JSONGet;
char str[100];

const byte rows = 4; //four rows
const byte cols = 3; //three columns
char keys[rows][cols] = {
  {'1','2','3'},
  {'4','5','6'},
  {'7','8','9'},
  {'#','0','*'}
};

//Pin assigned
int led = 2; //This is built-in LED use for indicate WiFi connection
byte rowPins[rows] = {32, 33, 25, 26}; //connect to the row pinouts of the keypad
byte colPins[cols] = {27, 14, 12}; //connect to the column pinouts of the keypad
Keypad keypad = Keypad( makeKeymap(keys), rowPins, colPins, rows, cols );

//Global variables
char keyPassword[6];
int keyIndex=0;
int readypw=0;
int lock=1;
int state=0;

void stringClear() {
  for(int i=0;i<6;i++){
    keyPassword[i]='\0';
  }
}

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

void keypadTask() {
  char key = keypad.getKey();
// on keypad '*' and '#' give opposite value to each other
  if(key=='#'){
    if(keyIndex>0){
      keyIndex-=1;
      keyPassword[keyIndex]='\0';
    }
  }
  else if(key=='*'){
    keyIndex=0;
    _post(); // <<<<<<<<<<< call POST here
    stringClear();
  }
  else if(key >= '0' && key <= '9'){
    if(keyIndex<=5){
      keyPassword[keyIndex]=key;
      keyIndex+=1;
    }
  }
}

void _get1(){
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(url_get1);
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
        Serial.print("ready : ");
        Serial.println((int)(JSONGet["ready"]));
        readypw=(int)(JSONGet["ready"]);
        if(!readypw){
          stringClear();
        }
        else{
          Serial2.write(1); //tell board3 to write on LCD as "Please enter OTP"
          state=1;
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

void _get2(){
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(url_get2);
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
        Serial.print("lock : ");
        Serial.println((int)(JSONGet["lock"]));
        lock=(int)(JSONGet["lock"]);
        if(lock){
          Serial2.write(4); //tell board3 to write on LCD as "Safe box locked"
          state=0;
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

void _post(){
  if(WiFi.status()==WL_CONNECTED){
    HTTPClient http;
    http.begin(url_post);
    http.addHeader("Content-Type", "application/json");
    JSONPost["password"] = (const char*)(keyPassword);
    serializeJson(JSONPost, str);
    int httpCode = http.POST(str);
    if(httpCode==HTTP_CODE_OK){
      String payload = http.getString();
      Serial.println(httpCode);
      Serial.println(payload);
      DeserializationError err = deserializeJson(JSONPost, payload);
      if(err){
        Serial.print(F("deserializeJson() failed with code "));
        Serial.println(err.c_str());
      }
      int val = (int)(JSONPost["result"]);
      if(val==1){
        Serial2.write(2); //tell board3 to write on LCD as "Safe box unlocked"
        state=2;
      }
      else{
        Serial2.write(3); //tell board3 to write on LCD as "Wrong Password"
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

void setup() {
  // put your setup code here, to run once:
  pinMode(led,OUTPUT);
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  WiFi_Connect();
}

void loop() {
  // put your main code here, to run repeatedly:
  if(state == 0){ //waiting for user to get password on web app
    _get1();
    delay(1000);
  }
  else if(state == 1){ //waiting for user to enter password
    keypadTask();
  }
  else if(state == 2){ //waiting for user to close the door
    _get2();
    delay(1000);
  }
}
