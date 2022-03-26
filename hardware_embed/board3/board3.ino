#include <LiquidCrystal_I2C.h>
#include <HardwareSerial.h>


// set the LCD number of columns and rows
int lcdColumns = 16;
int lcdRows = 2;

// set LCD address, number of columns and rows
// if you don't know your display address, run an I2C scanner sketch
LiquidCrystal_I2C lcd(0x27, lcdColumns, lcdRows);  

//Global variables
int val=-1; //value from board1

void start_message(){
  lcd.clear(); 
  lcd.setCursor(0, 0);
  lcd.print("  Scan QR Code");
  lcd.setCursor(0, 1);
  lcd.print(" to use safebox");
}

void otp_message(){
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Please enter OTP");
}

void open_message(){
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("    Safe box");
  lcd.setCursor(0, 1);
  lcd.print("   Unlocked!");
  delay(2000);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("  Please pull");
  lcd.setCursor(0, 1);
  lcd.print("    the door");
  delay(5000);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Don't forget to");
  lcd.setCursor(0, 1);
  lcd.print(" close the door");
}

void setup() {
  // put your setup code here, to run once:
  // initialize LCD
  lcd.init();
  // turn on LCD backlight                      
  lcd.backlight();
  start_message();
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
}

void loop() {
  // put your main code here, to run repeatedly:
  val = Serial2.read();
  if(val == 1){
    otp_message();
  }
  else if(val == 2){
    open_message();
  }
  else if(val == 3){
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("   Wrong OTP!");
    delay(3000);
    otp_message();
  }
  else if(val == 4){
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("    Safe box");
    lcd.setCursor(0, 1);
    lcd.print("     Locked!");
    delay(3000);
    start_message();
  }
}
