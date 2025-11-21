"""
CUET IOTRIX Phase 2 - Consumer Side ESP32 Code
Enhanced with GPS tracking, improved notifications, and better error handling
"""

from machine import ADC, Pin, I2C
from time import sleep, time
import urequests 
import network

# Configuration
SERVER_IP = '192.168.1.106'
SERVER_PORT = 8000
CONSUMER_ID = 1  # Configure this per device

# Hardware Setup
# OLED Display (Optional - comment out if not available)
try:
    import ssd1306
    i2c = I2C(0, scl=Pin(22), sda=Pin(21))
    oled = ssd1306.SSD1306_I2C(128, 64, i2c)
    OLED_AVAILABLE = True
except:
    OLED_AVAILABLE = False
    print("OLED not available, using serial output only")

# Sensors
ultrasonic_trigger = Pin(5, Pin.OUT)
ultrasonic_echo = Pin(18, Pin.IN)
ldr = ADC(Pin(32))
ldr.atten(ADC.ATTN_11DB)

# LEDs for status indication
led_idle = Pin(25, Pin.OUT)      # White LED - Idle
led_pending = Pin(26, Pin.OUT)   # Yellow LED - Request Sent
led_rejected = Pin(27, Pin.OUT)  # Red LED - Rejected
led_accepted = Pin(14, Pin.OUT)  # Green LED - Accepted

# Buzzer for notifications
buzzer = Pin(12, Pin.OUT)

# Buttons for destination selection
btn_dest1 = Pin(23, Pin.IN, Pin.PULL_DOWN)  # PAHARTALI
btn_dest2 = Pin(4, Pin.IN, Pin.PULL_DOWN)   # NOAPARA
btn_dest3 = Pin(13, Pin.IN, Pin.PULL_DOWN)  # RAOJAN

# System states
STATE_IDLE = 0
STATE_PENDING = 1
STATE_REJECTED = 2
STATE_ACCEPTED = 3
STATE_COMPLETED = 4

current_state = STATE_IDLE
ride_request_id = None
last_status_check = 0
STATUS_CHECK_INTERVAL = 2  # Check every 2 seconds

# WiFi Connection
def connect_wifi():
    sta_if = network.WLAN(network.STA_IF)
    if not sta_if.isconnected():
        print('Connecting to WiFi...')
        sta_if.active(True)
        sta_if.connect('NMARS', '2122232425')  # Change to your WiFi credentials
        
        timeout = 20
        while not sta_if.isconnected() and timeout > 0:
            sleep(1)
            timeout -= 1
            
        if sta_if.isconnected():
            print('WiFi connected:', sta_if.ifconfig())
            return True
        else:
            print('WiFi connection failed')
            return False
    return True

# Display functions
def display_message(text):
    if OLED_AVAILABLE:
        oled.fill(0)
        oled.text(text, 5, 25)
        oled.show()
    print(text)

def set_state(state):
    global current_state
    current_state = state
    
    # Turn off all LEDs
    led_idle.value(0)
    led_pending.value(0)
    led_rejected.value(0)
    led_accepted.value(0)
    
    # Set appropriate LED and display
    if state == STATE_IDLE:
        led_idle.value(1)
        display_message("IDLE")
    elif state == STATE_PENDING:
        led_pending.value(1)
        display_message("REQUEST SENT")
    elif state == STATE_REJECTED:
        led_rejected.value(1)
        display_message("REJECTED")
        buzzer.value(1)
        sleep(0.5)
        buzzer.value(0)
    elif state == STATE_ACCEPTED:
        led_accepted.value(1)
        display_message("ACCEPTED!")
        # Double beep for acceptance
        for _ in range(2):
            buzzer.value(1)
            sleep(0.3)
            buzzer.value(0)
            sleep(0.2)
    elif state == STATE_COMPLETED:
        display_message("COMPLETED")
        # Triple beep for completion
        for _ in range(3):
            buzzer.value(1)
            sleep(0.2)
            buzzer.value(0)
            sleep(0.1)

# Ultrasonic sensor
def get_distance():
    ultrasonic_trigger.value(0)
    sleep(0.000002)
    ultrasonic_trigger.value(1)
    sleep(0.00001)
    ultrasonic_trigger.value(0)
    
    try:
        while ultrasonic_echo.value() == 0:
            pass
        start = time()
        
        while ultrasonic_echo.value() == 1:
            pass
        end = time()
        
        duration = end - start
        distance = (duration * 34300) / 2
        return distance
    except:
        return 999  # Return high value on error

# System verification
def verify_system():
    distance = get_distance()
    ldr_value = ldr.read()
    
    # Ultrasonic verification (10-20 cm range)
    ultrasonic_ok = 10.0 <= distance <= 20.0
    
    # LDR verification (low light)
    ldr_ok = ldr_value <= 1000
    
    return ultrasonic_ok and ldr_ok, distance, ldr_value

# API calls
def send_ride_request(destination):
    global ride_request_id
    
    try:
        url = f"http://{SERVER_IP}:{SERVER_PORT}/request/create?destination={destination}&consumer_id={CONSUMER_ID}&pickup_location=ESP_Device"
        print(f"Sending request to: {url}")
        
        response = urequests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            ride_request_id = data.get("request_id")
            print(f"Ride request created with ID: {ride_request_id}")
            set_state(STATE_PENDING)
            return True
        else:
            print(f"Server error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Error sending request: {e}")
        return False
    finally:
        try:
            response.close()
        except:
            pass

def check_ride_status():
    global ride_request_id, last_status_check
    
    if ride_request_id is None:
        return
    
    current_time = time()
    if current_time - last_status_check < STATUS_CHECK_INTERVAL:
        return
    
    last_status_check = current_time
    
    try:
        url = f"http://{SERVER_IP}:{SERVER_PORT}/request/check?id={ride_request_id}"
        response = urequests.get(url)
        
        if response.status_code == 200:
            status = response.json()
            print(f"Current status: {status}")
            
            if status == 'rejected':
                set_state(STATE_REJECTED)
                sleep(3)  # Show rejection for 3 seconds
                ride_request_id = None
                set_state(STATE_IDLE)
                
            elif status == 'accepted':
                if current_state != STATE_ACCEPTED:
                    set_state(STATE_ACCEPTED)
                    
            elif status == 'completed':
                set_state(STATE_COMPLETED)
                sleep(3)  # Show completion for 3 seconds
                ride_request_id = None
                set_state(STATE_IDLE)
                
    except Exception as e:
        print(f"Error checking status: {e}")
    finally:
        try:
            response.close()
        except:
            pass

# Main program
def main():
    print("CUET IOTRIX Phase 2 - Consumer ESP32")
    print("Connecting to WiFi...")
    
    if not connect_wifi():
        print("Failed to connect to WiFi. Please check credentials.")
        return
    
    print("System ready!")
    set_state(STATE_IDLE)
    
    verification_start = None
    VERIFICATION_TIME = 3  # Seconds
    
    while True:
        try:
            # Check ride status if we have an active request
            if ride_request_id is not None:
                check_ride_status()
            
            # Only process new requests if we're idle
            if current_state == STATE_IDLE:
                verified, distance, ldr_value = verify_system()
                
                # Print sensor values for debugging
                if int(time()) % 5 == 0:  # Every 5 seconds
                    print(f"Distance: {distance:.2f} cm, LDR: {ldr_value}")
                
                # Check if system is verified
                if verified:
                    if verification_start is None:
                        verification_start = time()
                        print("System verified! Hold for 3 seconds to request ride...")
                    
                    elif time() - verification_start >= VERIFICATION_TIME:
                        # Check which button is pressed
                        if btn_dest1.value():
                            print("Requesting ride to PAHARTALI")
                            send_ride_request("PAHARTALI")
                            verification_start = None
                            
                        elif btn_dest2.value():
                            print("Requesting ride to NOAPARA")
                            send_ride_request("NOAPARA")
                            verification_start = None
                            
                        elif btn_dest3.value():
                            print("Requesting ride to RAOJAN")
                            send_ride_request("RAOJAN")
                            verification_start = None
                else:
                    verification_start = None
            
            sleep(0.5)
            
        except Exception as e:
            print(f"Main loop error: {e}")
            sleep(1)

# Run the program
if __name__ == "__main__":
    main()
