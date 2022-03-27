# TCMF_doubleLockSafeBoxV2

คลิปวิดีโอ :  
https://youtu.be/Q5OcESxcq4c

Team Members
---

| Student ID   | Name                         | GitHub                                              | Affiliation                                              |
|--------------|------------------------------|-----------------------------------------------------|----------------------------------------------------------|
| 6210501010   | ภาณุพงศ์ เจริญพร               | [panupongChar](https://github.com/panupongChar)     | Computer Engineering, Kasetsart University               |
| 6210503691   | ปพนธ์ ชุณหคล้าย               | [canppchk](https://github.com/Nacjoker)             | Computer Engineering, Kasetsart University               |
| 6210503853   | สิทธิเจตน์ วงศ์ทิชาวัฒน์           | [ttimestj](https://github.com/Nieraa)               | Computer Engineering, Kasetsart University               |
| 6210505163   | จิณณเจตน์ อจลพงศ์             | [jinnajateA](https://github.com/jinnajateA)         | Computer Engineering, Kasetsart University               |

ชื่อโครงงาน : Double Lock Safe Box V.2

รายละเอียด :
ตู้เซฟที่มีระบบการล็อค 2 ชั้น
โดยชั้นแรก จะต้องเข้าสู่ระบบด้วยบัญชีผู้ใช้ใน web application เพื่อให้ได้ one-time passcode (OTP)
เพื่อนำมาปลดล็อคในชั้นที่สองด้วยการกดรหัส OTP ลงบน keypad ที่หน้าตู้เซฟ
โดยการปลดล็อค,การพยายามใส่รหัสผ่านทุกๆครั้ง,หรือการกระทำที่จะทำลายตู้เซฟ จะเก็บ log file ไว้ใน backend server
และเมื่อมีการพยายามปลดล็อคตู้เซฟที่ไม่สำเร็จ หรือ การพยายามพังทำลายตู้เซฟ
จะมีการแจ้งเตือนไปที่ user ที่ใช้งานตู้อยู่ในขณะนั้น(สิ่งของในตู้เป็นของ user คนนั้นๆ)

ที่มาของโครงงาน :
โครงงานนี้เป็นการพัฒนาต่อจาก Double Lock Safe Box เดิมในรายวิชา 01204223 Practicum for CPE
(กลุ่มที่ 4 : TCMF - https://ecourse.cpe.ku.ac.th/tpm/project/practicum-63s)
ซึ่งจะมีกลไกการทำงานที่ซับซ้อนและต่างออกไปจากเดิม
โดยมีวัตถุประสงค์ เพื่อให้สามารถฝากของวางไว้ในที่สาธารณะโดยไม่จำเป็นต้องมีคนมาเฝ้าของ
และปลอดภัยจากการถูกขโมยได้ด้วยการที่มี log file ในการย้อนดูประวัติการใช้งานตู้เซฟและระบบแจ้งเตือนให้กับ user
เมื่อมีคนมาพยายามเปิดตู้ด้วยการใส่รหัสผ่านที่ผิด หรือการพยายามพังตู้เซฟ

อุปกรณ์ :
1. ESP32 (NodeMCU-32S) [4 เครื่อง]
2. Solenoid Door Lock 12V 1A [1 ชิ้น]
3. Relay 5V [1 ชิ้น]
4. Power Adapter 12V 1A [1 ชิ้น]
5. USB Adapter 5V 2A 4 ports [1 ชิ้น]
6. Matrix Keypad 3x4 [1 ชิ้น]
7. 16x2 LCD with backlight พร้อม I2C Interface 5V [1 ชิ้น]
8. Micro switch โดยใช้ขา (COM กับ NO) [1 ชิ้น]
9. Shock sensor (Tilt digital switch) [1 ชิ้น]
10. Light blocking sensor (Motor encoder light blocking sensor) [1 ชิ้น]
11. Passive buzzer [1 ชิ้น]
12. ชุดสายไฟและ jumper wire [1 ชุด]
13. Breadboard [4 ชิ้น]
14. USB Cable (Male Type-A to Male Micro B) [4 ชิ้น]
14. โมเดลสำหรับใช้ทำเป็นตู้เซฟที่ติดตั้งกลอนประตูสำหรับ Solenoid Door Lock แล้ว [1 ชิ้น]

เครื่องมือที่ใช้ในการพัฒนา :
Hardware - ArduinoIDE
Board Manager : https://dl.espressif.com/dl/package_esp32_index.json เลือก Board : Node32s
ใช้ Library : WiFi.h, HTTPClient.h, ArduinoJson.h, HardwareSerial.h,
Keypad.h by Mark Stanley, Alexander Brevig (GNU Lesser General Public License) [https://www.arduino.cc/reference/en/libraries/keypad/]
LiquidCrystal_I2C.h by Marco Schwartz [https://randomnerdtutorials.com/esp32-esp8266-i2c-lcd-arduino-ide/]
Backend 
server : heroku
database : MongoDB Atlas
library: flask, flask_cors, pymongo, json, urllib.parse, hashlib, math, random, smtplib, email.message, time
Frontend
server : heroku
framework : ReactJS
library : Material-UI, formik, yup, react-router-dom, axios

ลักษณะการทำงาน :
- เมื่อเปิดเครื่อง ตู้เซฟจะทำการสื่อสารกับ Backend server เพื่อรอให้พบว่ามี user ขอเข้าสู่ระบบใน web application แล้วทำการขอรหัส OTP มาแล้ว
- หลังจากนั้นตู้เซฟจะเข้าสู่สถานะที่รอการใส่รหัส OTP ด้วย Keypad ที่หน้าตู้เซฟ
- เมื่อใส่รหัส OTP แล้ว จะนำรหัสที่ใส่มาส่งไปตรวจสอบกับ Backend Server แล้วรับผลตรวจกับมาตัดสินใจทำงานต่อไป
- หากรหัสผ่านถูกต้อง Solenoid lock จะปลดล็อค แต่ถ้ารหัสผ่านผิด จะต้องใส่รหัสผ่านใหม่อีกครั้งจนกว่าจะถูกต้อง ทุกครั้งที่ใส่รหัสผ่านผิดจะมีเมลส่งไปแจ้ง user
- เมื่อตู้เซฟถูกปลดล็อคแล้ว ผู้ใช้จะต้องดึงประตูออก เพื่อให้ตู้เซฟ เข้าสู่สถานะรอการปิดประตู
- หลังจากนั้น ผู้ใช้งานจะปิดประตู ซึ่งจะทำให้ Light Blocking Sensor ทำงาน แล้ว Solenoid Lock จะล็อคกลอนประตูตู้เซฟ
- ในขณะที่ตู้เซฟอยู่ในสถานะล็อคแล้วกำลังรอการเปิดในครั้งถัดไป หากมีของวางอยู่ในตู้แล้วมีการพยายามเขย่าหรือทุบตู้อย่างรุนแรงจะมีการส่งเสียงร้องจาก passive buzzer และ ทุกครั้งที่มีเหตุการณ์เกิดจะมีเมลส่งไปแจ้ง user

การใช้งาน :
- บริเวณหน้าตู้เซฟจะมี QR code ที่มี url ไปยังหน้า web application เพื่อทำการเข้าสู่ระบบ
- ในการใช้งานครั้งแรกจะต้องทำการลงทะเบียน สร้างบัญชีโดยใช้ email address ที่หน้า web application
- หลังจากลงทะเบียนแล้ว สามารถเข้าสู่ระบบและขอรหัส OTP ได้ทันที
- นำรหัส OTP ที่ได้มาใส่ด้วยการกด Keypad ที่หน้าตู้เซฟให้ถูกต้อง
- เมื่อจอ LCD แจ้งว่าประตูปลดล็อคแล้วและได้ยินเสียงการทำงานของ Solenoid Lock จะสามารถเปิดประตูออกได้
- ทำการนำของเข้าตู้เซฟ หรือ นำของออกให้เรียบร้อย แล้วทำการปิดประตูตู้เซฟ
- เมื่อเลิกใช้งานแล้วจะต้องทำการกด deactivate ตู้เซฟที่หน้า web application เพื่อให้ผู้อื่นเข้าใช้งานตู้ได้ โดยจะต้องนำของออกจากตู้แล้ว

การทำงานของแต่ละ NodeMCU-32S :
Board 1 : ควบคุมการทำงาน Keypad, ติดต่อกับ Backend Server และ ติดต่อกับ Board 3 ด้วยคู่สาย Serial (Tx,Rx)
(Board 1 ใช้ Libraries : WiFi.h, HTTPClient.h, ArduinoJson.h, HardwareSerial.h และ Keypad.h)
Board 2 : ควบคุมการทำงาน Solenoid Door Lock ด้วย Relay, ควบคุมการทำงาน Light blocking sensor, ติดต่อกับ Backend Server และ ติดต่อกับ Board 4 ด้วยคู่สาย Serial (Tx,Rx)
(Board 2 ใช้ Libraries : WiFi.h, HTTPClient.h, ArduinoJson.h และ HardwareSerial.h)
Board 3 : ควบคุมการทำงาน LCD ด้วย I2C Interface และ ติดต่อกับ Board 1 ด้วยคู่สาย Serial (Tx,Rx)
(Board 3 ใช้ Libraries : HardwareSerial.h และ LiquidCrystal_I2C.h)
Board 4 : ควบคุมการทำงาน Micro switch, Shock sensor, Passive buzzer และ ติดต่อกับ Board 2 ด้วยคู่สาย Serial (Tx,Rx)
(Board 4 ใช้ Libraries : HardwareSerial.h)

เทคนิคที่ใช้ :
- ใช้แนวคิดเลียนแบบ state machine ในการควบคุมสถานะของตู้เซฟให้แบ่งการทำงานเป็นช่วงตามลำดับเหตุการณ์
- การแบ่งหน้าที่ให้มีส่วนติดต่อกับ Backend Server ให้น้อย แล้วใช้การติดต่อด้วยสาย Serial ในการส่งต่อข้อมูลที่ได้จาก Server แทน เพื่อลดภาระของ Server
- มีการใช้ Relay เพื่อควบคุมอุปกรณ์ที่มีย่านแรงดันไฟฟ้าการทำงานที่สูงกว่าที่ NodeMCU-32S จะกำเนิดแรงดันได้ (Solenoid Lock ทำงานที่ 12V แต่ NodeMCU-32S จ่ายแรงดันสูงสุดที่ 5V)
- ใช้ multitasking ของ NodeMCU-32S ใน Board 2 เพื่อทำ HTTP request POST method ระหว่าง API ในการแจ้งสถานะการวางวัตถุ และ API ในการแจ้งเตือนการถูกทุบตู้เซฟ
- ใช้ multitasking ของ NodeMCU-32S ใน Board 4 เพื่อการตรวจสอบสถานะการวางของวัตถุบน micro switch และ ตรวจสอบการทำงานของ shock sensor
- ใช้ timer ของ NodeMCU-32S ในการ debounce micro switch ของ Board 4
backend
- มีการใช้ urllib.parse เพื่อให้เป็นไปตามมาตรฐาน RFC 1808 ( https://datatracker.ietf.org/doc/html/rfc1808.html )
- มีการแยกส่วนที่เป็นความลับ เช่น username, password, salt ออกจาก source code หลัก
- มีการใช้ Simple Mail Transfer Protocol ( SMTP ) ในการส่ง email ให้ user
- มีการเข้า encrypt password ด้วยวิธีพิเศษ แม้ password input จะเหมือนกัน แต่จะได้ output ออกมาต่างกัน นอกจากนี้ยังมีการเต็ม salt ก่อนทำการ encrypt เพื่อให้มีความปลอดภัยมากยิ่งขึ้น
Frontend
- ใช้ formik เพื่อรับ input จาก user ได้แก่ email, username, password, OTP และใช้ yup ในการ validation
- ใช้ axios เพื่อทำ HTTP Request รับ/ส่งข้อมูลกับ Backend
- ใช้ React State Hook ในการเปลี่ยน State ของตัวแปรต่างๆที่จะนำมาแสดงบน UI
- ใช้ react-router-dom ในการกำหนด path ของหน้าเว็บเพจต่างๆ และทำ navigation
- ใช้ Material UI ในการตกแต่งหน้าเว็บไซต์

