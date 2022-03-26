#include <HardwareSerial.h>

#define tckMs portTICK_PERIOD_MS

static TaskHandle_t task_item_inside = NULL;
static TaskHandle_t task_alert = NULL;

hw_timer_t *timer = NULL;

//Pin assigned
int tiltDigital = 22;
int microSW = 13;
int buzzer = 4;
int channel = 0;
int freq = 400;
int resolution = 8;

//Global variables
int lock=1;
volatile bool stateChange=false; //boolean to tell if micro switch status changed
volatile bool switchState=false; //boolean of 1second debounced micro switch
volatile int trig=-10000; //value for trigger alert buzzer
volatile int trigCount=0; //value for trigger shock count threshold
bool activeStatus=false; //boolean declared from Board2 to tell if there is user activate the box
int val=-1; //value from board2

void debounce(){
  static int count = 200;
  if(digitalRead(microSW) && count>0){
    count--;
  }
  else if(!digitalRead(microSW) && count<201){
    count++;
  }
  
  if(count==0){
    if(!switchState){
      stateChange=true;
    }
    switchState=true;
  }
  else if(count==201){
    if(switchState){
      stateChange=true;
    }
    switchState=false;
  }
}

void item_inside(void *param){
  while(1){
    if(stateChange){
      if(switchState){
        Serial2.write(5); //have item
        Serial.println("pressed");
      }
      else{
        Serial2.write(6); //don't have item
        Serial.println("unpressed");
      }
      stateChange=false;
    }
    vTaskDelay(10/tckMs);
  }
}

void alert(void *param){
  while(1){
    if(digitalRead(tiltDigital)==0){
      if(lock && activeStatus && switchState){
        trigCount++;
      }
      Serial.print("trigCount:");
      Serial.println(trigCount);
    }
    if(trigCount>1){
      trig=millis();
      Serial2.write(7);
      Serial.println("triggered!");
      trigCount=0;
    }
    if(millis()-trig < 10000){ //this make the alarm buzzer alert for 10secs after triggered
      ledcWriteTone(channel,800);
      delay(500);
      ledcWriteTone(channel,0);
      delay(500);
    }
    vTaskDelay(10/tckMs);
  }
}

void setup() {
  // put your setup code here, to run once:
  pinMode(tiltDigital,INPUT);
  pinMode(microSW,INPUT);
  ledcSetup(channel, freq, resolution);
  ledcAttachPin(buzzer, channel);
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  timer = timerBegin(0,80,true);
  timerAttachInterrupt(timer,debounce,true);
  timerAlarmWrite(timer, 100,true);
  timerAlarmEnable(timer);
  xTaskCreatePinnedToCore(item_inside, "item_inside", 1024 * 32, NULL, 1, &task_item_inside, 0);
  xTaskCreatePinnedToCore(alert, "hardware_alert", 1024 * 32, NULL, 1, &task_alert, 0);
}

void loop() {
  // put your main code here, to run repeatedly:
  val = Serial2.read();
  if(val == 1){
    lock=0;
    Serial.println("unlocked");
  }
  else if(val == 2){
    lock=1;
    trigCount=0;
    Serial.println("locked");
  }
  else if(val == 3){
    activeStatus = true;
    trigCount=0;
  }
  else if(val == 4){
    activeStatus = false;
  }
}
